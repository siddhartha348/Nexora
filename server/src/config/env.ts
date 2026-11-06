import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('3001'),
  FASTAPI_BASE_URL: z.string().url().default('http://127.0.0.1:8000'),
  SECRET_KEY: z.string().min(32, {
    message: 'SECRET_KEY must be at least 32 characters long to ensure cryptographic security.',
  }),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  GEMINI_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

let envConfig: ValidatedEnv;

try {
  envConfig = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ [CRITICAL SECURITY ERROR] Server environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('Server boot refused due to missing or weak security configurations.');
    process.exit(1);
  }
  throw error;
}

export const env = envConfig;

