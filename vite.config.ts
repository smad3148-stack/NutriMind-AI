import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// NOTE: Supabase credentials are intentionally NOT injected at build time.
// The client fetches its public Supabase config (URL + anon key) at runtime
// from GET /api/auth/config, so one build artifact works on any deployment
// and runtime-provided credentials always take effect.

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow proxied preview hosts (Google AI Studio preview, sandbox
      // tunnels). Vite 6 blocks unknown Host headers with a 403, which is
      // what produced the white screen in the AI Studio preview iframe.
      // This only affects the dev server; production serves static files.
      allowedHosts: true as const,
      // Disable HMR in sandbox/iframe preview mode using server.hmr=false fallback
      hmr: process.env.DISABLE_HMR !== 'false' ? false : {
        protocol: 'wss',
        clientPort: 443,
        overlay: false,
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
