/**
 * Service-role Supabase admin client for NutriMind-AI.
 *
 * `getSupabaseAdmin()` returns a `SupabaseClient` configured with the
 * service role key (bypasses RLS for server-side admin queries), or `null`
 * when Supabase credentials are absent/placeholder. Returning `null` lets
 * every call site fall through to its in-memory fallback rather than
 * throwing — matching the existing defensive design of `server.ts`.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedAdmin: SupabaseClient | null | undefined;

function clean(value: string | undefined): string {
  if (!value) return '';
  let v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function isPlaceholder(value: string): boolean {
  return !value || /your-(supabase|project)|MY_|placeholder/i.test(value);
}

/**
 * Returns a cached service-role Supabase client, or `null` when not
 * configured. Safe to call on every request.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cachedAdmin !== undefined) {
    return cachedAdmin;
  }

  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Admin actions may legitimately fall back to the anon key when no service
  // role key is provisioned (logged by the caller).
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY);

  if (isPlaceholder(url) || (isPlaceholder(serviceKey) && isPlaceholder(anonKey))) {
    cachedAdmin = null;
    return null;
  }

  try {
    cachedAdmin = createClient(url, serviceKey || anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cachedAdmin;
  } catch (err: any) {
    console.warn('[SUPABASE_ADMIN] Failed to initialise admin client:', err?.message || err);
    cachedAdmin = null;
    return null;
  }
}
