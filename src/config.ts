import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
  RAILWAY_API_TOKEN: z.string().optional(), // Optional for now, required for pro commands
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
  return parsed.data;
};

export const config = parseEnv();
