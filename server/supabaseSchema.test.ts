import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Schema contract test (P0-02): every business table declared in
 * supabase_schema.sql must have Row Level Security enabled, and the
 * admin/operations tables must be locked with deny-all policies.
 * This prevents new tables from silently shipping without RLS — the
 * pre-P0-02 state where 8 of 12 tables were open to the anon key.
 */

const SCHEMA_PATH = resolve(process.cwd(), 'supabase_schema.sql');

function extractNames(sql: string, pattern: RegExp): string[] {
  const names: string[] = [];
  for (const match of sql.matchAll(pattern)) {
    if (!names.includes(match[1])) names.push(match[1]);
  }
  return names.sort();
}

describe('supabase_schema.sql RLS coverage', () => {
  const sql = readFileSync(SCHEMA_PATH, 'utf8');

  it('declares the expected set of public business tables', () => {
    const declared = extractNames(sql, /CREATE TABLE IF NOT EXISTS public\.(\w+)/g);
    expect(declared).toEqual([
      'family_members',
      'feature_flags',
      'meals',
      'ota_deployments',
      'ota_updates',
      'profiles',
      'revenue_by_month',
      'revenue_metrics',
      'system_logs',
      'system_plugins',
      'transactions',
      'user_roles',
      'wearables',
    ]);
  });

  it('enables ROW LEVEL SECURITY on every declared public table', () => {
    const declared = extractNames(sql, /CREATE TABLE IF NOT EXISTS public\.(\w+)/g);
    const rlsEnabled = extractNames(sql, /ALTER TABLE public\.(\w+) ENABLE ROW LEVEL SECURITY/g);
    expect(rlsEnabled).toEqual(declared);
  });

  it('locks the 8 admin/operations tables with deny-all policies (P0-02)', () => {
    const adminTables = [
      'feature_flags',
      'system_plugins',
      'revenue_metrics',
      'revenue_by_month',
      'transactions',
      'system_logs',
      'ota_updates',
      'ota_deployments',
    ];
    for (const table of adminTables) {
      expect(sql).toMatch(
        new RegExp(
          `CREATE POLICY "${table}_admin_only" ON public\\.${table}\\s+FOR ALL USING \\(false\\) WITH CHECK \\(false\\)`,
        ),
      );
      expect(sql).toMatch(new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
    }
  });

  it('keeps user_roles locked with a deny-all policy (P0-01)', () => {
    expect(sql).toMatch(/ALTER TABLE public\.user_roles ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/CREATE POLICY "No direct access to user roles"\s+ON public\.user_roles/);
  });
});
