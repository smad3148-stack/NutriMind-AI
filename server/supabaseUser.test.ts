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
  'SUPABASE_SERVICE_ROLE_KEY',
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

  it('passes through with no identity and null client when unconfigured (sandbox demo mode)', async () => {
    const { requireUserAuth } = await importFresh();
    const { req, res, next, nextCalled } = makeReqRes();
    await requireUserAuth(req as any, res, next as any);
    expect(nextCalled()).toBe(true);
    expect((req as any).user).toBeUndefined();
    expect((req as any).supabaseUserClient).toBeNull();
  });

  it('rejects with 401 when Supabase is configured but no token is sent (fail closed)', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realkey';
    const { requireUserAuth } = await importFresh();
    const { req, res, next, nextCalled } = makeReqRes();
    const spy = { statusCode: 0, jsonCalled: false };
    const resSpy = {
      status: (code: number) => {
        spy.statusCode = code;
        return {
          json: () => {
            spy.jsonCalled = true;
          },
        };
      },
    };
    await requireUserAuth(req as any, resSpy as any, next as any);
    expect(nextCalled()).toBe(false);
    expect(spy.statusCode).toBe(401);
    expect(spy.jsonCalled).toBe(true);
    expect((req as any).user).toBeUndefined();
  });

  it('rejects with 401 for an invalid bearer token (no fallback identity)', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realkey';
    const { requireUserAuth } = await importFresh();
    const { req, res, next, nextCalled } = makeReqRes();
    (req as any).header = () => 'Bearer definitely-not-a-valid-jwt';
    const spy = { statusCode: 0, jsonCalled: false };
    const resSpy = {
      status: (code: number) => {
        spy.statusCode = code;
        return {
          json: () => {
            spy.jsonCalled = true;
          },
        };
      },
    };
    await requireUserAuth(req as any, resSpy as any, next as any);
    expect(nextCalled()).toBe(false);
    expect(spy.statusCode).toBe(401);
    expect((req as any).user).toBeUndefined();
  });

  describe('requireAdminAuth (P0-01 fail-closed admin gate)', () => {
    function makeResSpy() {
      const spy = { statusCode: 0, jsonCalled: false };
      const res = {
        status: (code: number) => {
          spy.statusCode = code;
          return {
            json: () => {
              spy.jsonCalled = true;
            },
          };
        },
      };
      return { res, spy };
    }

    it('allows through when Supabase is unconfigured (sandbox demo mode)', async () => {
      const { requireAdminAuth } = await importFresh();
      const { req, res, next, nextCalled } = makeReqRes();
      await requireAdminAuth(req as any, res, next as any);
      expect(nextCalled()).toBe(true);
      expect((req as any).user).toEqual({ id: 'demo-user' });
    });

    it('rejects with 401 when Supabase is configured but no token is sent', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realkey';
      const { requireAdminAuth } = await importFresh();
      const { req, next, nextCalled } = makeReqRes();
      const { res: resSpy, spy } = makeResSpy();
      await requireAdminAuth(req as any, resSpy as any, next as any);
      expect(nextCalled()).toBe(false);
      expect(spy.statusCode).toBe(401);
      expect(spy.jsonCalled).toBe(true);
    });

    it('rejects with 401 for an invalid bearer token (verification failure)', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realkey';
      const { requireAdminAuth } = await importFresh();
      const { req, next, nextCalled } = makeReqRes();
      (req as any).header = () => 'Bearer definitely-not-a-valid-jwt';
      const { res: resSpy, spy } = makeResSpy();
      await requireAdminAuth(req as any, resSpy as any, next as any);
      expect(nextCalled()).toBe(false);
      expect(spy.statusCode).toBe(401);
    });
  });

  describe('getPublicSupabaseConfig (runtime client config for /api/auth/config)', () => {
    it('returns empty strings when no credentials are configured', async () => {
      const { getPublicSupabaseConfig } = await importFresh();
      expect(getPublicSupabaseConfig()).toEqual({ supabaseUrl: '', supabaseAnonKey: '' });
    });

    it('returns empty strings for placeholder credentials', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-supabase-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'your-supabase-anon-key';
      const { getPublicSupabaseConfig } = await importFresh();
      expect(getPublicSupabaseConfig()).toEqual({ supabaseUrl: '', supabaseAnonKey: '' });
    });

    it('returns the public URL and anon key when configured', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realanonkey';
      const { getPublicSupabaseConfig } = await importFresh();
      expect(getPublicSupabaseConfig()).toEqual({
        supabaseUrl: 'https://real-project.supabase.co',
        supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realanonkey',
      });
    });

    it('never includes the service-role key', async () => {
      process.env.SUPABASE_URL = 'https://real-project.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realanonkey';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.servicerole';
      const { getPublicSupabaseConfig } = await importFresh();
      const cfg = getPublicSupabaseConfig();
      expect(JSON.stringify(cfg)).not.toContain('servicerole');
      expect(cfg.supabaseUrl).toBe('https://real-project.supabase.co');
      expect(cfg.supabaseAnonKey).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realanonkey');
    });
  });
});
