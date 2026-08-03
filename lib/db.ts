import { PrismaClient } from "@prisma/client";

/**
 * Prisma, with transient connection failures retried.
 *
 * Neon's free tier suspends the compute after a few minutes idle. The first
 * query to arrive after that wakes it, but the wake takes longer than
 * Prisma's connect timeout, so that query dies with P1001 "Can't reach
 * database server" — and because our pages fetch inside Promise.all, one
 * unlucky query takes the whole render down. The same thing happens in
 * reverse when Neon drops a pooled connection it considers idle, which
 * surfaces as "Connection closed".
 *
 * Neither means the database is actually unavailable: the retry lands once
 * the compute is up, usually on the first or second attempt. Anything that is
 * not a connection fault is rethrown untouched, so a genuine query bug still
 * fails immediately and loudly.
 */

/** Prisma codes that mean "the connection failed", not "the query was wrong". */
const RETRYABLE_CODES = new Set([
  "P1001", // can't reach database server
  "P1002", // server reached but timed out
  "P1008", // operation timed out
  "P1017", // server has closed the connection
  "P2024", // timed out fetching a connection from the pool
]);

const RETRYABLE_MESSAGE =
  /can't reach database server|connection closed|kind: closed|timed out fetching|connection reset|econnreset/i;

function isTransient(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (code && RETRYABLE_CODES.has(code)) return true;
  const message = (error as { message?: string } | null)?.message ?? "";
  return RETRYABLE_MESSAGE.test(message);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 0.3s, 0.9s, 2.7s — about a Neon cold start across the three waits. */
const BACKOFF_MS = [300, 900, 2700];

function createClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return base.$extends({
    query: {
      async $allOperations({ query, args, model, operation }) {
        let lastError: unknown;

        for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            if (!isTransient(error)) throw error;
            lastError = error;

            if (attempt < BACKOFF_MS.length) {
              const wait = BACKOFF_MS[attempt];
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  `[db] ${model ?? "raw"}.${operation} — connection failed, ` +
                    `retrying in ${wait}ms (${attempt + 1}/${BACKOFF_MS.length})`,
                );
              }
              await sleep(wait);
            }
          }
        }

        throw lastError;
      },
    },
  });
}

type ExtendedClient = ReturnType<typeof createClient>;

// Singleton so dev hot-reload doesn't open a new pool on every edit.
const globalForPrisma = globalThis as unknown as { prisma?: ExtendedClient };

export const db = globalForPrisma.prisma ?? createClient();

// Kept on the global in every environment so a serverless instance reuses one
// pool across invocations (CHAT-AND-POLISH.md Task 2).
globalForPrisma.prisma = db;
