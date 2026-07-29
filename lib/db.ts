import { PrismaClient } from "@prisma/client";

// Singleton so dev hot-reload doesn't open a new pool on every edit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Kept on the global in every environment so a serverless instance reuses one
// pool across invocations (CHAT-AND-POLISH.md Task 2).
globalForPrisma.prisma = db;
