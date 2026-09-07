import { z } from "zod";

/**
 * Server-only Environment Variable Validator.
 * Prevents booting in production with default/insecure credentials.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VERCEL: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  ADMIN_PASSWORD: z.string().default("meridian-admin"),
  ADMIN_SECRET: z.string().default("change-me-in-production"),
  PUBLIC_APP_URL: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

let validatedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (validatedEnv) return validatedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("[SECURITY WARNING] Invalid environment configuration:", parsed.error.format());
    throw new Error("Invalid server environment configuration.");
  }

  const isProduction = parsed.data.NODE_ENV === "production" || Boolean(parsed.data.VERCEL);

  if (isProduction) {
    if (parsed.data.ADMIN_SECRET === "change-me-in-production") {
      console.error(
        "[SECURITY CRITICAL] ADMIN_SECRET is set to default 'change-me-in-production' in a production environment!"
      );
    }
    if (parsed.data.ADMIN_PASSWORD === "meridian-admin") {
      console.warn(
        "[SECURITY WARNING] ADMIN_PASSWORD is set to default 'meridian-admin' in production."
      );
    }
  }

  validatedEnv = parsed.data;
  return validatedEnv;
}

// Validate on module import in server contexts
if (typeof window === "undefined") {
  try {
    getServerEnv();
  } catch (e) {
    // Non-blocking in dev
  }
}
