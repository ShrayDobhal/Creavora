import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

let prisma;

const getPrismaClient = () => {
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
};

if (process.env.NODE_ENV === "production") {
  prisma = getPrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = getPrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
