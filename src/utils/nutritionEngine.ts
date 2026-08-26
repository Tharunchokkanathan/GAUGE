import type { FoodItem, Recipe, RecipeIngredient, MacroNutritionSnapshot } from '../types';

/**
 * Calculates the exact nutritional contribution of a specific quantity (in grams) of a food item.
 * Formula: contribution = (quantityGrams / 100) * nutritionPer100g
 * 
 * Handles zero/invalid quantities gracefully and preserves null micronutrients.
 */
export function calculateIngredientNutrition(
  food: FoodItem | null | undefined,
  quantityGrams: number
): MacroNutritionSnapshot {
  if (!food || !food.nutritionPer100g || typeof quantityGrams !== 'number' || quantityGrams <= 0) {
    return {
      energyKcal: 0,
      proteinG: 0,
      carbohydratesG: 0,
      fatG: 0,
      fiberG: 0,
      sodiumMg: 0,
      calciumMg: 0,
      ironMg: 0
    };
  }

  const factor = quantityGrams / 100;
  const n = food.nutritionPer100g;

  return {
    energyKcal: Math.max(0, n.energyKcal * factor),
    proteinG: Math.max(0, n.proteinG * factor),
    carbohydratesG: Math.max(0, n.carbohydratesG * factor),
    fatG: Math.max(0, n.fatG * factor),
    fiberG: n.fiberG !== null ? Math.max(0, n.fiberG * factor) : null,
    sodiumMg: n.sodiumMg !== null ? Math.max(0, n.sodiumMg * factor) : null,
    calciumMg: n.calciumMg !== null ? Math.max(0, n.calciumMg * factor) : null,
    ironMg: n.ironMg !== null ? Math.max(0, n.ironMg * factor) : null
  };
}

/**
 * Calculates total nutritional values for a list of resolved ingredients (batch total).
 */
export function calculateRecipeNutrition(
  ingredientItems: { food: FoodItem; quantityGrams: number }[]
): MacroNutritionSnapshot {
  const totals: MacroNutritionSnapshot = {
    energyKcal: 0,
    proteinG: 0,
    carbohydratesG: 0,
    fatG: 0,
    fiberG: 0,
    sodiumMg: 0,
    calciumMg: 0,
    ironMg: 0
  };

  if (!Array.isArray(ingredientItems) || ingredientItems.length === 0) {
    return totals;
  }

  ingredientItems.forEach(({ food, quantityGrams }) => {
    const contrib = calculateIngredientNutrition(food, quantityGrams);
    totals.energyKcal += contrib.energyKcal;
    totals.proteinG += contrib.proteinG;
    totals.carbohydratesG += contrib.carbohydratesG;
    totals.fatG += contrib.fatG;

    if (contrib.fiberG !== null && totals.fiberG !== null) {
      totals.fiberG = (totals.fiberG || 0) + contrib.fiberG;
    }
    if (contrib.sodiumMg !== null && totals.sodiumMg !== null) {
      totals.sodiumMg = (totals.sodiumMg || 0) + contrib.sodiumMg;
    }
    if (contrib.calciumMg !== null && totals.calciumMg !== null) {
      totals.calciumMg = (totals.calciumMg || 0) + contrib.calciumMg;
    }
    if (contrib.ironMg !== null && totals.ironMg !== null) {
      totals.ironMg = (totals.ironMg || 0) + contrib.ironMg;
    }
  });

  return totals;
}

/**
 * Divides total batch nutrition by the number of servings to get per-serving nutrition.
 */
export function calculateServingNutrition(
  batchNutrition: MacroNutritionSnapshot,
  servings: number
): MacroNutritionSnapshot {
  const count = typeof servings === 'number' && servings > 0 ? servings : 1;

  return {
    energyKcal: roundToOneDecimal(batchNutrition.energyKcal / count),
    proteinG: roundToOneDecimal(batchNutrition.proteinG / count),
    carbohydratesG: roundToOneDecimal(batchNutrition.carbohydratesG / count),
    fatG: roundToOneDecimal(batchNutrition.fatG / count),
    fiberG: batchNutrition.fiberG !== null && batchNutrition.fiberG !== undefined
      ? roundToOneDecimal(batchNutrition.fiberG / count)
      : null,
    sodiumMg: batchNutrition.sodiumMg !== null && batchNutrition.sodiumMg !== undefined
      ? roundToOneDecimal(batchNutrition.sodiumMg / count)
      : null,
    calciumMg: batchNutrition.calciumMg !== null && batchNutrition.calciumMg !== undefined
      ? roundToOneDecimal(batchNutrition.calciumMg / count)
      : null,
    ironMg: batchNutrition.ironMg !== null && batchNutrition.ironMg !== undefined
      ? roundToOneDecimal(batchNutrition.ironMg / count)
      : null
  };
}

/**
 * Resolves recipe ingredients against a food dictionary, recalculating per-serving nutrition dynamically.
 * Optionally allows modifying oil quantity (customOilGrams) for instant calorie/fat adjustments.
 */
export function recalculateRecipeWithOil(
  recipe: Recipe,
  foodsMap: Map<string, FoodItem> | Record<string, FoodItem>,
  customOilGrams?: number
): MacroNutritionSnapshot {
  const resolved: { food: FoodItem; quantityGrams: number }[] = [];

  recipe.ingredients.forEach((ing) => {
    const food = foodsMap instanceof Map ? foodsMap.get(ing.foodId) : foodsMap[ing.foodId];
    if (!food) return;

    let qty = ing.quantityGrams;
    // Check if ingredient is an oil or fat (e.g. category 'oils_fats' or food ID matching oil)
    if (typeof customOilGrams === 'number' && (food.category === 'oils_fats' || food.id.includes('oil') || food.id.includes('ghee'))) {
      qty = customOilGrams;
    }

    resolved.push({ food, quantityGrams: qty });
  });

  const batchTotals = calculateRecipeNutrition(resolved);
  return calculateServingNutrition(batchTotals, recipe.servings);
}

function roundToOneDecimal(val: number): number {
  return Math.round(val * 10) / 10;
}
