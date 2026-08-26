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
export type OilLevel = 'none' | 'low' | 'medium' | 'high' | 'standard';
export type DietaryPreference = 'all' | 'high-protein' | 'low-carb' | 'vegetarian' | 'non-veg' | 'eggitarian';
export type Cuisine = 'south-indian' | 'tamil' | 'kerala' | 'andhra' | 'karnataka';

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodSource {
  provider: 'IFCT_2017' | 'USDA_FDC';
  dataset: string;
  sourceFoodId: string;
  sourceReference: string;
  sourceVersion: string;
  verified: boolean;
}

export interface FoodNutritionPer100g {
  energyKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  potassiumMg: number | null;
  vitaminAMcg: number | null;
  vitaminCMg: number | null;
  vitaminDMcg: number | null;
  vitaminB12Mcg: number | null;
  folateMcg: number | null;
}

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  subCategory: string;
  foodState: 'raw' | 'cooked' | 'boiled' | 'steamed' | 'fresh' | 'processed' | 'dried';
  scientificName: string | null;
  servingUnit: string;
  defaultServingGrams: number;
  nutritionPer100g: FoodNutritionPer100g;
  source: FoodSource;
  notes: string | null;
}

export interface RecipeIngredient {
  foodId: string;
  quantityGrams: number;
  notes?: string;
}

export interface MacroNutritionSnapshot {
  energyKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG?: number | null;
  sodiumMg?: number | null;
  calciumMg?: number | null;
  ironMg?: number | null;
}

export interface Recipe {
  id: string;
  name: string;
  nativeName?: string;
  description: string;
  mealType: MealType;
  cuisine: string;
  dietaryType: 'veg' | 'non-veg' | 'eggetarian' | 'vegan';
  servings: number;
  prepTimeMinutes: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  oilLevel: OilLevel;
  image?: string;
  source?: {
    author?: string;
    verified?: boolean;
  };
  calculatedNutrition?: MacroNutritionSnapshot;
}

export interface MealItem {
  id: string;
  recipeId?: string;
  name: string;
  nativeName?: string;
  type: MealType;
  cuisine: Cuisine | string;
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
  isCustom?: boolean;
  createdBy?: string;
  servings?: number;
  loggedMealId?: string;
  timestamp?: string;
  nutritionSnapshot?: MacroNutritionSnapshot;
}

export interface LoggedMeal {
  id: string;
  recipeId: string;
  recipeName: string;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  timestamp: string;
  nutritionSnapshot: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  image?: string;
  cuisine?: string;
  dietary?: string;
  oilLevel?: OilLevel;
  description?: string;
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
  targetFiber: number;
  consumedFiber: number;
}

export interface DailyHistoryRecord {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Aug 26"
  dayName: string; // e.g. "Wed"
  consumedCalories: number;
  targetCalories: number;
  consumedProtein: number;
  targetProtein: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
  consumedFiber: number;
  targetFiber: number;
  meals: MealItem[];
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

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly_active' 
  | 'moderately_active' 
  | 'very_active' 
  | 'extra_active';

export type UserGoal = 
  | 'fat_loss' 
  | 'maintenance' 
  | 'muscle_gain' 
  | 'body_recomposition';

export interface UserProfileData {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: UserGoal;
  targetCalories: number;
  targetProtein: number;
  dietaryPreference: string;
  oilPreference: OilLevel;
  isOnboarded?: boolean;
}

