import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
  // Support both RAILWAY_API_TOKEN (my instruction) and RAILWAY_TOKEN (Railway default recomendation)
  RAILWAY_API_TOKEN: z.string().optional(),
  RAILWAY_TOKEN: z.string().optional(),
  RAILWAY_PROJECT_ID: z.string().optional(),
  CHANNEL_ID: z.string().min(1, "CHANNEL_ID is required for notifications"),
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
    throw new Error("Invalid environment variables");
  }

  // Normalize token
  const token = parsed.data.RAILWAY_API_TOKEN || parsed.data.RAILWAY_TOKEN;
  if (!token) {
    console.warn(
      "⚠️ No Railway Token found (RAILWAY_API_TOKEN or RAILWAY_TOKEN). API commands will fail.",
    );
  }

  return { ...parsed.data, RAILWAY_API_TOKEN: token };
};

export const config = parseEnv();
