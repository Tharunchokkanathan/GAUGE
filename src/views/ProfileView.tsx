import React from 'react';
import { LogOut, Flame, Dumbbell, Shield, Sparkles, Scale } from 'lucide-react';
import type { Route, UserProfileData } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  onNavigate: (route: Route) => void;
  profile: UserProfileData;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, profile }) => {
  const { logout, user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <div className="space-y-6 pb-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <GlassCard variant="gradient" className="p-6 sm:p-8 space-y-6 border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400 font-extrabold text-2xl">
              {getInitials(profile.name)}
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{profile.email}</p>
            <p className="text-xs text-emerald-400 font-medium">
              Firebase UID: <span className="font-mono text-slate-400">{user?.uid || 'demo-user-uid-12345'}</span>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4 text-rose-400" />}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
          >
            Sign Out
          </Button>
        </div>

        {/* Current Macro Targets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Daily Calories</span>
            <span className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-4 h-4" /> {profile.targetCalories} kcal
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Daily Protein</span>
            <span className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <Dumbbell className="w-4 h-4" /> {profile.targetProtein}g
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Diet Preference</span>
            <span className="text-sm font-semibold text-cyan-300 capitalize mt-1 block">
              {profile.dietaryPreference}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Oil Preference</span>
            <span className="text-sm font-semibold text-teal-300 capitalize mt-1 block">
              {profile.oilPreference} Oil
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Body Metrics Summary */}
      <GlassCard variant="interactive" className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" /> Physical Metrics & Goal Setup
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('onboarding')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Re-calculate Targets
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-400 block font-sans">Age & Gender</span>
            <span className="text-white font-bold">{profile.age} yrs • {profile.gender}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block font-sans">Height</span>
            <span className="text-white font-bold">{profile.heightCm} cm</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block font-sans">Weight</span>
            <span className="text-white font-bold">{profile.weightKg} kg</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block font-sans">Activity Level</span>
            <span className="text-emerald-400 font-bold capitalize">{profile.activityLevel.replace('_', ' ')}</span>
          </div>
        </div>
      </GlassCard>

      {/* Firebase Data Security & Rules Status */}
      <GlassCard variant="subtle" className="p-5 space-y-3 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-3 text-xs font-bold text-emerald-400">
          <Shield className="w-5 h-5" />
          <span>Firestore Security Rules Active</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your daily nutrition logs and profile settings are restricted to your authenticated Firebase UID. Other users cannot read or modify your private data.
        </p>
      </GlassCard>
    </div>
  );
};
