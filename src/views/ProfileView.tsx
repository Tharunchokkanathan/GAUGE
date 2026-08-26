import React, { useState } from 'react';
import { LogOut, Flame, Dumbbell, Shield, Edit3, Save, X, RefreshCw, AlertTriangle, Scale, UserCheck } from 'lucide-react';
import type { Route, UserProfileData, OilLevel, ActivityLevel, UserGoal } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import { FirestoreUserService } from '../services/firestore';
import { 
  ACTIVITY_LEVEL_OPTIONS, 
  GOAL_OPTIONS, 
  calculateNutritionTargets, 
  validateProfileInput 
} from '../utils/nutritionCalculator';

interface ProfileViewProps {
  onNavigate: (route: Route) => void;
  profile: UserProfileData;
  onSaveProfile: (profile: UserProfileData) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  profile,
  onSaveProfile
}) => {
  const { logout, user } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Form State
  const [name, setName] = useState<string>(profile.name || 'Tharun Kumar');
  const [age, setAge] = useState<number>(profile.age || 28);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 76);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderately_active');
  const [goal, setGoal] = useState<UserGoal>(profile.goal || 'muscle_gain');
  const [dietaryPreference, setDietaryPreference] = useState<string>(profile.dietaryPreference || 'non-veg');
  const [oilPreference, setOilPreference] = useState<OilLevel>(profile.oilPreference || 'low');
  const [targetCalories, setTargetCalories] = useState<number>(profile.targetCalories || 2200);
  const [targetProtein, setTargetProtein] = useState<number>(profile.targetProtein || 140);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getInitials = (str: string) => {
    return str
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

  const handleRecalculateEstimates = () => {
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const updated: UserProfileData = {
      ...profile,
      name,
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

    const errors = validateProfileInput(updated);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMsg('Please correct the invalid fields.');
      return;
    }

    setValidationErrors({});
    setIsSaving(true);

    try {
      onSaveProfile(updated);

      if (user?.uid) {
        await FirestoreUserService.saveProfile(user.uid, updated);
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatGoalName = (g: UserGoal) => {
    switch (g) {
      case 'fat_loss': return 'Fat Loss';
      case 'maintenance': return 'Maintenance';
      case 'muscle_gain': return 'Muscle Gain';
      case 'body_recomposition': return 'Body Recomposition';
      default: return g;
    }
  };

  const formatActivityName = (a: ActivityLevel) => {
    const found = ACTIVITY_LEVEL_OPTIONS.find((opt) => opt.value === a);
    return found ? found.label : a;
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Profile Header */}
      <GlassCard variant="gradient" className="p-6 sm:p-8 space-y-6 border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400 font-extrabold text-2xl">
              {getInitials(profile.name || 'Tharun')}
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{profile.email || user?.email}</p>
            <p className="text-[11px] text-emerald-400 font-medium">
              Firestore UID: <span className="font-mono text-slate-400">{user?.uid || 'authenticated-user-uid'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<Edit3 className="w-4 h-4 text-emerald-400" />}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                icon={<X className="w-4 h-4 text-slate-400" />}
              >
                Cancel
              </Button>
            )}

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
        </div>

        {/* Current Target Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Daily Calories</span>
            <span className="text-xl font-extrabold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-4 h-4" /> {profile.targetCalories} kcal
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Daily Protein</span>
            <span className="text-xl font-extrabold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <Dumbbell className="w-4 h-4" /> {profile.targetProtein}g
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Diet Preference</span>
            <span className="text-xs font-bold text-teal-300 capitalize mt-1.5 block">
              {profile.dietaryPreference}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Fitness Goal</span>
            <span className="text-xs font-bold text-cyan-300 capitalize mt-1.5 block">
              {formatGoalName(profile.goal)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* View Mode vs Edit Mode */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Physical Metrics Summary */}
          <GlassCard variant="interactive" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" /> Body Metrics & Target Profile
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Modify Parameters
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-400 block font-sans mb-1">Age & Gender</span>
                <span className="text-white font-bold text-sm">{profile.age} yrs • {profile.gender}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-400 block font-sans mb-1">Height</span>
                <span className="text-white font-bold text-sm">{profile.heightCm} cm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-400 block font-sans mb-1">Weight</span>
                <span className="text-white font-bold text-sm">{profile.weightKg} kg</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-slate-400 block font-sans mb-1">Activity Level</span>
                <span className="text-emerald-400 font-bold capitalize text-sm">{formatActivityName(profile.activityLevel)}</span>
              </div>
            </div>
          </GlassCard>

          {/* Medical Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <p className="leading-relaxed font-sans">
              <strong className="font-bold">Medical Disclaimer:</strong> Target numbers are general nutritional estimates calculated from Mifflin-St Jeor formulas, not medical advice.
            </p>
          </div>
        </div>
      ) : (
        /* Edit Profile Form */
        <form onSubmit={handleSave} className="space-y-6">
          <GlassCard variant="gradient" className="p-6 space-y-5 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" /> Edit Profile & Targets
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRecalculateEstimates}
                icon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                className="text-xs text-emerald-300"
              >
                Auto-Recalculate Targets
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Activity Level"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                options={ACTIVITY_LEVEL_OPTIONS.map((a) => ({
                  value: a.value,
                  label: a.label
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
                label="Oil Preference"
                value={oilPreference}
                onChange={(e) => setOilPreference(e.target.value as OilLevel)}
                options={[
                  { value: 'none', label: 'Zero Oil / Steamed' },
                  { value: 'low', label: 'Low Oil' },
                  { value: 'medium', label: 'Medium Oil' },
                  { value: 'standard', label: 'Standard Oil' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono pt-2 border-t border-slate-800">
              <div>
                <Input
                  label="Daily Calorie Target (kcal)"
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
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
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  min={20}
                  max={500}
                  required
                />
                {validationErrors.targetProtein && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.targetProtein}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 shadow-lg shadow-emerald-500/20"
                disabled={isSaving}
                icon={isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              >
                {isSaving ? 'Saving to Firestore...' : 'Save Profile Changes'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* Security Status */}
      <GlassCard variant="subtle" className="p-5 space-y-3 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-3 text-xs font-bold text-emerald-400">
          <Shield className="w-5 h-5" />
          <span>Firestore Security Rules Active (`users/{'{uid}'}/profile/data`)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your personal metrics and target macro configurations are persisted directly to your scoped Firebase authentication path.
        </p>
      </GlassCard>
    </div>
  );
};
