/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Monitor, ShieldAlert, Sparkles, LogOut, User } from 'lucide-react';
import CustomerCompanion from './components/CustomerCompanion';
import AdminDashboard from './components/AdminDashboard';
import SupabaseAuth from './components/SupabaseAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getSupabase, setSupabaseRuntimeConfig } from './lib/supabase';
import { setSessionToken } from './lib/sessionToken';

export default function App() {
  const [currentMode, setCurrentMode] = useState<'customer' | 'admin'>('customer');
  const [session, setSession] = useState<any>(null);
  // P0-03: explicit Demo Mode - only entered via a deliberate button click
  // when the server reports the auth backend is unconfigured. Never an
  // automatic fallback on an auth error (bypassAuth was removed).
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [demoModeAvailable, setDemoModeAvailable] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<{ email: string; name?: string } | null>(null);

  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  // True only when the user arrived via a Supabase recovery link (the
  // PASSWORD_RECOVERY auth event). Distinguishes "reset form" from the
  // plain sign-in screen the recovery-landing is shown on.
  const [recoveryModeActive, setRecoveryModeActive] = useState<boolean>(false);
  // Runtime auth backend config has been fetched from /api/auth/config.
  // The Supabase client is configured from this response, so no auth UI or
  // session restore may run before it resolves.
  const [authConfigLoaded, setAuthConfigLoaded] = useState<boolean>(false);
  // P0-01: mirrors the server-side admin check so the Clinician Portal is
  // hidden for non-admins. null = not yet checked / signed out.
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Session restore runs only after the runtime Supabase config has been
  // fetched from /api/auth/config and installed via setSupabaseRuntimeConfig.
  useEffect(() => {
    if (!authConfigLoaded) return;
    const supabase = getSupabase();
    if (!supabase) return;

    // Retrieve active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionToken(session?.access_token); // P0-04: shared token for diagnostics
      if (session?.user) {
        setUserProfile({
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'Athlete'
        });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        // A recovery link was clicked. Show the new-password form instead of
        // the login screen, and keep the recovery session out of the app
        // until the user has actually set a new password.
        setSession(null);
        setSessionToken(undefined);
        setRecoveryModeActive(true);
        setIsResettingPassword(true);
        setUserProfile({
          email: newSession?.user?.email || (newSession as any)?.email || '',
          name: newSession?.user?.user_metadata?.full_name || (newSession as any)?.user_metadata?.full_name || 'Athlete',
        });
      } else {
        setSession(newSession);
        setSessionToken(newSession?.access_token);
        if (newSession?.user) {
          setUserProfile({
            email: newSession.user.email || '',
            name: newSession.user.user_metadata?.full_name || 'Athlete',
          });
        } else {
          setUserProfile(null);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [authConfigLoaded]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setSessionToken(undefined); // P0-04: clear shared token
    setDemoMode(false);
    setIsResettingPassword(false);
    setRecoveryModeActive(false);
  };

  const isUserAuthenticated = (!!session || demoMode) && !isResettingPassword;

  // Fetch the runtime auth configuration from the server. The response
  // carries the public Supabase URL + anon key (installed into the client
  // via setSupabaseRuntimeConfig) and reports whether the auth backend is
  // configured. The Demo Mode entry button is rendered only when
  // demoMode === true, and entering demo mode is always an explicit user
  // action (P0-03). Fail closed on any error: no Supabase client, no demo
  // entry.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/config')
      .then((res) => (res.ok ? res.json() : { demoMode: false }))
      .then((cfg: { demoMode?: boolean; supabaseUrl?: string; supabaseAnonKey?: string }) => {
        if (cancelled) return;
        setSupabaseRuntimeConfig({
          supabaseUrl: cfg.supabaseUrl || '',
          supabaseAnonKey: cfg.supabaseAnonKey || '',
        });
        setDemoModeAvailable(!!cfg.demoMode);
        setAuthConfigLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Fail closed: no demo entry and no Supabase client when the server
        // cannot be reached - but stop loading so the UI can surface it.
        setSupabaseRuntimeConfig({ supabaseUrl: '', supabaseAnonKey: '' });
        setDemoModeAvailable(false);
        setAuthConfigLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // P0-01: verify admin role against the server before exposing the
  // Clinician Portal. The /api/admin/* endpoints are the real security
  // boundary (requireAdminAuth, fail-closed); this only hides the UI.
  useEffect(() => {
    let cancelled = false;
    if (!isUserAuthenticated) {
      setIsAdmin(null);
      return;
    }
    const token = session?.access_token as string | undefined;
    fetch('/api/admin/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!cancelled) setIsAdmin(res.ok);
      })
      .catch(() => {
        // Fail closed: hide the portal on any error.
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, demoMode, isResettingPassword, isUserAuthenticated]);

  // Force back to the customer app if admin access is revoked mid-session.
  useEffect(() => {
    if (currentMode === 'admin' && isAdmin === false) {
      setCurrentMode('customer');
    }
  }, [currentMode, isAdmin]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#D1F2EB] flex flex-col antialiased selection:bg-[#50C878]/30 selection:text-[#D1F2EB]">
      
      {/* Global Executive Switcher Header - Vision OS Spatial Glass */}
      <header className="bg-[#050505]/80 backdrop-blur-2xl border-b border-[#D1F2EB]/10 sticky top-0 z-50 px-4 py-3 sm:px-6 shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#663399] via-[#0B6E4F] to-[#50C878] p-[1.5px] shadow-[0_0_20px_rgba(102,51,153,0.35)] animate-float-3d">
              <div className="w-full h-full bg-[#050505]/95 rounded-[14px] flex items-center justify-center font-display font-black text-[#D1F2EB] text-base tracking-tighter border border-[#D1F2EB]/20 shadow-inner">
                NΩ
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-display tracking-tight text-[#D1F2EB]">
                  NutriMind AI
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#50C878]/15 text-[#50C878] border border-[#50C878]/25 font-semibold uppercase tracking-widest">
                  v1.0
                </span>
              </div>
            </div>
          </div>

          {/* Mode Selectors and Session Info */}
          {isUserAuthenticated && (
            <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
              
              {/* Session Profile Badge */}
              <div className="flex items-center gap-2 bg-[#12141c]/80 border border-[#D1F2EB]/12 px-3 py-1.5 rounded-2xl text-xs text-[#D1F2EB] shadow-lg backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-[#50C878] shadow-[0_0_8px_#50C878] animate-pulse" />
                <span className="font-medium max-w-[120px] truncate">{userProfile?.name || 'Athlete'}</span>
                {session && (
                  <button 
                    onClick={handleLogout}
                    title="Sign Out"
                    className="ml-1 text-[#D1F2EB]/60 hover:text-rose-400 transition cursor-pointer"
                  >
                    <LogOut size={12} />
                  </button>
                )}
              </div>

              {/* Mode Selectors */}
              <div className="flex bg-[#0f1118]/90 p-1 rounded-2xl border border-[#D1F2EB]/12 shadow-xl backdrop-blur-xl">
                
                <button
                  onClick={() => setCurrentMode('customer')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    currentMode === 'customer'
                      ? 'bg-gradient-to-r from-[#D1F2EB] to-[#50C878] text-[#050505] shadow-[0_0_20px_rgba(80,200,120,0.35)] border border-white/40 scale-[1.02]'
                      : 'text-[#D1F2EB]/60 hover:text-[#D1F2EB]'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Health App</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setCurrentMode('admin')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                      currentMode === 'admin'
                        ? 'bg-gradient-to-r from-[#663399] to-[#3b1960] text-[#D1F2EB] shadow-[0_0_20px_rgba(102,51,153,0.4)] border border-[#D1F2EB]/30 scale-[1.02]'
                        : 'text-[#D1F2EB]/60 hover:text-[#D1F2EB]'
                    }`}
                  >
                    <Monitor size={14} />
                    <span>Clinician Portal</span>
                  </button>
                )}

              </div>
            </div>
          )}

        </div>
      </header>

      {/* Main Sandbox Frame */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {!authConfigLoaded ? (
            <motion.div
              key="config_loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="py-24 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-10 h-10 rounded-full border-2 border-[#50C878]/20 border-t-[#50C878] animate-spin" />
              <p className="text-xs font-mono text-[#D1F2EB]/50 uppercase tracking-widest">
                Connecting to authentication service…
              </p>
            </motion.div>
          ) : !isUserAuthenticated ? (
            <motion.div
              key="auth_screen"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.25 }}
              className="py-8"
            >
              <SupabaseAuth 
                onAuthSuccess={(newSession) => {
                  setSession(newSession);
                  setIsResettingPassword(false);
                  setRecoveryModeActive(false);
                }} 
                onDemoMode={() => setDemoMode(true)}
                demoModeAvailable={demoModeAvailable}
                onResetPasswordStateChange={(active) => {
                  // The manual "Forgot password" flow also toggles this flag;
                  // only the recovery-link lander keeps the reset form open on its own.
                  if (!active) {
                    setRecoveryModeActive(false);
                  }
                  setIsResettingPassword(active);
                }}
                recoveryMode={recoveryModeActive}
              />
            </motion.div>
          ) : currentMode === 'customer' ? (
            <motion.div
              key="customer_app"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25 }}
              className="py-4"
            >
              <ErrorBoundary>
                <CustomerCompanion token={session?.access_token} userId={session?.user?.id} />
              </ErrorBoundary>
            </motion.div>
          ) : (
            <motion.div
              key="admin_dashboard"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25 }}
              className="py-4"
            >
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Enterprise Footer disclaimer */}
      <footer className="border-t border-[#D1F2EB]/10 bg-[#013220]/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-[10px] text-[#D1F2EB]/60 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-[#50C878]" />
            <span>
              {session
                ? 'Operational Mode: Signed in'
                : demoMode
                  ? 'Operational Mode: Demo mode'
                  : 'Operational Mode: Signed out'}
            </span>
          </div>
          <div>
            <span>© 2026 NutriMind AI Inc. Designed & Developed in India.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
