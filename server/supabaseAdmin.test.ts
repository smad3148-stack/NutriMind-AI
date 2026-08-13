import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Real tests for the null-safe service-role Supabase admin client.
 * Mutates process.env and resets the module cache per scenario.
 */

async function importFresh() {
  vi.resetModules();
  return (await import('../server/supabaseAdmin')) as typeof import('../server/supabaseAdmin');
}

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
];

describe('server/supabaseAdmin', () => {
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

  it('returns null when no Supabase URL/key configured', async () => {
    const { getSupabaseAdmin } = await importFresh();
    expect(getSupabaseAdmin()).toBeNull();
  });

  it('returns null for placeholder credentials', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-supabase-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'your-supabase-service-role-key';
    const { getSupabaseAdmin } = await importFresh();
    expect(getSupabaseAdmin()).toBeNull();
  });

  it('builds a client when real URL + anon key are present (falls back to anon)', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realkey';
    const { getSupabaseAdmin } = await importFresh();
    const client = getSupabaseAdmin();
    expect(client).not.toBeNull();
    expect(typeof client?.from).toBe('function');
  });

  it('prefers service role key when both provided', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.servicekey';
    process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anonkey';
    const { getSupabaseAdmin } = await importFresh();
    expect(getSupabaseAdmin()).not.toBeNull();
  });
});
