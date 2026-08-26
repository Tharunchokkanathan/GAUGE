import type { MealItem, MealType, OilLevel, UserProfileData } from '../types';

export interface GeneratorFilterState {
  mealType: MealType;
  maxCalories: number;
  minProtein: number;
  cuisine: string; // 'all' | 'south-indian' | 'tamil' | 'kerala' | 'andhra' | 'karnataka'
  dietary: string; // 'all' | 'vegetarian' | 'eggitarian' | 'non-veg'
  oilLevel: OilLevel | 'any';
  maxPrepTimeMinutes: number | 'any';
  searchQuery: string;
  sortBy: 'smart' | 'calories_desc' | 'calories_asc' | 'protein_desc' | 'score_desc';
}

export interface RankedMealItem {
  meal: MealItem;
  matchScore: number; // 0 - 100 percentage
  matchReasons: string[];
}

/**
 * Deterministic Meal Recommendation & Ranking Algorithm for GAUGE.
 * 
 * Filters meals strictly by maxCalories, minProtein, mealType, cuisine, dietary, oil, and prep time.
 * Computes a deterministic composite match score without using AI.
 */
export function recommendMeals(
  allMeals: MealItem[],
  filters: GeneratorFilterState,
  userProfile?: UserProfileData
): RankedMealItem[] {
  if (!Array.isArray(allMeals) || allMeals.length === 0) {
    return [];
  }

  // 1. Strict Filtering Phase
  const eligibleMeals = allMeals.filter((meal) => {
    // Meal Type Filter
    if (filters.mealType !== 'all' && meal.type !== 'all' && meal.type !== filters.mealType) {
      return false;
    }

    // Calorie Cap Filter (recipe calories <= maximum calories)
    if (meal.macros.calories > filters.maxCalories) {
      return false;
    }

    // Protein Floor Filter (recipe protein >= minimum protein)
    if (meal.macros.protein < filters.minProtein) {
      return false;
    }

    // Cuisine Filter
    if (filters.cuisine !== 'all' && meal.cuisine !== filters.cuisine) {
      return false;
    }

    // Dietary Filter
    if (filters.dietary !== 'all' && meal.dietary !== filters.dietary) {
      return false;
    }

    // Oil Level Filter
    if (filters.oilLevel !== 'any' && meal.oilLevel !== filters.oilLevel) {
      return false;
    }

    // Max Prep Time Filter
    if (typeof filters.maxPrepTimeMinutes === 'number' && meal.prepTimeMinutes > filters.maxPrepTimeMinutes) {
      return false;
    }

    // Search Query Filter
    if (filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      const matchName = meal.name.toLowerCase().includes(query);
      const matchDesc = meal.description.toLowerCase().includes(query);
      const matchIng = meal.ingredients.some((ing) => ing.name.toLowerCase().includes(query));
      if (!matchName && !matchDesc && !matchIng) {
        return false;
      }
    }

    return true;
  });

  // 2. Ranking & Scoring Phase
  const ranked: RankedMealItem[] = eligibleMeals.map((meal) => {
    const reasons: string[] = [];

    // Calorie Efficiency (how close to maxCalories without exceeding)
    // 0 to 1 score
    const calDiff = filters.maxCalories - meal.macros.calories;
    const calorieCloseness = Math.max(0, 1 - calDiff / filters.maxCalories);
    if (calDiff <= 50) reasons.push('Optimal calorie fit');

    // Protein Surplus (how much extra protein above minProtein)
    const proteinDelta = meal.macros.protein - filters.minProtein;
    const proteinScore = Math.min(1, proteinDelta / Math.max(1, filters.minProtein));
    if (proteinDelta >= 10) reasons.push(`+${proteinDelta}g extra protein`);

    // Inherent Nutrition Score (0 to 1)
    const nutritionScoreNorm = (meal.nutritionScore || 75) / 100;
    if (meal.nutritionScore >= 90) reasons.push('Top nutrition score');

    // User Profile Alignment Bonus
    let userPrefBonus = 0;
    if (userProfile) {
      if (userProfile.dietaryPreference && meal.dietary.includes(userProfile.dietaryPreference)) {
        userPrefBonus += 0.5;
        reasons.push('Matches diet preference');
      }
      if (userProfile.oilPreference && meal.oilLevel === userProfile.oilPreference) {
        userPrefBonus += 0.5;
        reasons.push('Matches oil preference');
      }
    }

    // Prep Time Bonus (quicker meals get slight boost)
    const prepBonus = Math.max(0, (60 - (meal.prepTimeMinutes || 30)) / 60);

    // Weighted Composite Match Score (0 - 100 scale)
    const rawScore = 
      calorieCloseness * 40 +
      proteinScore * 30 +
      nutritionScoreNorm * 15 +
      userPrefBonus * 10 +
      prepBonus * 5;

    const matchScore = Math.min(99, Math.max(60, Math.round(rawScore)));

    return {
      meal,
      matchScore,
      matchReasons: reasons.length > 0 ? reasons : ['Fits exact macro targets']
    };
  });

  // 3. Sorting Phase
  return ranked.sort((a, b) => {
    switch (filters.sortBy) {
      case 'calories_desc':
        return b.meal.macros.calories - a.meal.macros.calories;
      case 'calories_asc':
        return a.meal.macros.calories - b.meal.macros.calories;
      case 'protein_desc':
        return b.meal.macros.protein - a.meal.macros.protein;
      case 'score_desc':
        return b.meal.nutritionScore - a.meal.nutritionScore;
      case 'smart':
      default:
        return b.matchScore - a.matchScore;
    }
  });
}
