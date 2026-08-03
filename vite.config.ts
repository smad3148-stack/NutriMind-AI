import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import * as dotenv from 'dotenv';

// Load environmental variables with overrides before computing configuration
dotenv.config({ override: true });

function bootstrapEnv() {
  // If env variables have merged space-separated values, parse and extract them.
  const envKeys = Object.keys(process.env);
  for (const key of envKeys) {
    const val = process.env[key];
    if (val && val.includes('=')) {
      const parts = val.split(/\s+/);
      for (const part of parts) {
        if (part.includes('=')) {
          const [subKey, subVal] = part.split('=');
          if (subKey && subVal) {
            let cleanedVal = subVal.trim();
            if (cleanedVal.startsWith('"') && cleanedVal.endsWith('"')) cleanedVal = cleanedVal.slice(1, -1);
            if (cleanedVal.startsWith("'") && cleanedVal.endsWith("'")) cleanedVal = cleanedVal.slice(1, -1);
            process.env[subKey] = cleanedVal.trim();
          }
        }
      }
      const firstPart = parts[0];
      if (firstPart && !firstPart.includes('=')) {
        process.env[key] = firstPart.trim();
      }
    }
  }
}
bootstrapEnv();

function sanitizeEnvValue(val: string | undefined): string {
  if (!val) return '';
  let cleaned = val.trim();
  
  // Strip outer quotes if present
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.trim();

  // If it's a known placeholder, return empty
  if (
    cleaned.startsWith('(') || 
    cleaned.includes('Paste your') || 
    cleaned.includes('your-') || 
    cleaned.includes('your_') ||
    cleaned.length < 5
  ) {
    return '';
  }

  // Supabase keys must be JWTs (starting with eyJ) or begin with sb_ (newer client keys). URL starts with http.
  if (!cleaned.startsWith('http') && !cleaned.startsWith('eyJ') && !cleaned.startsWith('sb_')) {
    return '';
  }
  
  return cleaned;
}

export default defineConfig(() => {
  const supabaseUrl = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL) || sanitizeEnvValue(process.env.VITE_SUPABASE_URL) || sanitizeEnvValue(process.env.SUPABASE_URL) || '';
  const supabaseAnonKey = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) || sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || sanitizeEnvValue(process.env.VITE_SUPABASE_ANON_KEY) || sanitizeEnvValue(process.env.SUPABASE_ANON_KEY) || '';

  console.log(`[Vite Build Config] Sanitized Supabase URL: ${supabaseUrl}`);
  console.log(`[Vite Build Config] Sanitized Supabase Anon Key Length: ${supabaseAnonKey.length}`);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseAnonKey),
    },
    server: {
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
