import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const optionalEnv = (key: string) => {
  try {
    return env(key);
  } catch {
    return undefined;
  }
};

// Prisma commands like `prisma db push` and migrations should use DIRECT_URL
// when Supabase provides a separate non-pgbouncer connection for schema changes.
const migrationDatabaseUrl = optionalEnv("DIRECT_URL") ?? env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: migrationDatabaseUrl
  }
});
