import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, ArrowRight, Activity, Target, Utensils, AlertTriangle, RefreshCw, Flame } from 'lucide-react';
import type { Route, UserProfileData, OilLevel, ActivityLevel, UserGoal } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { FirestoreUserService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ACTIVITY_LEVEL_OPTIONS, 
  GOAL_OPTIONS, 
  calculateNutritionTargets, 
  validateProfileInput 
} from '../utils/nutritionCalculator';

interface OnboardingViewProps {
  onNavigate: (route: Route) => void;
  onSaveProfile: (profile: UserProfileData) => void;
  initialProfile?: UserProfileData;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onNavigate,
  onSaveProfile,
  initialProfile
}) => {
  const { user, userProfile } = useAuth();

  const activeProf = initialProfile || userProfile;

  // Form State
  const [name, setName] = useState<string>(activeProf?.name || user?.displayName || 'Tharun Kumar');
  const [age, setAge] = useState<number>(activeProf?.age || 28);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(activeProf?.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(activeProf?.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(activeProf?.weightKg || 76);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(activeProf?.activityLevel || 'moderately_active');
  const [goal, setGoal] = useState<UserGoal>(activeProf?.goal || 'muscle_gain');
  const [dietaryPreference, setDietaryPreference] = useState<string>(activeProf?.dietaryPreference || 'non-veg');
  const [oilPreference, setOilPreference] = useState<OilLevel>(activeProf?.oilPreference || 'low');

  // Manual & Estimated Targets
  const [targetCalories, setTargetCalories] = useState<number>(activeProf?.targetCalories || 2200);
  const [targetProtein, setTargetProtein] = useState<number>(activeProf?.targetProtein || 140);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // Errors & Loading State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-calculate recommendation whenever body metrics/goals change (unless user manually customized)
  useEffect(() => {
    if (!isManualOverride) {
      const { estimatedCalories, estimatedProtein } = calculateNutritionTargets(
        weightKg,
        heightCm,
        age,
        gender,
        activityLevel,
        goal
      );
      setTargetCalories(estimatedCalories);
      setTargetProtein(estimatedProtein);
    }
  }, [weightKg, heightCm, age, gender, activityLevel, goal, isManualOverride]);

  const handleResetToEstimated = () => {
    const { estimatedCalories, estimatedProtein } = calculateNutritionTargets(
      weightKg,
      heightCm,
      age,
      gender,
      activityLevel,
      goal
    );
    setTargetCalories(estimatedCalories);
    setTargetProtein(estimatedProtein);
    setIsManualOverride(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const profileData: UserProfileData = {
      name,
      email: user?.email || activeProf?.email || 'tharun@example.com',
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel,
      goal,
      targetCalories: Number(targetCalories),
      targetProtein: Number(targetProtein),
      dietaryPreference,
      oilPreference,
      isOnboarded: true
    };

    // Validate Input
    const errors = validateProfileInput(profileData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMsg('Please correct the highlighted fields before proceeding.');
      return;
    }

    setValidationErrors({});
    setIsSaving(true);

    try {
      onSaveProfile(profileData);

      if (user?.uid) {
        await FirestoreUserService.saveProfile(user.uid, profileData);
      }

      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setErrorMsg('Failed to persist profile to Firestore. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          Mifflin-St Jeor Macro Calculation Engine
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure Your Target Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Personalize your daily calories and protein baseline tailored specifically to your body composition and fitness objectives.
        </p>
      </div>

      {/* Global Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details & Physical Metrics */}
        <GlassCard variant="gradient" className="p-6 space-y-5 border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Activity className="w-4 h-4 text-emerald-400" /> Physical Body Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
              {validationErrors.name && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.name}</p>
              )}
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Age (Years)"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={10}
                max={120}
                required
              />
              {validationErrors.age && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.age}</p>
              )}
            </div>

            <div>
              <Input
                label="Height (cm)"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                min={50}
                max={250}
                required
              />
              {validationErrors.heightCm && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.heightCm}</p>
              )}
            </div>

            <div>
              <Input
                label="Weight (kg)"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                min={20}
                max={300}
                required
              />
              {validationErrors.weightKg && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.weightKg}</p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Activity & Fitness Goal */}
        <GlassCard variant="interactive" className="p-6 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Target className="w-4 h-4 text-amber-400" /> Activity Level & Primary Goal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Daily Activity Level"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              options={ACTIVITY_LEVEL_OPTIONS.map((a) => ({
                value: a.value,
                label: `${a.label} (${a.description})`
              }))}
            />

            <Select
              label="Fitness Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value as UserGoal)}
              options={GOAL_OPTIONS.map((g) => ({
                value: g.value,
                label: g.label
              }))}
            />
          </div>
        </GlassCard>

        {/* Regional Dietary Preference */}
        <GlassCard variant="interactive" className="p-6 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Utensils className="w-4 h-4 text-teal-400" /> Dietary & Oil Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Dietary Preference"
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              options={[
                { value: 'non-veg', label: 'Non-Vegetarian' },
                { value: 'eggetarian', label: 'Eggitarian' },
                { value: 'veg', label: 'Vegetarian' },
                { value: 'vegan', label: 'Vegan' }
              ]}
            />

            <Select
              label="Cooking Oil Level"
              value={oilPreference}
              onChange={(e) => setOilPreference(e.target.value as OilLevel)}
              options={[
                { value: 'none', label: 'Zero Oil / Steamed' },
                { value: 'low', label: 'Low Oil (Spray / Cold-pressed)' },
                { value: 'medium', label: 'Medium Oil (Standard Sauté)' },
                { value: 'standard', label: 'Standard Oil' }
              ]}
            />
          </div>
        </GlassCard>

        {/* Estimated vs Custom Daily Targets */}
        <GlassCard variant="gradient" className="p-6 space-y-5 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Daily Target Configurator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Computed baseline recommendation with full manual adjustment support.
              </p>
            </div>

            {isManualOverride && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToEstimated}
                icon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                className="border-emerald-500/30 text-emerald-300 text-xs shrink-0"
              >
                Reset to Calculated
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div>
              <Input
                label="Daily Calorie Target (kcal)"
                type="number"
                value={targetCalories}
                onChange={(e) => {
                  setTargetCalories(Number(e.target.value));
                  setIsManualOverride(true);
                }}
                min={500}
                max={10000}
                required
              />
              {validationErrors.targetCalories && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.targetCalories}</p>
              )}
            </div>

            <div>
              <Input
                label="Daily Protein Target (grams)"
                type="number"
                value={targetProtein}
                onChange={(e) => {
                  setTargetProtein(Number(e.target.value));
                  setIsManualOverride(true);
                }}
                min={20}
                max={500}
                required
              />
              {validationErrors.targetProtein && (
                <p className="text-[11px] text-rose-400 mt-1">{validationErrors.targetProtein}</p>
              )}
            </div>
          </div>

          {/* Prominent Medical Advice Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <p className="leading-relaxed font-sans">
              <strong className="font-bold">Medical Disclaimer:</strong> These calculated numbers are general nutrition estimates and baseline recommendations, not medical advice. Consult a healthcare professional before starting any extreme diet program.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-xl shadow-emerald-500/20"
            disabled={isSaving}
            icon={isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            {isSaving ? 'Saving Profile to Firestore...' : 'Save Profile & Open Dashboard'}
          </Button>
        </GlassCard>
      </form>
    </div>
  );
};
