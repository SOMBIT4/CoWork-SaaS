import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum([
      "development",
      "test",
      "production",
    ])
    .default("development"),

  DATABASE_URL: z
    .string()
    .min(
      1,
      "DATABASE_URL is required.",
    ),

  AUTH_SECRET: z
    .string()
    .min(
      32,
      "AUTH_SECRET must be at least 32 characters.",
    ),

  APP_URL: z
    .string()
    .url(
      "APP_URL must be a valid URL.",
    ),

  RESEND_API_KEY: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value === ""
        ? undefined
        : value,
    ),

  EMAIL_FROM: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value === ""
        ? undefined
        : value,
    ),

  AUTH_GOOGLE_ID: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value === ""
        ? undefined
        : value,
    ),

  AUTH_GOOGLE_SECRET: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value === ""
        ? undefined
        : value,
    ),

  STRIPE_SECRET_KEY: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value === ""
        ? undefined
        : value,
    ),

  STRIPE_WEBHOOK_SECRET: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value === ""
        ? undefined
        : value,
    ),
});

const parsed =
  serverEnvSchema.safeParse({
    NODE_ENV:
      process.env.NODE_ENV,

    DATABASE_URL:
      process.env.DATABASE_URL,

    AUTH_SECRET:
      process.env.AUTH_SECRET,

    APP_URL:
      process.env.APP_URL,

    RESEND_API_KEY:
      process.env.RESEND_API_KEY,

    EMAIL_FROM:
      process.env.EMAIL_FROM,

    AUTH_GOOGLE_ID:
      process.env.AUTH_GOOGLE_ID,

    AUTH_GOOGLE_SECRET:
      process.env.AUTH_GOOGLE_SECRET,

    STRIPE_SECRET_KEY:
      process.env.STRIPE_SECRET_KEY,

    STRIPE_WEBHOOK_SECRET:
      process.env.STRIPE_WEBHOOK_SECRET,
  });

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.treeifyError(
      parsed.error,
    ),
  );

  throw new Error(
    "Invalid environment variables.",
  );
}

export const env =
  parsed.data;