/**
 * User-scoped Supabase auth middleware for NutriMind-AI.
 *
 * `requireUserAuth` is intentionally permissive: it never rejects a request.
 * When a `Bearer` access token is present it validates it against Supabase
 * Auth and attaches the resolved user; otherwise it attaches a lightweight
 * demo user (for the no-credentials fallback mode the app already ships
 * with). A per-request anon Supabase client is attached as
 * `req.supabaseUserClient` so routes can read/write RLS-protected tables.
 *
 * `server.ts` route handlers treat a missing `req.supabaseUserClient` /
 * `req.user` as "database not configured" and fall through to in-memory
 * fallbacks, so this middleware must not throw or 401.
 */

import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  supabaseUserClient?: SupabaseClient | null;
}

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

function buildAnonClient(): SupabaseClient | null {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY);
  if (isPlaceholder(url) || isPlaceholder(anonKey)) {
    return null;
  }
  try {
    return createClient(url, anonKey, { auth: { persistSession: false } });
  } catch (err: any) {
    console.warn('[SUPABASE_USER] Failed to initialise anon client:', err?.message || err);
    return null;
  }
}

/**
 * Express middleware that authenticates a request and attaches
 * `req.user` and `req.supabaseUserClient`. Never rejects: missing creds
 * fall back to a demo user so the app keeps working offline.
 */
export async function requireUserAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const anonClient = buildAnonClient();
  const authHeader = req.header('Authorization') || req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (anonClient && token) {
    try {
      const { data, error } = await anonClient.auth.getUser(token);
      if (!error && data?.user) {
        req.user = { id: data.user.id, email: data.user.email };
        // Bearer-token client scopes queries to the authenticated user.
        req.supabaseUserClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
          token,
          { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } },
        );
        return next();
      }
    } catch (err: any) {
      console.warn('[SUPABASE_USER] Token validation failed, using fallback user:', err?.message || err);
    }
  }

  // Fallback: demo user + anon client (or null when unconfigured).
  req.user = { id: 'demo-user' };
  req.supabaseUserClient = anonClient;
  next();
}
