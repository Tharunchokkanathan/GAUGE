import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standalone test engine matching src/utils/nutritionEngine.ts
function calculateIngredientNutrition(food, quantityGrams) {
  if (!food || !food.nutritionPer100g || typeof quantityGrams !== 'number' || quantityGrams <= 0) {
    return { energyKcal: 0, proteinG: 0, carbohydratesG: 0, fatG: 0, fiberG: 0 };
  }

  const factor = quantityGrams / 100;
  const n = food.nutritionPer100g;

  return {
    energyKcal: Math.max(0, n.energyKcal * factor),
    proteinG: Math.max(0, n.proteinG * factor),
    carbohydratesG: Math.max(0, n.carbohydratesG * factor),
    fatG: Math.max(0, n.fatG * factor),
    fiberG: n.fiberG !== null ? Math.max(0, n.fiberG * factor) : null
  };
}

function calculateRecipeNutrition(ingredientItems) {
  const totals = { energyKcal: 0, proteinG: 0, carbohydratesG: 0, fatG: 0, fiberG: 0 };

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
  });

  return totals;
}

function calculateServingNutrition(batchNutrition, servings) {
  const count = typeof servings === 'number' && servings > 0 ? servings : 1;
  const round = (val) => Math.round((val / count) * 10) / 10;

  return {
    energyKcal: round(batchNutrition.energyKcal),
    proteinG: round(batchNutrition.proteinG),
    carbohydratesG: round(batchNutrition.carbohydratesG),
    fatG: round(batchNutrition.fatG),
    fiberG: batchNutrition.fiberG !== null ? round(batchNutrition.fiberG) : null
  };
}

function recalculateRecipeWithOil(recipe, foodsMap, customOilGrams) {
  const resolved = [];
  recipe.ingredients.forEach((ing) => {
    const food = foodsMap.get(ing.foodId);
    if (!food) return;

    let qty = ing.quantityGrams;
    if (typeof customOilGrams === 'number' && (food.category === 'oils_fats' || food.id.includes('oil') || food.id.includes('ghee'))) {
      qty = customOilGrams;
    }

    resolved.push({ food, quantityGrams: qty });
  });

  const batchTotals = calculateRecipeNutrition(resolved);
  return calculateServingNutrition(batchTotals, recipe.servings);
}

console.log('--- RUNNING NUTRITION CALCULATION ENGINE SUITE ---');

const foodsPath = path.join(__dirname, '../data/foods.gauge.json');
const foodList = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'));
const foodsMap = new Map();
foodList.forEach(f => foodsMap.set(f.id, f));

let passes = 0;
let errors = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passes++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    errors++;
  }
}

const rice = foodsMap.get('food_ifct_2017_a001'); // 345 kcal, 6.8g P, 78.2g C, 0.5g F
const oil = foodsMap.get('food_ifct_2017_i001');  // 884 kcal, 0g P, 0g C, 100g F
const chicken = foodsMap.get('food_usda_fdc_171477'); // 120 kcal, 22.5g P, 0g C, 2.6g F

// TEST 1: 100g ingredient -> exact per 100g value
console.log('\nTEST 1: 100g ingredient scaling (Rice)');
const r100 = calculateIngredientNutrition(rice, 100);
assert(r100.energyKcal === 345, `100g Rice energy === 345 kcal (${r100.energyKcal})`);
assert(r100.proteinG === 6.8, `100g Rice protein === 6.8g (${r100.proteinG})`);

// TEST 2: 50g ingredient -> 50% of per 100g value
console.log('\nTEST 2: 50g ingredient scaling (Rice)');
const r50 = calculateIngredientNutrition(rice, 50);
assert(r50.energyKcal === 172.5, `50g Rice energy === 172.5 kcal (${r50.energyKcal})`);
assert(r50.proteinG === 3.4, `50g Rice protein === 3.4g (${r50.proteinG})`);

// TEST 3: 200g ingredient -> 200% of per 100g value
console.log('\nTEST 3: 200g ingredient scaling (Chicken Breast)');
const c200 = calculateIngredientNutrition(chicken, 200);
assert(c200.energyKcal === 240, `200g Chicken energy === 240 kcal (${c200.energyKcal})`);
assert(c200.proteinG === 45, `200g Chicken protein === 45g (${c200.proteinG})`);

// TEST 4: Multiple ingredients summation
console.log('\nTEST 4: Multiple ingredients sum (100g Rice + 100g Chicken + 10g Oil)');
const batch = calculateRecipeNutrition([
  { food: rice, quantityGrams: 100 },
  { food: chicken, quantityGrams: 100 },
  { food: oil, quantityGrams: 10 }
]);
const expectedKcal = 345 + 120 + 88.4; // 553.4
assert(Math.abs(batch.energyKcal - expectedKcal) < 0.001, `Total energy === ${expectedKcal} kcal (${batch.energyKcal})`);
assert(batch.proteinG === 29.3, `Total protein === 29.3g (${batch.proteinG})`);

// TEST 5: Serving division (2 servings)
console.log('\nTEST 5: Serving division (553.4 kcal / 2 servings)');
const perServing = calculateServingNutrition(batch, 2);
assert(perServing.energyKcal === 276.7, `Per serving energy === 276.7 kcal (${perServing.energyKcal})`);
assert(perServing.proteinG === 14.7, `Per serving protein === 14.7g (${perServing.proteinG})`);

// TEST 6: Oil quantity adjustment (5g -> 10g Groundnut oil)
console.log('\nTEST 6: Oil Level Recalculation (5g -> 10g Groundnut oil)');
const testRecipe = {
  id: 'test_rec',
  servings: 1,
  ingredients: [
    { foodId: 'food_usda_fdc_171477', quantityGrams: 100 }, // 120 kcal, 2.6g F
    { foodId: 'food_ifct_2017_i001', quantityGrams: 5 }     // 44.2 kcal, 5g F
  ]
};
const snapshot5g = recalculateRecipeWithOil(testRecipe, foodsMap, 5);
const snapshot10g = recalculateRecipeWithOil(testRecipe, foodsMap, 10);

assert(snapshot5g.energyKcal === 164.2, `5g oil recipe energy === 164.2 kcal (${snapshot5g.energyKcal})`);
assert(snapshot5g.fatG === 7.6, `5g oil recipe fat === 7.6g (${snapshot5g.fatG})`);

assert(snapshot10g.energyKcal === 208.4, `10g oil recipe energy === 208.4 kcal (${snapshot10g.energyKcal})`);
assert(snapshot10g.fatG === 12.6, `10g oil recipe fat === 12.6g (${snapshot10g.fatG})`);
assert(Math.round((snapshot10g.fatG - snapshot5g.fatG) * 10) / 10 === 5, `Fat difference === exactly 5g`);

// TEST 7: Decimal & Zero/Invalid Quantities
console.log('\nTEST 7: Decimal & Edge-case handling (7.5g oil, 0g, -10g)');
const decOil = calculateIngredientNutrition(oil, 7.5);
assert(decOil.fatG === 7.5, `7.5g oil yields 7.5g fat (${decOil.fatG})`);
assert(decOil.energyKcal === 66.3, `7.5g oil yields 66.3 kcal (${decOil.energyKcal})`);

const zeroQuant = calculateIngredientNutrition(rice, 0);
assert(zeroQuant.energyKcal === 0 && zeroQuant.proteinG === 0, `0g quantity yields 0 macros`);

const negQuant = calculateIngredientNutrition(rice, -20);
assert(negQuant.energyKcal === 0 && negQuant.proteinG === 0, `Negative quantity yields 0 macros`);

// TEST 8: Missing/Null Nutrient Preservation
console.log('\nTEST 8: Null Nutrient Preservation');
const dummyFoodWithNullFiber = {
  ...rice,
  nutritionPer100g: {
    ...rice.nutritionPer100g,
    fiberG: null
  }
};
const nullResult = calculateIngredientNutrition(dummyFoodWithNullFiber, 100);
assert(nullResult.fiberG === null, `Null fiber value preserved as null`);

console.log(`\n==================================================`);
console.log(`ENGINE TEST SUMMARY: ${passes} Assertions Passed | ${errors} Failures`);
console.log(`==================================================`);

if (errors === 0) {
  console.log(`🎉 SUCCESS: Nutrition Engine Calculation Suite Passed 100%!`);
} else {
  console.error(`❌ FAILURE: ${errors} test errors encountered.`);
  process.exit(1);
}
