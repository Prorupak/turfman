import { z } from 'nestjs-zod/z';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('production'),

  // Ports
  PORT: z.coerce.number().default(5000),

  // URLs
  PUBLIC_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url().startsWith('mongodb+srv://'),

  // Redis
  REDIS_URL: z.string().url().startsWith('redis://').optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().default(6379).optional(),

  // Authentication Secrets
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES: z.coerce.number().default(5000),
  ACCESS_TOKEN_EXPIRES: z.coerce.number().default(5000),

  // Mail Server
  MAIL_FROM: z.string().includes('@').optional().default('noreply@localhost'),
  SMTP_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith('smtp://') || url.startsWith('smtps://'))
    .optional(),

  // Feature Flags (Optional)
  DISABLE_SIGNUPS: z
    .string()
    .default('false')
    .transform((s) => s !== 'false' && s !== '0'),
  DISABLE_EMAIL_AUTH: z
    .string()
    .default('false')
    .transform((s) => s !== 'false' && s !== '0'),

  // GitHub (OAuth)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().optional(),

  // Google (OAuth)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Dropbox (storage)
  DROPBOX_CLIENT_ID: z.string(),
  DROPBOX_CLIENT_SECRET: z.string(),
  DROPBOX_REFRESH_TOKEN: z.string(),

  // sendgrid (mail)
  CONFIRM_EMAIL_URL: z.string().url().optional(),
  SENDGRID_SENDER: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),

  // auth
  RESET_PASSWORD_URL: z.string().url().optional(),

  // client_url
  CLIENT_URL: z.string().url().optional(),

  // allowed origins
  ALLOWED_ORIGINS: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;
