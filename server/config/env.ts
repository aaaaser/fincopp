import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().optional(),
  APP_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: 'development' as const,
      PORT: 3000,
      DATABASE_URL: process.env.DATABASE_URL,
      APP_URL: process.env.APP_URL,
    };

export function parseMysqlConnectionInfo(databaseUrl?: string): {
  configured: boolean;
  host: string | null;
  port: string | null;
  database: string | null;
  user: string | null;
} {
  if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
    return {
      configured: false,
      host: null,
      port: null,
      database: null,
      user: null,
    };
  }

  try {
    const parsedUrl = new URL(databaseUrl);
    return {
      configured: true,
      host: parsedUrl.hostname || null,
      port: parsedUrl.port || '3306',
      database: parsedUrl.pathname.replace(/^\//, '') || null,
      user: parsedUrl.username || null,
    };
  } catch {
    return {
      configured: false,
      host: null,
      port: null,
      database: null,
      user: null,
    };
  }
}
