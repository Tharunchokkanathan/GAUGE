import type { MealItem, UserProfileData, DailyNutritionTarget } from '../types';

export const MOCK_MEALS: MealItem[] = [
  {
    id: 'm1',
    name: 'High-Protein Chicken Dosa',
    type: 'breakfast',
    cuisine: 'tamil',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 480, protein: 36, carbs: 42, fat: 12 },
    nutritionScore: 94,
    prepTimeMinutes: 20,
    description: 'Crisp fermented rice-lentil crepe stuffed with spiced shredded chicken breast cooked in minimal cold-pressed sesame oil.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Heat a non-stick tawa with 1 tsp sesame oil.',
      'Sauté minced ginger, garlic, green chillies, curry leaves, and 150g shredded chicken breast with turmeric and Chettinad spices.',
      'Pour fermented dosa batter on tawa and spread thinly into a circle.',
      'Spread the spiced chicken filling evenly in the center, fold, and serve hot with mint chutney.'
    ],
    ingredients: [
      { name: 'Dosa Batter', amount: '120g', calories: 180, protein: 4 },
      { name: 'Chicken Breast (Minced)', amount: '150g', calories: 240, protein: 31 },
      { name: 'Gingelly / Sesame Oil', amount: '5ml', calories: 45, protein: 0 },
      { name: 'Chettinad Masala & Herbs', amount: '15g', calories: 15, protein: 1 }
    ],
    isFavorite: true
  },
  {
    id: 'm2',
    name: 'Egg & Mixed Pulse Adai',
    type: 'breakfast',
    cuisine: 'tamil',
    dietary: 'eggitarian',
    oilLevel: 'low',
    macros: { calories: 465, protein: 31, carbs: 48, fat: 14 },
    nutritionScore: 91,
    prepTimeMinutes: 25,
    description: 'Lentil-rich protein pancake made of chana dal, toor dal, and urad dal, topped with 2 whole country eggs and shallots.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Blend soaked mixed dals (chana, toor, moong, urad) with red chillies, fennel seeds, and asafoetida into a coarse batter.',
      'Spread thick pancake on hot skillet, make small indentations.',
      'Beat 2 eggs with diced onions and curry leaves, pour over the adai surface.',
      'Cook covered on low heat until eggs set and bottom turns golden brown.'
    ],
    ingredients: [
      { name: 'Mixed Dal Batter', amount: '150g', calories: 290, protein: 17 },
      { name: 'Country Whole Eggs', amount: '2 large', calories: 140, protein: 12 },
      { name: 'Coconut Oil spray', amount: '4ml', calories: 35, protein: 0 }
    ],
    isFavorite: true
  },
  {
    id: 'm3',
    name: 'Low-Oil Chicken Fry + Steamed Idli (3 pcs)',
    type: 'breakfast',
    cuisine: 'tamil',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 495, protein: 42, carbs: 54, fat: 9 },
    nutritionScore: 96,
    prepTimeMinutes: 25,
    description: 'Steamed fluffy rice-black gram cakes paired with air-fried dry spiced chicken breast seasoned with curry leaves and black pepper.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Steam 3 fluffy urad dal idlis in steamer for 10-12 mins.',
      'Marinate 180g chicken breast in curd, ginger-garlic paste, red chilli, and pepper powder.',
      'Air-fry at 190°C for 14 minutes with 1 tsp oil spray.',
      'Toss chicken with fresh curry leaves and lemon juice.'
    ],
    ingredients: [
      { name: 'Steamed Rice Idli', amount: '3 pcs (150g)', calories: 210, protein: 6 },
      { name: 'Chicken Breast', amount: '180g', calories: 240, protein: 36 },
      { name: 'Oil & Spices', amount: '5ml', calories: 45, protein: 0 }
    ],
    isFavorite: false
  },
  {
    id: 'm4',
    name: 'Sprouted Moong Pesarattu with Tofu Filling',
    type: 'breakfast',
    cuisine: 'andhra',
    dietary: 'vegetarian',
    oilLevel: 'low',
    macros: { calories: 410, protein: 28, carbs: 52, fat: 8 },
    nutritionScore: 95,
    prepTimeMinutes: 15,
    description: 'Andhra-style whole green gram crepe infused with fresh ginger and cumin, stuffed with crumbled organic tofu and green chillies.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Grind sprouted whole moong with green chilli, ginger, and cumin into a smooth green batter.',
      'Pan-sear seasoned crumbled tofu with onions.',
      'Spread green gram batter into crepe on medium-hot pan, fill with spiced tofu, fold, and serve with ginger chutney.'
    ],
    ingredients: [
      { name: 'Sprouted Moong Batter', amount: '160g', calories: 250, protein: 16 },
      { name: 'Organic Tofu (Crumbled)', amount: '100g', calories: 120, protein: 11 },
      { name: 'Gingelly Oil', amount: '4ml', calories: 40, protein: 0 }
    ],
    isFavorite: true
  },
  {
    id: 'm5',
    name: 'Kerala Fish Curry + Red Rice (Matta Rice)',
    type: 'lunch',
    cuisine: 'kerala',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 540, protein: 38, carbs: 64, fat: 12 },
    nutritionScore: 93,
    prepTimeMinutes: 30,
    description: 'Tangy Malabar seer fish cooked with Kudampuli (Garcinia cambogica) and light coconut milk, served over nutrient-rich Kerala red rice.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Boil 180g Kerala Matta red rice.',
      'Simmer seer fish steaks in clay pot with shallow curry base of onions, fenugreek, green chillies, turmeric, red chilli powder, and Kudampuli extract.',
      'Finish curry with 20ml thin coconut milk.',
      'Serve curry over warm Matta rice with a side of steamed long beans.'
    ],
    ingredients: [
      { name: 'Kerala Matta Rice (Cooked)', amount: '200g', calories: 260, protein: 5 },
      { name: 'Seer Fish / Vanjaram', amount: '160g', calories: 210, protein: 32 },
      { name: 'Coconut Milk & Spices', amount: '30ml', calories: 70, protein: 1 }
    ],
    isFavorite: true
  },
  {
    id: 'm6',
    name: 'Paneer Chettinad Tikka + Brown Rice Dosa',
    type: 'lunch',
    cuisine: 'tamil',
    dietary: 'vegetarian',
    oilLevel: 'medium',
    macros: { calories: 520, protein: 29, carbs: 45, fat: 22 },
    nutritionScore: 89,
    prepTimeMinutes: 25,
    description: 'Low-fat paneer cubes roasted in roasted Chettinad spice blend, accompanied by crispy unpolished brown rice crepe.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Marinate 140g low-fat paneer in Chettinad spice paste (dry roasted black pepper, coriander, cumin, fennel, shallots).',
      'Sear paneer cubes on cast iron skillet with 1 tsp sesame oil until edges crisp.',
      'Make 2 thin brown rice dosas and serve with tomato chutney.'
    ],
    ingredients: [
      { name: 'Low-Fat Paneer', amount: '140g', calories: 270, protein: 22 },
      { name: 'Brown Rice Batter', amount: '120g', calories: 190, protein: 5 },
      { name: 'Oil & Spices', amount: '7ml', calories: 60, protein: 2 }
    ],
    isFavorite: false
  },
  {
    id: 'm7',
    name: 'Air-Fried Medu Vada + High-Protein Lentil Sambar',
    type: 'snack',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'low',
    macros: { calories: 340, protein: 18, carbs: 46, fat: 8 },
    nutritionScore: 92,
    prepTimeMinutes: 20,
    description: 'Guilt-free air-fried black gram donuts crisped with pepper & curry leaves, drenched in thick drumstick toor dal sambar.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Fluff soaked urad dal batter with peppercorns, crushed ginger, chopped curry leaves, and asafoetida.',
      'Shape into vadas and air-fry at 185°C for 16 minutes with light brush of oil.',
      'Submerge in boiling hot homemade protein-boosted toor dal sambar.'
    ],
    ingredients: [
      { name: 'Air-Fried Vadas', amount: '2 pcs (100g)', calories: 200, protein: 10 },
      { name: 'Protein Sambar', amount: '200ml', calories: 140, protein: 8 }
    ],
    isFavorite: true
  },
  {
    id: 'm8',
    name: 'Mutton Chukka (Low Oil) + Ragi Dosa',
    type: 'dinner',
    cuisine: 'tamil',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 510, protein: 39, carbs: 41, fat: 16 },
    nutritionScore: 90,
    prepTimeMinutes: 35,
    description: 'Lean tender lamb/mutton slow cooked dry in black pepper and crushed garlic gravy, served alongside 2 calcium-packed finger millet dosas.',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Pressure cook 160g lean goat meat with turmeric, ginger-garlic paste, and salt.',
      'Dry roast cooked meat with shallots, crushed pepper, curry leaves, and 1 tsp gingelly oil until dark brown.',
      'Prepare 2 thin Ragi dosas using finger millet and urad dal batter.'
    ],
    ingredients: [
      { name: 'Lean Goat Meat', amount: '160g', calories: 260, protein: 33 },
      { name: 'Ragi Dosa Batter', amount: '110g', calories: 180, protein: 5 },
      { name: 'Sesame Oil & Gravy Spices', amount: '8ml', calories: 70, protein: 1 }
    ],
    isFavorite: false
  },
  {
    id: 'm9',
    name: 'Sundal Trio Snack (Chana, Rajma & Horsegram)',
    type: 'snack',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'low',
    macros: { calories: 280, protein: 16, carbs: 40, fat: 5 },
    nutritionScore: 97,
    prepTimeMinutes: 10,
    description: 'Traditional temple-style steamed legume salad tempered with mustard seeds, curry leaves, ginger, and fresh scraped coconut.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    recipeSteps: [
      'Pressure cook soaked chickpea, kidney beans, and horsegram.',
      'Temper 1 tsp coconut oil with mustard seeds, split urad dal, red chilli, and curry leaves.',
      'Toss legumes with temper and finish with 1 tbsp fresh scraped coconut.'
    ],
    ingredients: [
      { name: 'Mixed Steamed Legumes', amount: '160g', calories: 220, protein: 15 },
      { name: 'Coconut & Tempering', amount: '15g', calories: 60, protein: 1 }
    ],
    isFavorite: true
  }
];

export const MOCK_USER_PROFILE: UserProfileData = {
  name: 'Tharun Kumar',
  email: 'tharun@example.com',
  age: 28,
  gender: 'male',
  heightCm: 178,
  weightKg: 76,
  activityLevel: 'active',
  goal: 'muscle_gain',
  targetCalories: 2200,
  targetProtein: 140,
  dietaryPreference: 'non-veg',
  oilPreference: 'low'
};

export const MOCK_DAILY_NUTRITION: DailyNutritionTarget = {
  targetCalories: 2200,
  consumedCalories: 1455,
  targetProtein: 140,
  consumedProtein: 101,
  targetCarbs: 220,
  consumedCarbs: 144,
  targetFat: 60,
  consumedFat: 38
};

export const MOCK_LOGGED_MEALS = {
  breakfast: [MOCK_MEALS[0]], // High-Protein Chicken Dosa
  lunch: [MOCK_MEALS[4]],    // Kerala Fish Curry + Red Rice
  snack: [MOCK_MEALS[6]],    // Air-Fried Medu Vada
  dinner: []
};
