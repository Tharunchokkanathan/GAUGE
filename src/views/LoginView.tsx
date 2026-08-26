import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, UtensilsCrossed, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import type { Route } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface LoginViewProps {
  onNavigate: (route: Route) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('tharun@example.com');
  const [password, setPassword] = useState('password123');
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isResetMode) {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent to your email address.');
        setIsSubmitting(false);
        return;
      }

      await login(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <GlassCard variant="gradient" className="w-full max-w-md space-y-6 p-6 sm:p-8 border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            {isResetMode ? <KeyRound className="w-6 h-6" /> : <UtensilsCrossed className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isResetMode ? 'Reset Your Password' : 'Welcome Back to GAUGE'}
          </h2>
          <p className="text-xs text-slate-400">
            {isResetMode 
              ? 'Enter your email to receive a password reset link' 
              : 'Sign in to sync your personal targets & meal history with Firebase'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="tharun@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          {!isResetMode && (
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          )}

          {!isResetMode && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-emerald-500" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => {
                  setIsResetMode(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            icon={isResetMode ? <KeyRound className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : isResetMode ? 'Send Reset Link' : 'Sign In to GAUGE'}
          </Button>

          {isResetMode && (
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-xs text-slate-400 hover:text-white pt-2 block text-center"
            >
              Back to Sign In
            </button>
          )}
        </form>

        <div className="pt-4 border-t border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button 
              type="button" 
              onClick={() => onNavigate('register')}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-400"
            onClick={() => onNavigate('dashboard')}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Continue as Guest Demo
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
