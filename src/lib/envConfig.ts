/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EnvironmentChannel = 'development' | 'beta' | 'staging' | 'production';

export interface EnvConfiguration {
  channel: EnvironmentChannel;
  apiBaseUrl: string;
  enableMocks: boolean;
  enableLogs: boolean;
  supabaseUrl: string;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  syncIntervalMs: number;
}

class EnvironmentStrategy {
  private currentEnv: EnvironmentChannel = 'development';

  constructor() {
    this.detectEnvironment();
  }

  /**
   * Evaluates the active environment channel based on compiler flags and browser contexts.
   */
  public getChannel(): EnvironmentChannel {
    return this.currentEnv;
  }

  /**
   * Retrieves full configuration mapping for the detected channel.
   */
  public getConfig(): EnvConfiguration {
    const channel = this.getChannel();
    
    // Absolute servers mapping
    const productionHost = 'https://ais-pre-f7xkwg6be3p3mqoxd4zxeb-33973327392.asia-southeast1.run.app';
    const stagingHost = 'https://ais-dev-f7xkwg6be3p3mqoxd4zxeb-33973327392.asia-southeast1.run.app';
    const devHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    switch (channel) {
      case 'production':
        return {
          channel,
          apiBaseUrl: productionHost,
          enableMocks: false,
          enableLogs: false,
          supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
          analyticsEnabled: true,
          crashReportingEnabled: true,
          syncIntervalMs: 15 * 60 * 1000 // 15 mins
        };
      case 'staging':
        return {
          channel,
          apiBaseUrl: stagingHost,
          enableMocks: false,
          enableLogs: true,
          supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
          analyticsEnabled: true,
          crashReportingEnabled: true,
          syncIntervalMs: 5 * 60 * 1000 // 5 mins
        };
      case 'beta':
        return {
          channel,
          apiBaseUrl: stagingHost,
          enableMocks: true, // Allow fallback mocks for beta trialists
          enableLogs: true,
          supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
          analyticsEnabled: true,
          crashReportingEnabled: true,
          syncIntervalMs: 2 * 60 * 1000 // 2 mins
        };
      case 'development':
      default:
        return {
          channel: 'development',
          apiBaseUrl: devHost,
          enableMocks: true,
          enableLogs: true,
          supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
          analyticsEnabled: false,
          crashReportingEnabled: false,
          syncIntervalMs: 30 * 1000 // 30s
        };
    }
  }

  /**
   * Validates integrity of required environment secrets.
   */
  public diagnoseSecrets(): { ok: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const config = this.getConfig();

    if (!config.supabaseUrl) {
      warnings.push('VITE_SUPABASE_URL is not set. Database synchronizations will fall back to offline states.');
    }

    return {
      ok: warnings.length === 0,
      warnings
    };
  }

  private detectEnvironment() {
    if (typeof window === 'undefined') return;

    // Detect environment based on URL hostname
    const host = window.location.hostname;
    if (host.includes('ais-pre-') || host === 'nutrimind.ai') {
      this.currentEnv = 'production';
    } else if (host.includes('ais-dev-') || host.includes('staging')) {
      this.currentEnv = 'staging';
    } else if (host.includes('beta')) {
      this.currentEnv = 'beta';
    } else {
      this.currentEnv = 'development';
    }
    console.log(`[EnvConfig] Active Configuration Channel Detected: [${this.currentEnv.toUpperCase()}]`);
  }
}

export const envConfig = new EnvironmentStrategy();
export default envConfig;
