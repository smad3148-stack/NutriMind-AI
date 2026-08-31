/**
 * Vercel Serverless Function: catch-all for every /api/* request.
 *
 * Vercel cannot run the long-lived Express server, so without this function no
 * /api route exists on Vercel deployments: the platform serves the SPA
 * fallback instead, the client's fetch('/api/auth/config') fails, and
 * getSupabase() stays null ("Authentication backend is not configured").
 *
 * IMPORTANT: we import the *bundled* build output (dist/server.cjs, produced by
 * `npm run build` via esbuild) rather than server.ts directly. The server
 * sources use extensionless relative imports ("./server/supabaseAdmin"), which
 * Node's ESM loader in the Vercel runtime rejects with ERR_MODULE_NOT_FOUND /
 * ERR_UNSUPPORTED_DIR_IMPORT, crashing every invocation. The esbuild bundle has
 * all of those resolved at build time.
 *
 * The Express app is built once per function instance (cold start) and reused.
 * Importing the bundle is side-effect safe: startServer() is skipped when
 * process.env.VERCEL is set.
 */

import type { Request, Response } from 'express';
// @ts-ignore - CommonJS bundle emitted by the build step, no type declarations.
import serverBundle from '../dist/server.cjs';

type CreateApp = () => Promise<(req: Request, res: Response) => unknown>;

const createApp: CreateApp = (serverBundle as any).createApp ?? (serverBundle as any).default?.createApp;

let appPromise: ReturnType<CreateApp> | null = null;

export default async function handler(req: Request, res: Response) {
  if (typeof createApp !== 'function') {
    res.status(500).json({ error: 'Server bundle missing createApp export' });
    return;
  }
  if (!appPromise) {
    appPromise = createApp();
  }
  const app = await appPromise;
  return app(req, res);
}
