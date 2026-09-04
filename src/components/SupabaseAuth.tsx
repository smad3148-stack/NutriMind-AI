/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  KeyRound, 
  RefreshCw, 
  XCircle, 
  Timer, 
  ShieldCheck, 
} from 'lucide-react';

interface SupabaseAuthProps {
  onAuthSuccess: (session: any) => void;
  onResetPasswordStateChange?: (active: boolean) => void;
  // P0-03: explicit Demo Mode entry. Available ONLY when the server reports
  // that the auth backend is unconfigured (/api/auth/config -> demoMode).
  // It is never an automatic fallback on an auth error.
  demoModeAvailable?: boolean;
  onDemoMode?: () => void;
  // Recovery links (Supabase PASSWORD_RECOVERY event) carry a temp token
  //that must be redeemed by showing the "New Password" form immediately.
  recoveryMode?: boolean;

  // When set, /api/auth/config could not be fetched/parsed at startup (after
  // one retry). Shown instead of the generic submit-time "Authentication
  // backend is not configured" so the real cause is visible.
  configError?: string | null;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'otp_verify' | 'reset';

export default function SupabaseAuth({ onAuthSuccess, onResetPasswordStateChange, demoModeAvailable = false, onDemoMode, recoveryMode = false, configError = null }: SupabaseAuthProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(recoveryMode ? 'reset' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // New Email OTP-based states
  const [otpCode, setOtpCode] = useState('');
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState(5);
  const [otpSentAt, setOtpSentAt] = useState<number>(0);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Password requirements state
  const [validation, setValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Too Short',
    color: 'bg-slate-800',
    width: 'w-0'
  });

  const supabase = getSupabase();

  // Helper to handle AuthMode changes and trigger parent callback
  const changeMode = (mode: AuthMode) => {
    setAuthMode(mode);
    if (mode === 'forgot' || mode === 'otp_verify' || mode === 'reset') {
      onResetPasswordStateChange?.(true);
    } else {
      onResetPasswordStateChange?.(false);
    }
  };

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const checkPasswordRequirements = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    setValidation({
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
    });

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    let label = 'Too Short';
    let color = 'bg-rose-500';
    let width = 'w-0';

    if (!hasMinLength) {
      setPasswordStrength({ score: 0, label: 'Too Short', color: 'bg-rose-500', width: 'w-1/5' });
      return;
    }

    if (score === 1 || score === 2) {
      label = 'Weak';
      color = 'bg-rose-500';
      width = 'w-2/5';
    } else if (score === 3) {
      label = 'Medium';
      color = 'bg-amber-500';
      width = 'w-3/5';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-teal-500';
      width = 'w-4/5';
    } else if (score === 5) {
      label = 'Perfect (Highly Secure)';
      color = 'bg-emerald-500';
      width = 'w-full';
    }

    setPasswordStrength({ score, label, color, width });
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    checkPasswordRequirements(val);
  };

  // Helper to post audit logs back to our server
  const logAuditPayload = async (eventName: string, props: Record<string, any>) => {
    try {
      await fetch('/api/diagnostics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [{
            name: eventName,
            properties: {
              ...props,
              timestamp: new Date().toISOString(),
              client_platform: 'web_browser',
              security_level: 'standard'
            }
          }]
        })
      });
    } catch (e) {
      console.warn('[Log Client] Could not dispatch event:', e);
    }
  };

  const handleSignIn = async () => {
    if (!supabase) {
      setMessage({ type: 'error', text: 'Authentication backend is not configured. Use Demo Mode below, or configure Supabase credentials.' });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data.session) {
        onAuthSuccess(data.session);
        setMessage({ type: 'success', text: 'Authenticated successfully. Welcome back to NutriChat!' });
      }
    } catch (err: any) {
      // Fail closed: authentication errors are surfaced, never bypassed.
      setMessage({ type: 'error', text: err?.message || 'Sign-in failed. Please check your credentials.' });
    }
  };

  const handleSignUp = async () => {
    if (!supabase) {
      setMessage({ type: 'error', text: 'Authentication backend is not configured. Use Demo Mode below, or configure Supabase credentials.' });
      return;
    }

    if (!validation.hasMinLength || !validation.hasUppercase || !validation.hasLowercase || !validation.hasNumber || !validation.hasSpecial) {
      throw new Error('Password does not meet all secure parameters. Please satisfy all requirements.');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'Athlete'
          }
        }
      });

      if (error) throw error;
      
      if (data.user && data.session) {
        onAuthSuccess(data.session);
        setMessage({ type: 'success', text: 'Account registered and logged in successfully!' });
      } else {
        setMessage({ type: 'success', text: 'Verification link sent! Please check your email inbox to activate.' });
      }
    } catch (err: any) {
      // Fail closed: signup errors are surfaced, never bypassed.
      setMessage({ type: 'error', text: err?.message || 'Sign-up failed. Please try again.' });
    }
  };

  // Send Email OTP (Triggered from Forgot Password Email Entry form)
  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format. Please enter a valid corporate or personal email address.');
    }

    if (resendCountdown > 0) {
      throw new Error(`Rate limit active. Please wait ${resendCountdown} seconds before requesting another OTP.`);
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Authentication backend is not configured. Use Demo Mode below, or configure Supabase credentials.' });
      return;
    }

    // Trigger Audit Log
    await logAuditPayload('OTP_SENT', { email, system: 'Email-OTP', status: 'delivered' });

    try {
      // In Supabase, resetPasswordForEmail triggers the recovery flow which sends an OTP if configured
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        // Fail closed: OTP is never "sent" on an error.
        setMessage({ type: 'error', text: error.message || 'Failed to send the recovery code. Please try again.' });
        return;
      }
      
      changeMode('otp_verify');
      setResendCountdown(60);
      setOtpSentAt(Date.now());
      setOtpAttemptsRemaining(5);
      setOtpCode('');
      setMessage({ 
        type: 'success', 
        text: `Secure 6-digit OTP transmitted to ${email}. Please check your inbox.` 
      });
    } catch (err: any) {
      // Fail closed: network errors are surfaced, never simulated.
      setMessage({ type: 'error', text: err?.message || 'Network error while sending the recovery code. Please try again.' });
    }
  };

  // Verify entered 6-digit Email OTP
  const handleVerifyOtp = async () => {
    if (otpAttemptsRemaining <= 0) {
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
    }

    // Expiry check (10 minutes)
    const elapsedMinutes = (Date.now() - otpSentAt) / (1000 * 60);
    if (elapsedMinutes > 10) {
      await logAuditPayload('OTP_EXPIRED_ALERT', { email, elapsed_minutes: elapsedMinutes });
      throw new Error('OTP Expired. The 10-minute validity window has elapsed. Please request a new OTP.');
    }

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      throw new Error('Invalid OTP format. Please enter a 6-digit numeric verification code.');
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Authentication backend is not configured. Use Demo Mode below, or configure Supabase credentials.' });
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: cleanOtp,
        type: 'recovery'
      });

      if (error) {
        // Fail closed: OTP is verified only by Supabase, never client-side.
        const nextAttempts = otpAttemptsRemaining - 1;
        setOtpAttemptsRemaining(nextAttempts);
        await logAuditPayload('OTP_VERIFIED_FAIL', { email, error: error.message, attempts_left: nextAttempts });
        if (nextAttempts <= 0) {
          throw new Error('Invalid OTP. Maximum verification attempts reached. Please request a new OTP.');
        } else {
          throw new Error(`Invalid OTP. Verification failed. ${nextAttempts} attempts remaining.`);
        }
      }

      setOtpAttemptsRemaining(5);
      changeMode('reset');
      await logAuditPayload('OTP_VERIFIED', { email, success: true });
      setMessage({ type: 'success', text: 'OTP verified successfully! Please define your secure new password.' });
    } catch (err: any) {
      console.warn("Network error during OTP verify:", err);
      const nextAttempts = otpAttemptsRemaining - 1;
      setOtpAttemptsRemaining(nextAttempts);
      throw new Error(err?.message || `Connection offline or Invalid OTP. ${nextAttempts} attempts remaining.`);
    }
  };

  // Reset Password (after successful OTP validation)
  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match. Please ensure both fields are identical.');
    }
    
    if (!validation.hasMinLength || !validation.hasUppercase || !validation.hasLowercase || !validation.hasNumber || !validation.hasSpecial) {
      throw new Error('Password does not meet all secure parameters. Please satisfy all requirements.');
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Authentication backend is not configured. Use Demo Mode below, or configure Supabase credentials.' });
      return;
    }

    // Trigger Audit Log
    await logAuditPayload('PASSWORD_CHANGED', { email, status: 'success' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        // Fail closed: password changes are never reported as successful on error.
        setMessage({ type: 'error', text: error.message || 'Failed to update password. Please try again.' });
        return;
      }

      setMessage({ 
        type: 'success', 
        text: 'Your password has been successfully updated! Redirecting to entrance...' 
      });
      
      setTimeout(() => {
        changeMode('signin');
        setPassword('');
        setConfirmPassword('');
      }, 2500);
    } catch (err: any) {
      // Fail closed: network errors are surfaced, never reported as success.
      setMessage({ type: 'error', text: err?.message || 'Network error while updating the password. Please try again.' });
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);

    if (!supabase) {
      setMessage({ type: 'error', text: 'Authentication backend is not configured. Configure Supabase to enable Google sign-in.' });
      setLoading(false);
      return;
    }

    try {
      // Real OAuth flow via Supabase (provider must be enabled in the
      // Supabase project). No tokens are ever minted client-side.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      // Fail closed: OAuth errors are surfaced, never bypassed.
      setMessage({ type: 'error', text: err?.message || 'Google sign-in failed. Please try again.' });
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (authMode === 'signin') {
        await handleSignIn();
      } else if (authMode === 'signup') {
        await handleSignUp();
      } else if (authMode === 'forgot') {
        await handleSendOtp();
      } else if (authMode === 'otp_verify') {
        await handleVerifyOtp();
      } else if (authMode === 'reset') {
        await handleResetPassword();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 items-center justify-center min-h-[500px]">
      
      {/* Primary Card */}
      <div className="w-full max-w-md bg-slate-950 rounded-[32px] border border-white/10 p-8 shadow-2xl transition-all relative overflow-hidden backdrop-blur-xl">
        
        {/* Subtle Luxury Glow accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

        {/* Brand Name Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono tracking-[0.3em] font-bold text-cyan-400 uppercase block mb-1">
            NutriChat
          </span>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            {authMode === 'signin' && 'Welcome Back'}
            {authMode === 'signup' && 'Create Account'}
            {authMode === 'forgot' && 'Reset Password'}
            {authMode === 'otp_verify' && 'Enter Code'}
            {authMode === 'reset' && 'New Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {authMode === 'signin' && 'Sign in to continue your health journey.'}
            {authMode === 'signup' && 'Join us to start your health journey.'}
            {authMode === 'forgot' && 'Enter your email to receive a recovery code.'}
            {authMode === 'otp_verify' && 'Enter the 6-digit code sent to your email.'}
            {authMode === 'reset' && 'Choose a secure new password to continue.'}
          </p>
        </div>

        {configError && (
          <div className="p-4 rounded-2xl mb-6 text-xs flex items-start gap-2.5 border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <span className="leading-relaxed">
              Could not load the auth configuration endpoint (/api/auth/config). {configError}. Auth requests cannot proceed until it responds with a valid Supabase config.
            </span>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-2xl mb-6 text-xs flex items-start gap-2.5 border transition-all ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-400" />
            )}
            <span className="leading-relaxed">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {authMode === 'signup' && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 block mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><User size={14} /></span>
                <input 
                  type="text"
                  placeholder="Your Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          )}

          {(authMode === 'signin' || authMode === 'signup' || authMode === 'forgot') && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 block mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Mail size={14} /></span>
                <input 
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authMode === 'forgot' && loading}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {authMode === 'otp_verify' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80">Verification Code</label>
                <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                  <Timer size={12} />
                  <span>Valid for 10m</span>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><ShieldCheck size={14} /></span>
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono tracking-[0.5em] text-center text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Attempts Remaining: <strong className="text-white">{otpAttemptsRemaining}</strong></span>
                <span>Valid for 10 minutes</span>
              </div>
            </div>
          )}

          {(authMode === 'signin' || authMode === 'signup' || authMode === 'reset') && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80">
                  {authMode === 'reset' ? 'New Password' : 'Password'}
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={14} /></span>
                <input 
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {(authMode === 'signup' || authMode === 'reset') && password.length > 0 && (
                <div className="mt-3.5 space-y-3 p-3.5 bg-slate-900/60 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Strength Rating:</span>
                    <span className={
                      passwordStrength.score <= 2 ? 'text-rose-400 font-bold' :
                      passwordStrength.score === 3 ? 'text-amber-400 font-bold' :
                      passwordStrength.score === 4 ? 'text-teal-400 font-bold' : 'text-emerald-400 font-bold'
                    }>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 pt-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {validation.hasMinLength ? (
                        <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-slate-600 shrink-0" />
                      )}
                      <span className={validation.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        8+ Characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {validation.hasUppercase ? (
                        <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-slate-600 shrink-0" />
                      )}
                      <span className={validation.hasUppercase ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        Uppercase Letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {validation.hasLowercase ? (
                        <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-slate-600 shrink-0" />
                      )}
                      <span className={validation.hasLowercase ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        Lowercase Letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {validation.hasNumber ? (
                        <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-slate-600 shrink-0" />
                      )}
                      <span className={validation.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        One Number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {validation.hasSpecial ? (
                        <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-slate-600 shrink-0" />
                      )}
                      <span className={validation.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        Special Character
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {authMode === 'reset' && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 block mb-1.5">Confirm New Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><KeyRound size={14} /></span>
                <input 
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
              {password.length > 0 && confirmPassword.length > 0 && (
                <div className="mt-2 text-right">
                  {password === confirmPassword ? (
                    <span className="text-[10px] font-mono text-emerald-400">✓ Passwords Match</span>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-400">✗ Passwords Do Not Match</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-2xl hover:brightness-110 active:scale-[0.98] transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <span>
              {loading ? 'Please wait...' : 
               authMode === 'signin' ? 'Sign In' : 
               authMode === 'signup' ? 'Create Account' : 
               authMode === 'forgot' ? 'Send Code' : 
               authMode === 'otp_verify' ? 'Verify Code' : 'Save Password'}
            </span>
            <ArrowRight size={14} />
          </button>

          {/* Continue with Google button inside Sign In page */}
          {authMode === 'signin' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="mx-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">OR</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-medium text-xs rounded-2xl active:scale-[0.98] transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {/* Minimalist Google 'G' icon built via path */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.25 1.916 15.39 1 12.24 1 6.133 1 1.155 5.923 1.155 12s4.978 11 11.085 11c6.374 0 10.6-4.437 10.6-10.701 0-.72-.077-1.272-.172-1.714h-10.428z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* P0-03: explicit Demo Mode - rendered ONLY when the server reports
              the auth backend is unconfigured (/api/auth/config -> demoMode).
              This is a deliberate user choice, never an error fallback. */}
          {demoModeAvailable && authMode === 'signin' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onDemoMode}
                className="w-full py-3.5 bg-slate-900/60 hover:bg-slate-800 border border-cyan-500/20 text-cyan-400 font-medium text-xs rounded-2xl active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={14} />
                <span>Continue in Demo Mode (no account, no real data)</span>
              </button>
            </div>
          )}

        </form>

        {/* Resend option block for OTP verification screen */}
        {authMode === 'otp_verify' && (
          <div className="mt-4 p-4 bg-slate-900/60 border border-white/10 rounded-2xl text-center space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Didn't receive the OTP code or need a new one?
            </p>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || resendCountdown > 0}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-mono text-xs rounded-xl transition border border-cyan-500/20 disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>
                {resendCountdown > 0 
                  ? `Resend in ${resendCountdown}s` 
                  : 'Resend Verification Code'}
              </span>
            </button>
          </div>
        )}

        {/* Navigation links inside auth modes */}
        <div className="text-center mt-8 space-y-3">
          
          {authMode === 'signin' && (
            <>
              {/* PRIMARY FORGOT PASSWORD ROUTING */}
              <button
                type="button"
                onClick={() => {
                  changeMode('forgot');
                  setMessage(null);
                }}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition block mx-auto underline underline-offset-4 cursor-pointer font-bold"
              >
                Forgot your password?
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  changeMode('signup');
                  setMessage(null);
                }}
                className="text-xs text-slate-400 hover:text-white transition block mx-auto cursor-pointer"
              >
                Don't have an account? <span className="text-cyan-400 font-bold">Sign up</span>
              </button>
            </>
          )}

          {authMode === 'signup' && (
            <button 
              type="button"
              onClick={() => {
                changeMode('signin');
                setMessage(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition block mx-auto cursor-pointer"
            >
              Already have an account? <span className="text-cyan-400 font-bold">Sign in</span>
            </button>
          )}

          {(authMode === 'forgot' || authMode === 'otp_verify' || authMode === 'reset') && (
            <button 
              type="button"
              onClick={() => {
                changeMode('signin');
                setMessage(null);
                setOtpCode('');
                setOtpAttemptsRemaining(5);
              }}
              className="text-xs text-slate-400 hover:text-white transition block mx-auto cursor-pointer"
            >
              ← Back to sign in
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
