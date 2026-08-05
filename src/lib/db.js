import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be configured before starting Blindly.");
}

const globalForPrisma = globalThis;
const adapter = new PrismaPg({ connectionString });

export const db = globalForPrisma.cachedPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.cachedPrisma = db;
}
