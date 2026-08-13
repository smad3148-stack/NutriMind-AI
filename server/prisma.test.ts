import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Real (non-mocked) tests for the null-safe Prisma client helper.
 * Exercises the actual env-driven branching by mutating process.env.
 * server/prisma.ts caches its client in a module-level singleton, so we
 * reset the module cache per scenario to force re-evaluation.
 */

async function importFresh() {
  vi.resetModules();
  return (await import('../server/prisma')) as typeof import('../server/prisma');
}

describe('server/prisma', () => {
  const envKeys = ['DATABASE_URL', 'POSTGRES_URL'];
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of envKeys) saved[k] = process.env[k];
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
  });

  afterEach(() => {
    for (const k of envKeys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('returns null when DATABASE_URL is absent', async () => {
    const { getPrisma } = await importFresh();
    expect(getPrisma()).toBeNull();
  });

  it('returns null for placeholder DATABASE_URL values', async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:your-db-password@db.your-project.supabase.co:5432/postgres';
    const { getPrisma } = await importFresh();
    expect(getPrisma()).toBeNull();
  });

  it('attempts to construct a client for a real-looking postgres URL', async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:realpassword@db.example.supabase.co:5432/postgres';
    const { getPrisma } = await importFresh();
    // A real URL returns a PrismaClient instance (it does not connect yet).
    const client = getPrisma();
    expect(client).not.toBeNull();
    expect(typeof client).toBe('object');
  });

  it('handlePrismaError logs and never throws', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { handlePrismaError } = await importFresh();
    expect(() => handlePrismaError(new Error('boom\nsecond line'), 'ctx')).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
