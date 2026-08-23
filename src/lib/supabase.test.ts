import { describe, it, expect, vi } from 'vitest';

/**
 * Real tests for the runtime Supabase configuration in src/lib/supabase.ts.
 * The client bundle carries no build-time credentials: getSupabase() must
 * return null until setSupabaseRuntimeConfig() installs the config fetched
 * from GET /api/auth/config at app startup.
 */

async function importFresh() {
  vi.resetModules();
  return (await import('./supabase')) as typeof import('./supabase');
}

const VALID_CONFIG = {
  supabaseUrl: 'https://real-project.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.realanonkey',
};

describe('src/lib/supabase runtime configuration', () => {
  it('returns null before any runtime config is installed', async () => {
    const { getSupabase, isSupabaseConfigured, getSupabaseRuntimeConfig } = await importFresh();
    expect(isSupabaseConfigured()).toBe(false);
    expect(getSupabaseRuntimeConfig()).toBeNull();
    expect(getSupabase()).toBeNull();
  });

  it('returns null when the server reports an empty config (demo mode)', async () => {
    const { getSupabase, isSupabaseConfigured, setSupabaseRuntimeConfig } = await importFresh();
    setSupabaseRuntimeConfig({ supabaseUrl: '', supabaseAnonKey: '' });
    expect(isSupabaseConfigured()).toBe(false);
    expect(getSupabase()).toBeNull();
  });

  it('returns null when only one of URL / anon key is provided', async () => {
    const { getSupabase, setSupabaseRuntimeConfig } = await importFresh();
    setSupabaseRuntimeConfig({ supabaseUrl: VALID_CONFIG.supabaseUrl, supabaseAnonKey: '' });
    expect(getSupabase()).toBeNull();
    setSupabaseRuntimeConfig({ supabaseUrl: '', supabaseAnonKey: VALID_CONFIG.supabaseAnonKey });
    expect(getSupabase()).toBeNull();
  });

  it('creates and caches a client once a valid runtime config is installed', async () => {
    const { getSupabase, isSupabaseConfigured, setSupabaseRuntimeConfig } = await importFresh();
    setSupabaseRuntimeConfig(VALID_CONFIG);
    expect(isSupabaseConfigured()).toBe(true);
    const client = getSupabase();
    expect(client).not.toBeNull();
    expect(client.auth).toBeDefined();
    expect(getSupabase()).toBe(client);
  });

  it('re-configuration resets the cached client', async () => {
    const { getSupabase, setSupabaseRuntimeConfig } = await importFresh();
    setSupabaseRuntimeConfig(VALID_CONFIG);
    const first = getSupabase();
    expect(first).not.toBeNull();
    setSupabaseRuntimeConfig({ supabaseUrl: '', supabaseAnonKey: '' });
    expect(getSupabase()).toBeNull();
    setSupabaseRuntimeConfig(VALID_CONFIG);
    const second = getSupabase();
    expect(second).not.toBeNull();
    expect(second).not.toBe(first);
  });
});
