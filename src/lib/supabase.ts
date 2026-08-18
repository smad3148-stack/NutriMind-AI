/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

function sanitizeClientEnvValue(val: string | undefined): string {
  if (!val) return '';
  let cleaned = val.trim();
  
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

// Client-side environment variables accessed via import.meta.env for full Vite integration
const supabaseUrl = 
  sanitizeClientEnvValue((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL) || 
  sanitizeClientEnvValue((import.meta as any).env?.VITE_SUPABASE_URL) || 
  sanitizeClientEnvValue((import.meta as any).env?.SUPABASE_URL) || 
  '';

const supabaseAnonKey = 
  sanitizeClientEnvValue((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) || 
  sanitizeClientEnvValue((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  sanitizeClientEnvValue((import.meta as any).env?.SUPABASE_ANON_KEY) || 
  '';

let supabaseInstance: any = null;
let warnMissingSecretsOnce = false;

/**
 * Lazy initialization of Supabase client using @supabase/ssr and @supabase/supabase-js.
 * This prevents crashes on startup if keys are not defined in the workspace yet.
 */
export function getSupabase() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      if (!warnMissingSecretsOnce) {
        console.warn(
          '⚠️ [SUPABASE_MISSING_SECRETS] VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is undefined. ' +
          'Enterprise database features will fallback to client-side sandboxed simulation mode. ' +
          'Configure these keys in your Settings Secrets block to connect real live databases.'
        );
        warnMissingSecretsOnce = true;
      }
      return null;
    }
    try {
      // Use @supabase/ssr browser client creator
      supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('Failed to initialize @supabase/ssr client, falling back to standard client:', err);
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
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
