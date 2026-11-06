/**
 * NEXORA Brand Governance Platform
 * Server Entry Point — Express/TypeScript
 *
 * Responsibilities:
 *  - Strict Zod environment validation (refuses boot if weak/missing)
 *  - Secrets isolated on server side (never in client bundle)
 *  - Helmet-style security headers, CSP, frame-ancestors 'none'
 *  - Strict CORS allowlist, rate limiting, and generic error handling
 *  - Central error handling with X-Request-ID
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'crypto';
import { env } from './config/env.js';
import { uploadRouter } from './routes/upload.js';
import { authProxyRouter } from './routes/authProxy.js';
import { aiProxyRouter } from './routes/aiProxy.js';
import { healthRouter } from './routes/health.js';

const PORT = parseInt(env.PORT, 10);
const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS.split(',').map(s => s.trim());

const app = express();

// Disable framework fingerprinting
app.disable('x-powered-by');

// ── Request ID & Permissions-Policy Middleware ──────────────────────────────
app.use((req, res, next) => {
  const reqId = (req.headers['x-request-id'] as string) || randomUUID();
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-ID', reqId);
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// ── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", ...ALLOWED_ORIGINS],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
}));

// ── Strict CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token', 'Accept'],
}));

// ── Body Parsing (Bounded to 2MB to prevent memory exhaustion) ───────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Global Rate Limit ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { detail: 'Too many requests. Please wait before retrying.' },
});
app.use(globalLimiter);

// ── Stricter Rate Limit for Sensitive Endpoints ──────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { detail: 'Too many authentication attempts. Please try again later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { detail: 'Upload rate limit reached. Please wait.' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/v1/auth', authLimiter, authProxyRouter);
app.use('/api/v1/upload', uploadLimiter, uploadRouter);
app.use('/api/v1/ai', aiProxyRouter);

// ── 404 Catch-all (Generic) ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ detail: 'Resource not found' });
});

// ── Central Secure Error Handler (No stack traces to clients) ────────────────
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const reqId = req.headers['x-request-id'] || 'unknown';
  console.error(`[SERVER ERROR] ReqID: ${reqId} Error: ${err.message}`);
  res.status(500).json({
    detail: 'An internal server error occurred.',
    request_id: reqId,
  });
});

app.listen(PORT, () => {
  console.log(`[NEXORA Server] Security initialized. Listening on port ${PORT}`);
  console.log(`[NEXORA Server] Environment: ${env.NODE_ENV}`);
});

export default app;
