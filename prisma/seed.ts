/**
 * Prisma seed for NutriMind-AI.
 *
 * Populates the admin-console tables (feature flags, marketplace plugins,
 * OTA updates/deployments, revenue snapshot) so the dashboard has data on a
 * fresh database. Idempotent: safe to run repeatedly. Mirrors the in-memory
 * fallback stores defined in server.ts.
 *
 * Run with: npx prisma db seed  (or `npm run db:seed`)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Feature flags
  const flags = [
    { name: 'AI Meal Scanner', key: 'enableMealScanner', description: 'Real-time camera meal ingestion', enabled: true },
    { name: 'Family Sharing', key: 'enableFamilySharing', description: 'Biometrics sharing across circles', enabled: true },
    { name: 'Premium Coach', key: 'enablePremiumCoach', description: 'NutriChat AI coach', enabled: true },
  ];
  for (const f of flags) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: {},
      create: f,
    });
  }

  // Marketplace plugins
  const plugins = [
    { id: 'p1', name: 'Apple Health Bridge', version: '1.4.2', status: 'active', category: 'integrations', isInstalled: true, author: 'NutriMind Labs', rating: 4.8, installCount: 1240, permissions: 'health:read', dependencies: '' },
    { id: 'p2', name: 'Gemini Coach Pro', version: '2.1.0', status: 'active', category: 'ai', isInstalled: true, author: 'NutriMind Labs', rating: 4.9, installCount: 3120, permissions: 'ai:invoke', dependencies: '' },
    { id: 'p3', name: 'Metabolic Insights', version: '0.9.4', status: 'inactive', category: 'analytics', isInstalled: false, author: 'Community', rating: 4.2, installCount: 410, permissions: 'analytics:read', dependencies: 'Gemini Coach Pro' },
  ];
  for (const p of plugins) {
    await prisma.systemPlugin.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // OTA updates
  const updates = [
    { id: 'e2079010-0974-4bda-a0a1-778711674a01', version: 'v2.4.0', channel: 'production', description: 'Production stable release with enterprise-grade caching pipelines.', bundleUrl: 'https://cdn.nutrimind.ai/ota/v2.4.0-release.bin', status: 'published' },
    { id: 'e2079010-0974-4bda-a0a1-778711674a02', version: 'v2.5.0-rc1', channel: 'staging', description: 'Staging release candidate with metabolic PDF exports.', bundleUrl: 'https://cdn.nutrimind.ai/ota/v2.5.0-rc1.bin', status: 'published' },
    { id: 'e2079010-0974-4bda-a0a1-778711674a03', version: 'v2.5.0-beta2', channel: 'beta', description: 'Beta testing speech stream stabilizers.', bundleUrl: 'https://cdn.nutrimind.ai/ota/v2.5.0-beta2.bin', status: 'published' },
  ];
  for (const u of updates) {
    await prisma.otaUpdate.upsert({
      where: { version: u.version },
      update: {},
      create: { ...u, deployedAt: new Date() },
    });
  }

  // OTA deployment
  await prisma.otaDeployment.upsert({
    where: { id: 'd91cf97d-6060-496f-8703-a267cfc0a301' },
    update: {},
    create: {
      id: 'd91cf97d-6060-496f-8703-a267cfc0a301',
      otaUpdateId: 'e2079010-0974-4bda-a0a1-778711674a01',
      version: 'v2.4.0',
      channel: 'production',
      action: 'deploy',
      deployedBy: 'admin',
      status: 'success',
      notes: 'Standard monthly build deployment.',
    },
  });

  // Revenue snapshot
  await prisma.revenueMetric.upsert({
    where: { id: 'rm-1' },
    update: {},
    create: { id: 'rm-1', mrr: 48200, arr: 578400, activeSubscribers: 3104, conversionRate: 0.072 },
  });

  const months = [
    { month: '2026-01', amount: 38500, target: 40000 },
    { month: '2026-02', amount: 42100, target: 44000 },
    { month: '2026-03', amount: 48200, target: 48000 },
  ];
  for (const m of months) {
    await prisma.revenueByMonth.upsert({
      where: { id: `rbm-${m.month}` },
      update: {},
      create: { id: `rbm-${m.month}`, ...m },
    });
  }

  console.log('✓ Seed complete: feature flags, plugins, OTA, revenue.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
