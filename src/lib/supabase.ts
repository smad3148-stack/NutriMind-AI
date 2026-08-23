/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Runtime Supabase configuration, fetched from the server at startup
 * (GET /api/auth/config). The project URL and anon key are public by design
 * (the anon key only grants access permitted by RLS policies), so they are
 * delivered per-deployment at runtime instead of being baked into the
 * client bundle at build time.
 */
export interface SupabaseRuntimeConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

let runtimeConfig: SupabaseRuntimeConfig | null = null;
let supabaseInstance: any = null;
let warnMissingSecretsOnce = false;

/**
 * Stores the runtime configuration fetched from the server. Must be called
 * before getSupabase() is expected to return a client. Resets any cached
 * client so a re-configuration takes effect.
 */
export function setSupabaseRuntimeConfig(config: SupabaseRuntimeConfig): void {
  runtimeConfig = config;
  supabaseInstance = null;
}

export function getSupabaseRuntimeConfig(): SupabaseRuntimeConfig | null {
  return runtimeConfig;
}

export function isSupabaseConfigured(): boolean {
  return !!(runtimeConfig?.supabaseUrl && runtimeConfig?.supabaseAnonKey);
}

/**
 * Lazy initialization of Supabase client using @supabase/ssr and @supabase/supabase-js.
 * Returns null until setSupabaseRuntimeConfig() has provided a valid
 * configuration - the app fetches it from /api/auth/config at startup.
 */
export function getSupabase() {
  if (!supabaseInstance) {
    if (!isSupabaseConfigured()) {
      // Only warn once the server has answered with an empty config - a null
      // runtimeConfig just means the startup fetch has not completed yet.
      if (runtimeConfig && !warnMissingSecretsOnce) {
        console.warn(
          '\u26a0\ufe0f [SUPABASE_MISSING_SECRETS] The server did not provide a Supabase URL / anon key via /api/auth/config. ' +
          'Database features will fall back to sandboxed demo mode. ' +
          'Configure SUPABASE_URL and SUPABASE_ANON_KEY (or the NEXT_PUBLIC_* equivalents) on the server.'
        );
        warnMissingSecretsOnce = true;
      }
      return null;
    }
    const { supabaseUrl, supabaseAnonKey } = runtimeConfig!;
    try {
      // Use @supabase/ssr browser client creator
      supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('Failed to initialize @supabase/ssr client, falling back to standard client:', err);
      try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      } catch (fallbackErr) {
        console.warn('Failed to initialize Supabase client:', fallbackErr);
        return null;
      }
    }
  }
  return supabaseInstance;
}


/**
 * Helper to upload files to Supabase Storage bucket
 */
export async function uploadMealScan(file: File, userId: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    // Path follows /{user_id}/meal-scans/{filename}
    const filePath = `${userId}/meal-scans/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('meal-scans')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Since the bucket is secure and private, generate a long-lived signed URL for safe rendering
    const { data, error: signedError } = await supabase.storage
      .from('meal-scans')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiration for production convenience

    if (signedError || !data) {
      // Fallback to public URL if private bucket config is not fully initialized
      const { data: publicData } = supabase.storage
        .from('meal-scans')
        .getPublicUrl(filePath);
      return publicData?.publicUrl || null;
    }

    return data.signedUrl;
  } catch (err: any) {
    console.warn('[Supabase Storage] Optional meal scan image upload bypassed (expected sandbox fallback if unlinked):', err?.message || err);
    return null;
  }
}
