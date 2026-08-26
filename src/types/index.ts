export type Route = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'onboarding' 
  | 'dashboard' 
  | 'generator' 
  | 'plan' 
  | 'history' 
  | 'favorites' 
  | 'profile';

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'all';
export type OilLevel = 'low' | 'medium' | 'standard';
export type DietaryPreference = 'all' | 'high-protein' | 'low-carb' | 'vegetarian' | 'non-veg' | 'eggitarian';
export type Cuisine = 'south-indian' | 'tamil' | 'kerala' | 'andhra' | 'karnataka';

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  id: string;
  name: string;
  nativeName?: string;
  type: MealType;
  cuisine: Cuisine;
  dietary: 'vegetarian' | 'non-veg' | 'eggitarian';
  oilLevel: OilLevel;
  macros: MacroNutrients;
  nutritionScore: number; // 1-100
  prepTimeMinutes: number;
  description: string;
  image: string;
  recipeSteps: string[];
  ingredients: { name: string; amount: string; calories: number; protein: number }[];
  isFavorite?: boolean;
}

export interface DailyNutritionTarget {
  targetCalories: number;
  consumedCalories: number;
  targetProtein: number;
  consumedProtein: number;
  targetCarbs: number;
  consumedCarbs: number;
  targetFat: number;
  consumedFat: number;
}

export interface GeneratorFilters {
  mealType: MealType;
  maxCalories: number;
  minProtein: number;
  cuisine: string;
  dietary: string;
  oilLevel: OilLevel | 'any';
  searchQuery: string;
}

export interface UserProfileData {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'very_active';
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  targetCalories: number;
  targetProtein: number;
  dietaryPreference: string;
  oilPreference: OilLevel;
}
