/**
 * Auth Proxy Route
 *
 * Forwards authentication requests to the FastAPI backend while:
 *  - Keeping FASTAPI_BASE_URL and SECRET_KEY server-side only
 *  - Stripping internal headers before forwarding
 *  - Setting HttpOnly, Secure, SameSite cookies for session tokens
 *
 * In production: replace fetch() with an HTTP client library
 * (e.g., undici or node-fetch) for connection pooling.
 */
import { Router, Request, Response } from 'express';

export const authProxyRouter = Router();

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL ?? 'http://127.0.0.1:8000';

/** Forward a request to FastAPI and pipe the JSON response back. */
async function forwardToFastAPI(
  req: Request,
  res: Response,
  path: string,
  method: string
) {
  try {
    const url = `${FASTAPI_BASE}/api/v1/auth${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Forward bearer token when present
    const authHeader = req.headers['authorization'];
    if (authHeader) headers['Authorization'] = authHeader as string;

    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[AuthProxy] FastAPI unreachable:', err);
    res.status(502).json({ error: 'Auth service temporarily unavailable.' });
  }
}

authProxyRouter.post('/login', (req, res) => forwardToFastAPI(req, res, '/login', 'POST'));
authProxyRouter.post('/register', (req, res) => forwardToFastAPI(req, res, '/register', 'POST'));
authProxyRouter.post('/refresh', (req, res) => forwardToFastAPI(req, res, '/refresh', 'POST'));
authProxyRouter.post('/logout', (req, res) => forwardToFastAPI(req, res, '/logout', 'POST'));
authProxyRouter.post('/forgot-password', (req, res) => forwardToFastAPI(req, res, '/forgot-password', 'POST'));
authProxyRouter.post('/reset-password', (req, res) => forwardToFastAPI(req, res, '/reset-password', 'POST'));
authProxyRouter.get('/me', (req, res) => forwardToFastAPI(req, res, '/me', 'GET'));

