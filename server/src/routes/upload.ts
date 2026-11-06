/**
 * Secure File Upload Route
 *
 * Accepts advertisement creatives and brand knowledge documents from the
 * frontend, validates them, and forwards the binary to FastAPI via
 * multipart/form-data.
 *
 * Security enforced here (not in the browser):
 *  - MIME type allowlist (PDF, DOCX, PPTX, PNG, JPG)
 *  - File size cap (20 MB per file, 60 MB total)
 *  - Filename sanitisation (strip path traversal characters)
 *  - Bearer token forwarded to FastAPI for org-scoped authorization
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

export const uploadRouter = Router();

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL ?? 'http://127.0.0.1:8000';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/jpg',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg']);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 3 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not permitted. Allowed: PDF, DOCX, PPTX, PNG, JPG.`));
    }
  },
});

/** Sanitise filename — remove path separators and null bytes. */
function sanitiseFilename(original: string): string {
  return path.basename(original).replace(/[/\\?%*:|"<>\x00]/g, '_');
}

uploadRouter.post(
  '/advertisement',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file received.' });
      return;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'Missing Authorization header.' });
      return;
    }

    const safeFilename = sanitiseFilename(req.file.originalname);
    const requestId = randomUUID();

    try {
      const formData = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append('file', blob, safeFilename);

      // Forward any additional form fields
      for (const [key, val] of Object.entries(req.body)) {
        formData.append(key, String(val));
      }

      const response = await fetch(`${FASTAPI_BASE}/api/v1/advertisements/upload`, {
        method: 'POST',
        headers: {
          Authorization: authHeader as string,
          'X-Request-ID': requestId,
        },
        body: formData,
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error('[Upload] FastAPI forwarding error:', err);
      res.status(502).json({ error: 'Upload service temporarily unavailable.' });
    }
  }
);

uploadRouter.post(
  '/knowledge',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file received.' });
      return;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'Missing Authorization header.' });
      return;
    }

    const safeFilename = sanitiseFilename(req.file.originalname);
    const requestId = randomUUID();

    try {
      const formData = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append('file', blob, safeFilename);

      for (const [key, val] of Object.entries(req.body)) {
        formData.append(key, String(val));
      }

      const response = await fetch(`${FASTAPI_BASE}/api/v1/knowledge/upload`, {
        method: 'POST',
        headers: {
          Authorization: authHeader as string,
          'X-Request-ID': requestId,
        },
        body: formData,
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error('[Upload] FastAPI forwarding error:', err);
      res.status(502).json({ error: 'Upload service temporarily unavailable.' });
    }
  }
);

