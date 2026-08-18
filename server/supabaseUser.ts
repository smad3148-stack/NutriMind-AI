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
import { getPrisma } from './prisma';
import { getSupabaseAdmin } from './supabaseAdmin';

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

/**
 * Looks up whether a user holds the 'admin' role in the `user_roles` table.
 * Queries Prisma first (direct Postgres when DATABASE_URL is set), then the
 * Supabase service-role client. **Fail-closed**: any lookup error or missing
 * lookup path denies admin access rather than granting it.
 */
async function lookupAdminRole(userId: string): Promise<boolean> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const role = await prisma.userRole.findUnique({
        where: { userId_role: { userId, role: 'admin' } },
        select: { role: true },
      });
      return role !== null;
    } catch (err: any) {
      console.warn('[SUPABASE_USER] Admin role lookup (Prisma) failed:', err?.message || err);
      return false; // Fail closed
    }
  }

  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      if (error) {
        console.warn('[SUPABASE_USER] Admin role lookup (Supabase) failed:', error.message);
        return false; // Fail closed
      }
      return data !== null;
    } catch (err: any) {
      console.warn('[SUPABASE_USER] Admin role lookup (Supabase) threw:', err?.message || err);
      return false; // Fail closed
    }
  }

  return false; // No lookup path available - deny
}

/**
 * Express middleware for admin-only routes. **Fail-closed** - it never falls
 * open:
 *
 * - Supabase not configured (sandbox/demo mode): allowed through, because the
 *   in-memory fallbacks contain no real data and no real users.
 * - Configured + missing or malformed token: 401.
 * - Configured + invalid/expired token: 401.
 * - Configured + valid token + 'admin' role in `user_roles`: allowed.
 * - Configured + valid token + no admin role: 403.
 * - Role lookup failure (DB error): denied (fail closed).
 */
export async function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const anonClient = buildAnonClient();
  if (!anonClient) {
    // Sandbox/demo mode: no Supabase configured, nothing real to protect.
    req.user = { id: 'demo-user' };
    req.supabaseUserClient = null;
    return next();
  }

  const authHeader = req.header('Authorization') || req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  let verifiedUser: { id: string; email?: string | undefined };
  try {
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: 'Invalid or expired authentication token.' });
      return;
    }
    verifiedUser = { id: data.user.id, email: data.user.email };
  } catch (err: any) {
    console.warn('[SUPABASE_USER] Admin token verification failed:', err?.message || err);
    res.status(401).json({ error: 'Authentication verification failed.' });
    return;
  }

  const isAdmin = await lookupAdminRole(verifiedUser.id);
  if (!isAdmin) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  req.user = { id: verifiedUser.id, email: verifiedUser.email ?? undefined };
  req.supabaseUserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    token,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } },
  );
  next();
}
