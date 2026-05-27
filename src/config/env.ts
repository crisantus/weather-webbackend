import dotenv from "dotenv";
import { z } from "zod";

// Load variables from server/.env into process.env.
dotenv.config();

// Validate required environment variables before the server starts.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  OPENWEATHER_API_KEY: z.string().min(1),
  OPENWEATHER_BASE_URL: z.string().url().default("https://api.openweathermap.org/data/2.5")
});

// Export a typed env object used by the rest of the server.
export const env = envSchema.parse(process.env);
