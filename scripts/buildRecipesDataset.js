import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculation Engine ESM
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

const foodsPath = path.join(__dirname, '../data/foods.gauge.json');
if (!fs.existsSync(foodsPath)) {
  console.error('ERROR: data/foods.gauge.json missing!');
  process.exit(1);
}

const foodList = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'));
const foodsMap = new Map();
foodList.forEach(f => foodsMap.set(f.id, f));

const rawRecipes = [
  // 1. Plain Dosa
  {
    id: 'recipe_plain_dosa',
    name: 'Plain Dosa',
    nativeName: 'தோசை',
    description: 'Crispy fermented rice and lentil crepe served hot with chutney.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 15,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a005', quantityGrams: 120, notes: 'Idli rice batter' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 40, notes: 'Split urad dal' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil for greasing' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 3, notes: 'Table salt' },
      { foodId: 'food_ifct_2017_j065', quantityGrams: 2, notes: 'Fenugreek seeds' }
    ],
    instructions: [
      'Soak Idli rice and Urad dal with fenugreek for 4 hours.',
      'Grind into a smooth batter and ferment overnight.',
      'Heat a tawa, pour ladle of batter, spread thin and drizzle 5g groundnut oil per dosa.',
      'Cook until golden crispy and fold.'
    ]
  },
  // 2. Egg Dosa
  {
    id: 'recipe_egg_dosa',
    name: 'Egg Dosa (Muttai Dosa)',
    nativeName: 'முட்டை தோசை',
    description: 'Crispy dosa topped with seasoned beaten whole egg and crushed pepper.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'eggetarian',
    servings: 2,
    prepTimeMinutes: 15,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a005', quantityGrams: 120, notes: 'Idli rice batter' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 40, notes: 'Split urad dal' },
      { foodId: 'food_ifct_2017_c001', quantityGrams: 100, notes: '2 Whole hen eggs' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 3, notes: 'Salt' },
      { foodId: 'food_ifct_2017_j040', quantityGrams: 3, notes: 'Black pepper powder' }
    ],
    instructions: [
      'Spread dosa batter on hot tawa.',
      'Crack one egg over each dosa, spread evenly with salt and black pepper.',
      'Drizzle oil along edges, flip gently and cook both sides.'
    ]
  },
  // 3. Chicken Dosa
  {
    id: 'recipe_chicken_dosa',
    name: 'Kari Dosa (Chicken Dosa)',
    nativeName: 'கோழி தோசை',
    description: 'Madurai style thick dosa stuffed with minced Chettinad chicken masala.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'non-veg',
    servings: 2,
    prepTimeMinutes: 25,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a005', quantityGrams: 120, notes: 'Idli rice batter' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 40, notes: 'Split urad dal' },
      { foodId: 'food_usda_fdc_171477', quantityGrams: 150, notes: 'Boneless chicken breast, minced' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 50, notes: 'Red onion, finely chopped' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j001', quantityGrams: 5, notes: 'Fresh ginger paste' },
      { foodId: 'food_ifct_2017_j005', quantityGrams: 5, notes: 'Garlic paste' }
    ],
    instructions: [
      'Sauté minced chicken with onion, ginger, garlic, and spices until dry.',
      'Pour thick dosa batter on tawa.',
      'Top generously with chicken minced masala, drizzle oil, cook until bottom is crisp and top is done.'
    ]
  },
  // 4. Soft Idli
  {
    id: 'recipe_idli',
    name: 'Malli Poo Idli (Steamed Rice Cakes)',
    nativeName: 'இட்லி',
    description: 'Soft steamed fermented rice and black gram cakes.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 4,
    prepTimeMinutes: 20,
    oilLevel: 'none',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a005', quantityGrams: 200, notes: 'Idli rice' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 60, notes: 'Urad dal split' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 4, notes: 'Salt' }
    ],
    instructions: [
      'Grind soaked rice and urad dal to fluffy batter.',
      'Ferment for 8 hours.',
      'Pour into greased idli molds and steam for 10 minutes.'
    ]
  },
  // 5. Kuzhi Paniyaram
  {
    id: 'recipe_paniyaram',
    name: 'Kuzhi Paniyaram',
    nativeName: 'குழி பணியாரம்',
    description: 'Crispy outside, soft inside spiced batter dumplings cooked in a special pan.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a005', quantityGrams: 100, notes: 'Idli rice batter' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 30, notes: 'Urad dal' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 40, notes: 'Onion chopped' },
      { foodId: 'food_ifct_2017_j010', quantityGrams: 5, notes: 'Green chilli' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 8, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j035', quantityGrams: 2, notes: 'Mustard seeds' },
      { foodId: 'food_ifct_2017_j045', quantityGrams: 2, notes: 'Curry leaves' }
    ],
    instructions: [
      'Temper mustard, green chillies, curry leaves, and onions in oil.',
      'Mix tempered ingredients into fermented dosa batter.',
      'Pour into paniyaram pan cavities and cook turning until golden.'
    ]
  },
  // 6. Protein Adai
  {
    id: 'recipe_adai',
    name: 'High Protein Multi-Lentil Adai',
    nativeName: 'அடை',
    description: 'Dense protein-rich spiced crepe made with a blend of 4 native lentils.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 3,
    prepTimeMinutes: 20,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 100, notes: 'Parboiled rice' },
      { foodId: 'food_ifct_2017_b001', quantityGrams: 50, notes: 'Toor dal' },
      { foodId: 'food_ifct_2017_b007', quantityGrams: 50, notes: 'Chana dal' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 30, notes: 'Urad dal' },
      { foodId: 'food_ifct_2017_b005', quantityGrams: 30, notes: 'Moong dal' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 12, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 5, notes: 'Red chilli powder' },
      { foodId: 'food_ifct_2017_j060', quantityGrams: 1, notes: 'Asafoetida / Hing' }
    ],
    instructions: [
      'Soak rice and all lentils for 3 hours.',
      'Coarsely grind with red chillies and asafoetida.',
      'Spread thick adai on hot tawa, make a small center hole, add oil and cook both sides.'
    ]
  },
  // 7. Ragi Dosa
  {
    id: 'recipe_ragi_dosa',
    name: 'Ragi Dosa (Finger Millet Crepe)',
    nativeName: 'ரகி தோசை',
    description: 'Calcium-rich finger millet dosa with crisp texture.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 15,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a014', quantityGrams: 100, notes: 'Ragi flour / Finger millet' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 30, notes: 'Urad dal' },
      { foodId: 'food_ifct_2017_a001', quantityGrams: 30, notes: 'Raw rice' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 8, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 3, notes: 'Salt' }
    ],
    instructions: [
      'Mix ragi flour into urad dal batter.',
      'Pour thin crepe on tawa, drizzle minimal oil and cook until crisp.'
    ]
  },
  // 8. Ragi Idli
  {
    id: 'recipe_ragi_idli',
    name: 'Ragi Idli (Finger Millet Steamed Cakes)',
    nativeName: 'கேழ்வரகு இட்லி',
    description: 'High calcium and high fiber nutrient-dense millet idlis.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 4,
    prepTimeMinutes: 20,
    oilLevel: 'none',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a014', quantityGrams: 150, notes: 'Ragi millet whole' },
      { foodId: 'food_ifct_2017_a005', quantityGrams: 100, notes: 'Idli rice' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 50, notes: 'Urad dal' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 4, notes: 'Salt' }
    ],
    instructions: [
      'Soak and grind ragi, idli rice, and urad dal.',
      'Ferment for 8 hours.',
      'Steam in idli plates for 12 minutes.'
    ]
  },
  // 9. Vegetable Upma
  {
    id: 'recipe_upma',
    name: 'Vegetable Wheat Upma',
    nativeName: 'உப்மா',
    description: 'Traditional roasted wheat upma cooked with fresh garden vegetables.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 15,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a018', quantityGrams: 100, notes: 'Whole wheat rava' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 50, notes: 'Onion' },
      { foodId: 'food_ifct_2017_f015', quantityGrams: 30, notes: 'Carrot' },
      { foodId: 'food_ifct_2017_f080', quantityGrams: 30, notes: 'Green peas' },
      { foodId: 'food_ifct_2017_i005', quantityGrams: 8, notes: 'Sesame oil' },
      { foodId: 'food_ifct_2017_j035', quantityGrams: 3, notes: 'Mustard seeds' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 3, notes: 'Salt' }
    ],
    instructions: [
      'Dry roast rava until fragrant.',
      'Heat oil, crackle mustard, sauté onions and veggies.',
      'Add water, bring to boil, stir in rava continuously until soft and fluffy.'
    ]
  },
  // 10. Ven Pongal
  {
    id: 'recipe_ven_pongal',
    name: 'Traditional Ven Pongal',
    nativeName: 'வெண் பொங்கல்',
    description: 'Comforting rice and moong dal porridge tempered with ghee, pepper, and cashews.',
    mealType: 'breakfast',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 3,
    prepTimeMinutes: 20,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a001', quantityGrams: 150, notes: 'Raw rice' },
      { foodId: 'food_ifct_2017_b005', quantityGrams: 60, notes: 'Moong dal split' },
      { foodId: 'food_ifct_2017_i020', quantityGrams: 12, notes: 'Pure cow ghee' },
      { foodId: 'food_ifct_2017_j030', quantityGrams: 4, notes: 'Cumin seeds' },
      { foodId: 'food_ifct_2017_j040', quantityGrams: 4, notes: 'Whole black pepper' },
      { foodId: 'food_ifct_2017_j001', quantityGrams: 6, notes: 'Fresh ginger' },
      { foodId: 'food_ifct_2017_h010', quantityGrams: 10, notes: 'Cashews' },
      { foodId: 'food_ifct_2017_j045', quantityGrams: 2, notes: 'Curry leaves' }
    ],
    instructions: [
      'Pressure cook rice and moong dal together until soft.',
      'Heat ghee in a pan, fry cashews, cumin, pepper, ginger, and curry leaves.',
      'Pour tempering over cooked pongal and mix well.'
    ]
  },
  // 11. Rice + Sambar
  {
    id: 'recipe_rice_sambar',
    name: 'South Indian Meal: Rice + Drumstick Sambar',
    nativeName: 'சாம்பார் சாதம்',
    description: 'Staple lunch featuring boiled parboiled rice with lentil vegetable sambar.',
    mealType: 'lunch',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 30,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 150, notes: 'Parboiled rice dry' },
      { foodId: 'food_ifct_2017_b001', quantityGrams: 50, notes: 'Toor dal' },
      { foodId: 'food_ifct_2017_f040', quantityGrams: 50, notes: 'Drumstick pieces' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 50, notes: 'Tomato' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 40, notes: 'Red onion' },
      { foodId: 'food_ifct_2017_j050', quantityGrams: 15, notes: 'Tamarind pulp' },
      { foodId: 'food_ifct_2017_i005', quantityGrams: 8, notes: 'Sesame oil' },
      { foodId: 'food_ifct_2017_j020', quantityGrams: 3, notes: 'Turmeric powder' },
      { foodId: 'food_ifct_2017_j035', quantityGrams: 2, notes: 'Mustard seeds' }
    ],
    instructions: [
      'Cook parboiled rice until soft.',
      'Boil Toor dal with turmeric. Cook vegetables in tamarind extract.',
      'Combine dal and cooked veggies, add sambar spices and temper with mustard seeds in oil.'
    ]
  },
  // 12. Rice + Dal Fry
  {
    id: 'recipe_rice_dal',
    name: 'Home Style Rice + Paruppu Dal Fry',
    nativeName: 'பருப்பு சாதம்',
    description: 'Simple digestible lunch bowl of rice served with tempered garlic toor dal.',
    mealType: 'lunch',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 150, notes: 'Parboiled rice' },
      { foodId: 'food_ifct_2017_b001', quantityGrams: 60, notes: 'Toor dal' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 40, notes: 'Onion' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 40, notes: 'Tomato' },
      { foodId: 'food_ifct_2017_j005', quantityGrams: 8, notes: 'Garlic cloves' },
      { foodId: 'food_ifct_2017_i020', quantityGrams: 8, notes: 'Cow ghee' },
      { foodId: 'food_ifct_2017_j030', quantityGrams: 3, notes: 'Cumin seeds' }
    ],
    instructions: [
      'Cook rice and dal separately.',
      'Sauté garlic, onion, tomato, and cumin in ghee.',
      'Mix seasoned dal into rice and serve hot.'
    ]
  },
  // 13. South Indian Chicken Rice Bowl
  {
    id: 'recipe_chicken_rice',
    name: 'High Protein Chicken Rice Bowl',
    nativeName: 'கோழி சாதம்',
    description: 'Lean chicken breast cooked in Tamil spice masala served with rice.',
    mealType: 'lunch',
    cuisine: 'south-indian',
    dietaryType: 'non-veg',
    servings: 2,
    prepTimeMinutes: 25,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 150, notes: 'Parboiled rice' },
      { foodId: 'food_usda_fdc_171477', quantityGrams: 200, notes: 'Lean boneless chicken breast' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 60, notes: 'Onion' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 50, notes: 'Tomato' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j001', quantityGrams: 6, notes: 'Ginger' },
      { foodId: 'food_ifct_2017_j005', quantityGrams: 6, notes: 'Garlic' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 4, notes: 'Red chilli powder' }
    ],
    instructions: [
      'Sauté ginger-garlic paste and onions in oil.',
      'Add chicken breast cubes and spices, simmer until juicy and tender.',
      'Serve alongside steamed parboiled rice.'
    ]
  },
  // 14. Chettinad Chicken Curry + Rice
  {
    id: 'recipe_chicken_curry_rice',
    name: 'Chettinad Chicken Curry + Basmati Rice',
    nativeName: 'செட்டிநாடு கோழி குழம்பு',
    description: 'Spicy aromatic Chettinad chicken curry with roasted coconut and spices.',
    mealType: 'lunch',
    cuisine: 'south-indian',
    dietaryType: 'non-veg',
    servings: 2,
    prepTimeMinutes: 30,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a004', quantityGrams: 150, notes: 'Basmati rice' },
      { foodId: 'food_ifct_2017_c010', quantityGrams: 220, notes: 'Chicken meat' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 80, notes: 'Onions' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 60, notes: 'Tomatoes' },
      { foodId: 'food_ifct_2017_j055', quantityGrams: 20, notes: 'Fresh grated coconut' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 12, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j070', quantityGrams: 3, notes: 'Fennel seeds' },
      { foodId: 'food_ifct_2017_j001', quantityGrams: 8, notes: 'Ginger' }
    ],
    instructions: [
      'Roast fennel and coconut, grind to paste.',
      'Cook chicken with onions, tomatoes, and ground masala in oil.',
      'Serve rich curry over fluffy cooked basmati rice.'
    ]
  },
  // 15. Kerala Fish Curry + Rice
  {
    id: 'recipe_fish_curry_rice',
    name: 'Kerala Sardine (Mathi) Fish Curry + Rice',
    nativeName: 'மீன் குழம்பு',
    description: 'Tangy Omega-3 rich fish curry cooked in coconut oil with kudampuli tamarind.',
    mealType: 'lunch',
    cuisine: 'kerala',
    dietaryType: 'non-veg',
    servings: 2,
    prepTimeMinutes: 25,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 150, notes: 'Parboiled rice' },
      { foodId: 'food_ifct_2017_d005', quantityGrams: 200, notes: 'Mathi / Sardine fish' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 50, notes: 'Tomato' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 40, notes: 'Shallots / Onion' },
      { foodId: 'food_ifct_2017_i010', quantityGrams: 10, notes: 'Coconut oil' },
      { foodId: 'food_ifct_2017_j050', quantityGrams: 15, notes: 'Tamarind pulp' },
      { foodId: 'food_ifct_2017_j065', quantityGrams: 2, notes: 'Fenugreek seeds' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 5, notes: 'Red chilli powder' }
    ],
    instructions: [
      'Sauté shallots, fenugreek, and chilli powder in coconut oil in a clay pot.',
      'Add tamarind water and bring to simmer.',
      'Add fresh sardines and cook gently for 10 minutes.'
    ]
  },
  // 16. Curd Rice
  {
    id: 'recipe_curd_rice',
    name: 'Tempered Curd Rice (Thayir Sadam)',
    nativeName: 'தயிர் சாதம்',
    description: 'Probiotic cooling curd rice tempered with mustard, ginger, and curry leaves.',
    mealType: 'lunch',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 10,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a001', quantityGrams: 120, notes: 'Soft cooked raw rice' },
      { foodId: 'food_ifct_2017_e010', quantityGrams: 150, notes: 'Fresh curd / yogurt' },
      { foodId: 'food_ifct_2017_e001', quantityGrams: 50, notes: 'Cow milk' },
      { foodId: 'food_ifct_2017_j035', quantityGrams: 3, notes: 'Mustard seeds' },
      { foodId: 'food_ifct_2017_j001', quantityGrams: 5, notes: 'Ginger finely chopped' },
      { foodId: 'food_ifct_2017_j010', quantityGrams: 4, notes: 'Green chilli' },
      { foodId: 'food_ifct_2017_i005', quantityGrams: 6, notes: 'Sesame oil' },
      { foodId: 'food_ifct_2017_j045', quantityGrams: 2, notes: 'Curry leaves' }
    ],
    instructions: [
      'Mash soft cooked rice, mix in curd and milk.',
      'Temper mustard, green chilli, ginger, and curry leaves in sesame oil.',
      'Pour tempering over curd rice and mix gently.'
    ]
  },
  // 17. Vegetable Pulav
  {
    id: 'recipe_veg_rice',
    name: 'Garden Vegetable Pulav',
    nativeName: 'காய்கறி புலாவ்',
    description: 'Fragrant basmati rice cooked with carrots, beans, and sweet green peas.',
    mealType: 'lunch',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a004', quantityGrams: 140, notes: 'Basmati rice' },
      { foodId: 'food_ifct_2017_f015', quantityGrams: 40, notes: 'Diced carrot' },
      { foodId: 'food_ifct_2017_f020', quantityGrams: 40, notes: 'French beans' },
      { foodId: 'food_ifct_2017_f080', quantityGrams: 30, notes: 'Fresh green peas' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 40, notes: 'Sliced onion' },
      { foodId: 'food_ifct_2017_i020', quantityGrams: 10, notes: 'Ghee' },
      { foodId: 'food_ifct_2017_j080', quantityGrams: 2, notes: 'Cinnamon stick' },
      { foodId: 'food_ifct_2017_j075', quantityGrams: 1, notes: 'Green cardamom' }
    ],
    instructions: [
      'Sauté cinnamon, cardamom, and onions in ghee.',
      'Add vegetables and basmati rice, stir for 2 minutes.',
      'Add water and pressure cook for 1 whistle.'
    ]
  },
  // 18. Whole Wheat Chapati + Egg Roast
  {
    id: 'recipe_chapati_egg',
    name: 'Atta Chapati + Spiced Egg Roast',
    nativeName: 'சப்பாத்தி முட்டை ஃப்ரை',
    description: 'Soft whole wheat chapatis paired with South Indian egg masala roast.',
    mealType: 'dinner',
    cuisine: 'south-indian',
    dietaryType: 'eggetarian',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a018', quantityGrams: 100, notes: 'Whole wheat flour / Atta' },
      { foodId: 'food_ifct_2017_c001', quantityGrams: 100, notes: '2 Hen eggs' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 60, notes: 'Sliced onions' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 40, notes: 'Chopped tomatoes' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 3, notes: 'Red chilli powder' }
    ],
    instructions: [
      'Knead wheat dough with water and roll into chapatis; cook on dry tawa.',
      'Sauté onions, tomatoes, chillies in oil; toss boiled halved eggs into masala.',
      'Serve warm chapatis with egg roast.'
    ]
  },
  // 19. Low-Oil Chicken Fry + Idli
  {
    id: 'recipe_low_oil_chicken_fry_idli',
    name: 'Low-Oil Chicken Fry + Steamed Idlis',
    nativeName: 'சிக்கன் ஃப்ரை + இட்லி',
    description: 'Pan-sear air-style chicken breast dry fry served with light steamed idlis.',
    mealType: 'dinner',
    cuisine: 'south-indian',
    dietaryType: 'non-veg',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a005', quantityGrams: 100, notes: 'Idli rice' },
      { foodId: 'food_ifct_2017_b003', quantityGrams: 30, notes: 'Urad dal' },
      { foodId: 'food_usda_fdc_171477', quantityGrams: 200, notes: 'Chicken breast fillet' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 6, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j001', quantityGrams: 6, notes: 'Ginger paste' },
      { foodId: 'food_ifct_2017_j005', quantityGrams: 6, notes: 'Garlic paste' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 4, notes: 'Chilli powder' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 3, notes: 'Salt' }
    ],
    instructions: [
      'Marinate chicken breast with ginger, garlic, chilli, and salt.',
      'Pan fry with just 6g groundnut oil on medium flame until golden cooked.',
      'Serve alongside fresh hot idlis.'
    ]
  },
  // 20. Egg Curry + Rice
  {
    id: 'recipe_egg_curry_rice',
    name: 'South Indian Boiled Egg Curry + Rice',
    nativeName: 'முட்டை குழம்பு சாதம்',
    description: 'Hard-boiled eggs simmered in onion-fennel gravy served with rice.',
    mealType: 'dinner',
    cuisine: 'south-indian',
    dietaryType: 'eggetarian',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 120, notes: 'Parboiled rice' },
      { foodId: 'food_ifct_2017_c004', quantityGrams: 100, notes: '2 Boiled country eggs' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 60, notes: 'Onion' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 50, notes: 'Tomato' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j070', quantityGrams: 3, notes: 'Fennel seeds' }
    ],
    instructions: [
      'Cook parboiled rice.',
      'Sauté fennel seeds, onions, tomatoes in oil; simmer boiled eggs in gravy.',
      'Serve hot over rice.'
    ]
  },
  // 21. Vanjaram Fish Fry + Rice
  {
    id: 'recipe_fish_fry_rice',
    name: 'Seer Fish (Vanjaram) Tawa Fry + Rice',
    nativeName: 'வஞ்சரம் மீன் வறுவல்',
    description: 'Crispy shallow-fried Kingfish steak spiced with red chilli served with rice.',
    mealType: 'dinner',
    cuisine: 'south-indian',
    dietaryType: 'non-veg',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 120, notes: 'Parboiled rice' },
      { foodId: 'food_ifct_2017_d015', quantityGrams: 180, notes: 'Seer fish / Vanjaram steak' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 5, notes: 'Red chilli powder' },
      { foodId: 'food_ifct_2017_j020', quantityGrams: 2, notes: 'Turmeric' },
      { foodId: 'food_ifct_2017_k010', quantityGrams: 3, notes: 'Salt' }
    ],
    instructions: [
      'Coat Vanjaram fish steaks with chilli, turmeric, and salt paste.',
      'Shallow fry on tawa with groundnut oil for 4 minutes each side.',
      'Serve hot with rice.'
    ]
  },
  // 22. Kala Chana Sundal
  {
    id: 'recipe_kala_chana_sundal',
    name: 'Black Chickpea Sundal (Kala Chana)',
    nativeName: 'கருப்பு கொண்டைக்கடலை சுண்டல்',
    description: 'High-protein high-fiber boiled black chickpea snack tempered with mustard and fresh coconut.',
    mealType: 'snack',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 15,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_b012', quantityGrams: 100, notes: 'Black chickpeas dry' },
      { foodId: 'food_ifct_2017_j055', quantityGrams: 15, notes: 'Grated coconut' },
      { foodId: 'food_ifct_2017_j035', quantityGrams: 2, notes: 'Mustard seeds' },
      { foodId: 'food_ifct_2017_j010', quantityGrams: 4, notes: 'Green chilli' },
      { foodId: 'food_ifct_2017_i005', quantityGrams: 6, notes: 'Sesame oil' },
      { foodId: 'food_ifct_2017_j045', quantityGrams: 2, notes: 'Curry leaves' }
    ],
    instructions: [
      'Soak kala chana overnight and pressure cook with salt.',
      'Temper mustard, green chillies, curry leaves in sesame oil.',
      'Toss boiled chickpeas and finish with fresh grated coconut.'
    ]
  },
  // 23. High-Protein Greek Yogurt Bowl
  {
    id: 'recipe_protein_curd_bowl',
    name: 'High-Protein Greek Yogurt & Seed Bowl',
    nativeName: 'யோகட் பவுல்',
    description: 'Strained low-fat Greek yogurt topped with chia seeds, almonds, and banana slices.',
    mealType: 'snack',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 1,
    prepTimeMinutes: 5,
    oilLevel: 'none',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_usda_fdc_170903', quantityGrams: 200, notes: 'Low-fat Greek yogurt' },
      { foodId: 'food_usda_fdc_170554', quantityGrams: 12, notes: 'Chia seeds' },
      { foodId: 'food_ifct_2017_h005', quantityGrams: 15, notes: 'Almonds sliced' },
      { foodId: 'food_ifct_2017_g001', quantityGrams: 50, notes: 'Sliced banana' }
    ],
    instructions: [
      'Scoop Greek yogurt into a serving bowl.',
      'Top with chia seeds, sliced almonds, and fresh banana slices.',
      'Enjoy chilled as a high protein snack.'
    ]
  },
  // 24. Soya Chunks Curry + Rice
  {
    id: 'recipe_soya_curry_rice',
    name: 'High Protein Soya Curry + Parboiled Rice',
    nativeName: 'சோயா குழம்பு சாதம்',
    description: 'Plant-based high protein meal with soybean chunks simmered in spiced onion tomato curry.',
    mealType: 'lunch',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 25,
    oilLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_a002', quantityGrams: 120, notes: 'Parboiled rice' },
      { foodId: 'food_ifct_2017_b020', quantityGrams: 80, notes: 'Soybeans / Soya chunks' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 60, notes: 'Onion' },
      { foodId: 'food_ifct_2017_f005', quantityGrams: 50, notes: 'Tomato' },
      { foodId: 'food_ifct_2017_i001', quantityGrams: 10, notes: 'Groundnut oil' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 4, notes: 'Red chilli powder' }
    ],
    instructions: [
      'Soak soya chunks in warm water, squeeze excess moisture.',
      'Sauté onions, tomatoes, and spices in oil; add soya chunks and simmer 10 minutes.',
      'Serve with warm rice.'
    ]
  },
  // 25. Paneer Tikka Saute + Chapati
  {
    id: 'recipe_paneer_chapati',
    name: 'Paneer Capsicum Saute + Atta Chapati',
    nativeName: 'பன்னீர் சப்பாத்தி',
    description: 'Pan-sauteed cottage cheese and capsicum served with whole wheat chapatis.',
    mealType: 'dinner',
    cuisine: 'south-indian',
    dietaryType: 'veg',
    servings: 2,
    prepTimeMinutes: 20,
    oilLevel: 'low',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { foodId: 'food_ifct_2017_e015', quantityGrams: 150, notes: 'Paneer cubes' },
      { foodId: 'food_ifct_2017_a018', quantityGrams: 80, notes: 'Whole wheat flour' },
      { foodId: 'food_ifct_2017_f085', quantityGrams: 40, notes: 'Green bell pepper' },
      { foodId: 'food_ifct_2017_f001', quantityGrams: 40, notes: 'Onion' },
      { foodId: 'food_ifct_2017_i020', quantityGrams: 8, notes: 'Ghee' },
      { foodId: 'food_ifct_2017_j015', quantityGrams: 3, notes: 'Red chilli powder' }
    ],
    instructions: [
      'Sauté paneer cubes, capsicum, and onions in ghee with spices.',
      'Roll and cook chapatis on tawa.',
      'Serve warm paneer sauté with fresh chapatis.'
    ]
  }
];

// Calculate nutrition for each recipe using the calculation engine
const recipes = rawRecipes.map(recipe => {
  const calculated = recalculateRecipeWithOil(recipe, foodsMap);
  return {
    ...recipe,
    source: {
      author: 'GAUGE Culinary Team',
      verified: true
    },
    calculatedNutrition: calculated
  };
});

const outputPath = path.join(__dirname, '../data/recipes.gauge.json');
fs.writeFileSync(outputPath, JSON.stringify(recipes, null, 2), 'utf-8');

console.log(`✅ Successfully generated ${recipes.length} starter recipes in ${outputPath}`);
