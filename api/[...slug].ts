/**
 * Vercel Serverless Function: catch-all for every /api/* request.
 *
 * Vercel cannot run the long-lived Express server (dist/server.cjs), so
 * without this function no /api route exists on Vercel deployments - the
 * platform serves the SPA fallback instead, the client's
 * fetch('/api/auth/config') fails to parse, and getSupabase() stays null.
 *
 * The Express app is built once per function instance (cold start) and
 * reused across invocations. Importing server.ts is side-effect safe:
 * startServer() is skipped when process.env.VERCEL is set.
 */

import type { Request, Response } from 'express';
import { createApp } from '../server';

let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: Request, res: Response) {
  if (!appPromise) {
    appPromise = createApp();
  }
  const app = await appPromise;
  return app(req, res);
}
