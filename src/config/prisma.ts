import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

// Prisma 7 uses a driver adapter for direct PostgreSQL connections.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

// Shared Prisma Client instance for all database queries.
export const prisma = new PrismaClient({ adapter });
