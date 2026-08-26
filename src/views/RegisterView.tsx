import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Route } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface RegisterViewProps {
  onNavigate: (route: Route) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('Tharun Kumar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await register(email, password, name);
      onNavigate('onboarding');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <GlassCard variant="gradient" className="w-full max-w-md space-y-6 p-6 sm:p-8 border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Your GAUGE Account</h2>
          <p className="text-xs text-slate-400">Personalized South Indian macro tracking starts here</p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Tharun Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="tharun@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          <div className="text-xs text-slate-400 flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Your private data stays protected under your Firebase Auth UID.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Continue to Target Setup'}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={() => onNavigate('login')}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
