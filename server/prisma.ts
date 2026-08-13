/**
 * Prisma Client singleton for NutriMind-AI.
 *
 * `getPrisma()` is intentionally null-safe: it returns `null` whenever a
 * Postgres `DATABASE_URL` is not configured or the client failed to
 * initialise. Every call site in `server.ts` already treats a `null` result
 * as "database unavailable, fall through to the in-memory / Supabase
 * fallback", so this module must never throw on missing configuration.
 */

import { PrismaClient } from '@prisma/client';

let cachedClient: PrismaClient | null | undefined;

function shouldEnablePrisma(): boolean {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return false;
  // Reject placeholder values from .env.example / unset secrets.
  const placeholder = /your-(db-password|project|supabase)/i.test(url);
  return !placeholder && url.startsWith('postgresql');
}

/**
 * Returns a shared `PrismaClient`, or `null` when the database is not
 * configured. Safe to call on every request.
 */
export function getPrisma(): PrismaClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!shouldEnablePrisma()) {
    cachedClient = null;
    return null;
  }

  try {
    const client = new PrismaClient({
      log: ['warn', 'error'],
    });
    cachedClient = client;
    return client;
  } catch (err: any) {
    console.warn('[PRISMA] Failed to initialise Prisma client:', err?.message || err);
    cachedClient = null;
    return null;
  }
}

/**
 * Logs a Prisma error and downgrades it to a non-fatal warning. Call sites
 * use the Supabase fallback after this returns, so we never re-throw.
 */
export function handlePrismaError(err: any, context: string): void {
  const message = err?.message || String(err);
  // Prisma already-transacted connection errors are noisy; surface just the
  // first line to keep logs readable.
  const firstLine = message.split('\n')[0];
  console.warn(`[PRISMA_ERROR] ${context}: ${firstLine}`);
}
