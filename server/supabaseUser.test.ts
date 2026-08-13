import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response } from 'express';

/**
 * Real tests for requireUserAuth middleware. Exercises the permissive
 * fallback path (no creds -> demo user + null client) and the anon-client
 * construction path. Uses real env mutation, no mocks of the module logic.
 */

async function importFresh() {
  vi.resetModules();
  return (await import('../server/supabaseUser')) as typeof import('../server/supabaseUser');
}

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
];

function makeReqRes() {
  const req = { header: () => undefined } as unknown as Request & {
    user?: any;
    supabaseUserClient?: any;
  };
  const res = {} as Response;
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };
  return { req, res, next, nextCalled: () => nextCalled };
}

describe('server/supabaseUser', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('attaches demo user and null client when unconfigured (never rejects)', async () => {
    const { requireUserAuth } = await importFresh();
    const { req, res, next, nextCalled } = makeReqRes();
    await requireUserAuth(req as any, res, next as any);
    expect(nextCalled()).toBe(true);
    expect((req as any).user).toEqual({ id: 'demo-user' });
    expect((req as any).supabaseUserClient).toBeNull();
  });

  it('attaches an anon client when real Supabase creds are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realkey';
    const { requireUserAuth } = await importFresh();
    const { req, res, next, nextCalled } = makeReqRes();
    await requireUserAuth(req as any, res, next as any);
    expect(nextCalled()).toBe(true);
    expect((req as any).user).toEqual({ id: 'demo-user' });
    expect((req as any).supabaseUserClient).not.toBeNull();
    expect(typeof (req as any).supabaseUserClient.from).toBe('function');
  });
});
