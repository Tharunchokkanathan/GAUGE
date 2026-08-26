import type { ActivityLevel, UserGoal, UserProfileData } from '../types';

export const ACTIVITY_LEVEL_OPTIONS: { value: ActivityLevel; label: string; description: string; multiplier: number }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job', multiplier: 1.2 },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise / sports 1-3 days/week', multiplier: 1.375 },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise / sports 3-5 days/week', multiplier: 1.55 },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise / sports 6-7 days/week', multiplier: 1.725 },
  { value: 'extra_active', label: 'Extra Active', description: 'Very hard exercise, physical job or 2x training', multiplier: 1.9 }
];

export const GOAL_OPTIONS: { value: UserGoal; label: string; description: string; calorieDelta: number; proteinMultiplier: number }[] = [
  { value: 'fat_loss', label: 'Fat Loss', description: 'Calorie deficit for sustainable weight & body fat reduction (-500 kcal)', calorieDelta: -500, proteinMultiplier: 2.0 },
  { value: 'maintenance', label: 'Maintenance', description: 'Maintain current body weight & energy balance', calorieDelta: 0, proteinMultiplier: 1.6 },
  { value: 'muscle_gain', label: 'Muscle Gain', description: 'Calorie surplus paired with progressive resistance training (+300 kcal)', calorieDelta: 300, proteinMultiplier: 2.0 },
  { value: 'body_recomposition', label: 'Body Recomposition', description: 'Slight deficit with high protein to build muscle while losing fat (-200 kcal)', calorieDelta: -200, proteinMultiplier: 2.2 }
];

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' | 'other'): number {
  const genderAdjustment = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + genderAdjustment;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export function calculateTDEE(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' | 'other', activityLevel: ActivityLevel): number {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const activity = ACTIVITY_LEVEL_OPTIONS.find((a) => a.value === activityLevel) || ACTIVITY_LEVEL_OPTIONS[0];
  return Math.round(bmr * activity.multiplier);
}

/**
 * Calculates estimated daily calorie and protein target recommendation based on profile.
 */
export function calculateNutritionTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: ActivityLevel,
  goal: UserGoal
): { estimatedCalories: number; estimatedProtein: number } {
  const tdee = calculateTDEE(weightKg, heightCm, age, gender, activityLevel);
  const goalConfig = GOAL_OPTIONS.find((g) => g.value === goal) || GOAL_OPTIONS[0];

  const estimatedCalories = Math.max(1200, Math.round(tdee + goalConfig.calorieDelta));
  const estimatedProtein = Math.round(weightKg * goalConfig.proteinMultiplier);

  return { estimatedCalories, estimatedProtein };
}

/**
 * Validates profile fields and returns error strings if invalid.
 */
export function validateProfileInput(profile: Partial<UserProfileData>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!profile.name || profile.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (typeof profile.age !== 'number' || isNaN(profile.age) || profile.age < 10 || profile.age > 120) {
    errors.age = 'Age must be between 10 and 120 years.';
  }

  if (typeof profile.heightCm !== 'number' || isNaN(profile.heightCm) || profile.heightCm < 50 || profile.heightCm > 250) {
    errors.heightCm = 'Height must be between 50 cm and 250 cm.';
  }

  if (typeof profile.weightKg !== 'number' || isNaN(profile.weightKg) || profile.weightKg < 20 || profile.weightKg > 300) {
    errors.weightKg = 'Weight must be between 20 kg and 300 kg.';
  }

  if (typeof profile.targetCalories !== 'number' || isNaN(profile.targetCalories) || profile.targetCalories < 500 || profile.targetCalories > 10000) {
    errors.targetCalories = 'Calorie target must be between 500 and 10,000 kcal.';
  }

  if (typeof profile.targetProtein !== 'number' || isNaN(profile.targetProtein) || profile.targetProtein < 20 || profile.targetProtein > 500) {
    errors.targetProtein = 'Protein target must be between 20g and 500g.';
  }

  return errors;
}
