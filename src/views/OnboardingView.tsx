import React, { useState } from 'react';
import { SlidersHorizontal, ArrowRight, Activity, Target, Utensils } from 'lucide-react';
import type { Route, UserProfileData, OilLevel } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { FirestoreUserService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

interface OnboardingViewProps {
  onNavigate: (route: Route) => void;
  onSaveProfile: (profile: UserProfileData) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onNavigate,
  onSaveProfile
}) => {
  const { user } = useAuth();
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [heightCm, setHeightCm] = useState<number>(178);
  const [weightKg, setWeightKg] = useState<number>(76);
  const [activityLevel, setActivityLevel] = useState<UserProfileData['activityLevel']>('active');
  const [goal, setGoal] = useState<UserProfileData['goal']>('muscle_gain');
  const [dietaryPreference, setDietaryPreference] = useState<string>('non-veg');
  const [oilPreference, setOilPreference] = useState<OilLevel>('low');

  // BMR Calculation using Mifflin-St Jeor
  const calculateBMR = () => {
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === 'female' ? bmr - 161 : bmr + 5;
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const multipliers = {
      sedentary: 1.2,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return Math.round(bmr * multipliers[activityLevel]);
  };

  const calculateTargets = () => {
    const tdee = calculateTDEE();
    let calories = tdee;

    if (goal === 'weight_loss') calories -= 400;
    if (goal === 'muscle_gain') calories += 300;

    let proteinPerKg = 1.8;
    if (goal === 'muscle_gain') proteinPerKg = 2.0;

    const protein = Math.round(weightKg * proteinPerKg);

    return { calories, protein };
  };

  const { calories, protein } = calculateTargets();

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfileData = {
      name: user?.displayName || 'Tharun Kumar',
      email: user?.email || 'tharun@example.com',
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      goal,
      targetCalories: calories,
      targetProtein: protein,
      dietaryPreference,
      oilPreference
    };

    onSaveProfile(updatedProfile);

    if (user?.uid) {
      await FirestoreUserService.saveProfile(user.uid, updatedProfile);
    }

    onNavigate('dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          Mifflin-St Jeor Macro Engine
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Personalized Target Configurator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Enter your body metrics to compute exact daily calorie & protein requirements for your fitness goal.
        </p>
      </div>

      <form onSubmit={handleFinish} className="space-y-6">
        {/* Physical Metrics */}
        <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-emerald-400" /> Physical Body Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Age (Years)"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              required
            />

            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />

            <Input
              label="Height (cm)"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              required
            />

            <Input
              label="Weight (kg)"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              required
            />
          </div>
        </GlassCard>

        {/* Activity & Goal */}
        <GlassCard variant="interactive" className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-4 h-4 text-amber-400" /> Activity Level & Fitness Goal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Daily Activity Level"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              options={[
                { value: 'sedentary', label: 'Sedentary (Desk Job)' },
                { value: 'moderate', label: 'Moderate (3-4 days workout)' },
                { value: 'active', label: 'Active (5+ days intense)' },
                { value: 'very_active', label: 'Very Active (Athlete)' }
              ]}
            />

            <Select
              label="Primary Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
              options={[
                { value: 'weight_loss', label: 'Fat Loss (-400 kcal)' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'muscle_gain', label: 'Muscle Gain (+300 kcal)' }
              ]}
            />
          </div>
        </GlassCard>

        {/* Dietary Preferences */}
        <GlassCard variant="interactive" className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Utensils className="w-4 h-4 text-teal-400" /> Regional Cuisine & Oil Preference
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Dietary Choice"
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              options={[
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'eggitarian', label: 'Eggitarian' },
                { value: 'non-veg', label: 'Non-Vegetarian' }
              ]}
            />

            <Select
              label="Default Oil Preference"
              value={oilPreference}
              onChange={(e) => setOilPreference(e.target.value as OilLevel)}
              options={[
                { value: 'low', label: 'Low Oil (Cold-pressed spray)' },
                { value: 'medium', label: 'Medium Oil' },
                { value: 'standard', label: 'Standard Oil' }
              ]}
            />
          </div>
        </GlassCard>

        {/* Computed Dynamic Target Card */}
        <GlassCard variant="gradient" className="p-6 space-y-4 border-emerald-500/30 bg-emerald-500/5">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest text-center">
            Computed Daily Macro Targets
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center font-mono">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30">
              <span className="text-xs text-slate-400 block font-sans">Target Calories</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{calories}</span>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">kcal / day</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
              <span className="text-xs text-slate-400 block font-sans">Target Protein</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{protein}g</span>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">grams / day</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            Save Targets & Open Dashboard
          </Button>
        </GlassCard>
      </form>
    </div>
  );
};
