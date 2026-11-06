/**
 * AI Proxy Route
 *
 * Proxies AI inference calls from the frontend to the FastAPI backend.
 * The GEMINI_API_KEY and OLLAMA credentials never leave this server.
 *
 * Zero-retention headers are injected here for supported providers
 * before the request is forwarded to the FastAPI guardian services.
 */
import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

export const aiProxyRouter = Router();

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL ?? 'http://127.0.0.1:8000';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'AI request rate limit exceeded. Please wait.' },
});

aiProxyRouter.use(aiLimiter);

async function forwardAI(req: Request, res: Response, fastapiPath: string) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ error: 'Missing Authorization header.' });
    return;
  }

  try {
    const response = await fetch(`${FASTAPI_BASE}${fastapiPath}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader as string,
        // Zero-retention hint for providers that honour it
        'X-No-Train': '1',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[AI Proxy] Error:', err);
    res.status(502).json({ error: 'AI service temporarily unavailable.' });
  }
}

// Advertisement audit trigger
aiProxyRouter.post('/audit/:adId', (req, res) =>
  forwardAI(req, res, `/api/v1/advertisements/${req.params.adId}/process`)
);

// Recall sweep trigger
aiProxyRouter.post('/recall/evaluate', (req, res) =>
  forwardAI(req, res, `/api/v1/recall/evaluate`)
);

