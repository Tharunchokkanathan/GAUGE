import type { MealItem, UserProfileData, DailyNutritionTarget } from '../types';

export const MOCK_MEALS: MealItem[] = [
  // --- BASIC STAPLE DIET ITEMS ---
  {
    id: 'b1',
    name: 'Boiled Chicken Breast (200g)',
    type: 'lunch',
    cuisine: 'south-indian',
    dietary: 'non-veg',
    oilLevel: 'none',
    macros: { calories: 330, protein: 62, carbs: 0, fat: 7, fiber: 0 },
    nutritionScore: 99,
    prepTimeMinutes: 15,
    description: 'Clean, lean skinless chicken breast boiled with salt, black pepper, turmeric, and fresh ginger.',
    image: '',
    recipeSteps: [
      'Clean 200g skinless chicken breast.',
      'Boil in 400ml water with 1/2 tsp turmeric, crushed ginger, salt, and black pepper for 12 minutes.',
      'Drain and slice into clean protein cuts.'
    ],
    ingredients: [
      { name: 'Skinless Chicken Breast', amount: '200g', calories: 330, protein: 62 }
    ],
    isFavorite: true
  },
  {
    id: 'b2',
    name: 'Boiled Hard Eggs (3 Whole Eggs)',
    type: 'breakfast',
    cuisine: 'south-indian',
    dietary: 'eggitarian',
    oilLevel: 'none',
    macros: { calories: 210, protein: 18, carbs: 1, fat: 15, fiber: 0 },
    nutritionScore: 96,
    prepTimeMinutes: 10,
    description: 'Fresh farm eggs hard-boiled for 9 minutes, seasoned with a pinch of crushed black pepper and sea salt.',
    image: '',
    recipeSteps: [
      'Submerge 3 whole eggs in boiling water.',
      'Boil for 9-10 minutes for hard yolk.',
      'Peel shells under cold water and sprinkle crushed black pepper.'
    ],
    ingredients: [
      { name: 'Farm Whole Eggs', amount: '3 large (150g)', calories: 210, protein: 18 }
    ],
    isFavorite: true
  },
  {
    id: 'b3',
    name: 'Egg White Scramble (5 Egg Whites)',
    type: 'breakfast',
    cuisine: 'south-indian',
    dietary: 'eggitarian',
    oilLevel: 'none',
    macros: { calories: 125, protein: 26, carbs: 1, fat: 0, fiber: 0 },
    nutritionScore: 98,
    prepTimeMinutes: 8,
    description: 'Pure high-protein egg white scramble seasoned with cumin powder, green chillies, and fresh coriander.',
    image: '',
    recipeSteps: [
      'Separate egg whites from 5 fresh eggs.',
      'Whisk with salt, green chillies, and coriander.',
      'Scramble on a non-stick skillet without oil for 3 minutes.'
    ],
    ingredients: [
      { name: 'Egg Whites', amount: '5 egg whites (160g)', calories: 125, protein: 26 }
    ],
    isFavorite: true
  },
  {
    id: 'b4',
    name: 'Boiled Lean Mutton / Lamb (150g)',
    type: 'dinner',
    cuisine: 'tamil',
    dietary: 'non-veg',
    oilLevel: 'none',
    macros: { calories: 340, protein: 38, carbs: 0, fat: 20, fiber: 0 },
    nutritionScore: 92,
    prepTimeMinutes: 25,
    description: 'Tender lean mutton pieces pressure-boiled with garlic, shallots, cumin, and turmeric broth.',
    image: '',
    recipeSteps: [
      'Pressure cook 150g lean mutton cutlets with shallots, crushed garlic, and turmeric for 5 whistles.',
      'Serve hot in its rich protein broth.'
    ],
    ingredients: [
      { name: 'Lean Mutton Cuts', amount: '150g', calories: 340, protein: 38 }
    ],
    isFavorite: false
  },
  {
    id: 'b5',
    name: 'Steamed Vanjaram / Fish Fillet (200g)',
    type: 'dinner',
    cuisine: 'kerala',
    dietary: 'non-veg',
    oilLevel: 'none',
    macros: { calories: 240, protein: 44, carbs: 0, fat: 5, fiber: 0 },
    nutritionScore: 97,
    prepTimeMinutes: 12,
    description: 'King mackerel / seer fish fillet steamed with lemon juice, mint, green chilli, and ginger.',
    image: '',
    recipeSteps: [
      'Rub 200g seer fish fillet with lemon juice, salt, and turmeric.',
      'Steam in banana leaf or steamer basket for 10-12 minutes.'
    ],
    ingredients: [
      { name: 'Seer Fish / Vanjaram Fillet', amount: '200g', calories: 240, protein: 44 }
    ],
    isFavorite: true
  },
  {
    id: 'b6',
    name: 'Boiled Low-Fat Paneer (150g)',
    type: 'snack',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'none',
    macros: { calories: 390, protein: 27, carbs: 4, fat: 30, fiber: 0 },
    nutritionScore: 90,
    prepTimeMinutes: 5,
    description: 'Soft cottage cheese cubes blanched in warm salted water with chaat masala.',
    image: '',
    recipeSteps: [
      'Cut fresh low-fat paneer into 150g cubes.',
      'Soak in boiling salted water for 3 minutes for maximum softness.',
      'Drain and sprinkle roasted cumin powder.'
    ],
    ingredients: [
      { name: 'Low-Fat Cottage Cheese (Paneer)', amount: '150g', calories: 390, protein: 27 }
    ],
    isFavorite: true
  },
  {
    id: 'b7',
    name: 'Steamed Brown Rice (200g Cooked)',
    type: 'lunch',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'none',
    macros: { calories: 220, protein: 5, carbs: 46, fat: 2, fiber: 4 },
    nutritionScore: 94,
    prepTimeMinutes: 20,
    description: 'Unpolished whole grain brown rice steamed fluffy with clean complex carbohydrates.',
    image: '',
    recipeSteps: [
      'Soak brown rice for 30 minutes.',
      'Pressure cook with 1:2.5 water ratio for 4 whistles.'
    ],
    ingredients: [
      { name: 'Unpolished Brown Rice', amount: '200g cooked', calories: 220, protein: 5 }
    ],
    isFavorite: false
  },
  {
    id: 'b8',
    name: 'Boiled Yellow Toor Dal / Sambar (200ml)',
    type: 'lunch',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'low',
    macros: { calories: 180, protein: 12, carbs: 28, fat: 3, fiber: 6 },
    nutritionScore: 95,
    prepTimeMinutes: 15,
    description: 'Slow-simmered yellow pigeon pea lentils seasoned with asafoetida, cumin, and coriander.',
    image: '',
    recipeSteps: [
      'Boil toor dal with tomatoes, garlic, and turmeric.',
      'Mash smoothly and temper with mustard seeds and curry leaves.'
    ],
    ingredients: [
      { name: 'Yellow Toor Dal', amount: '200ml (70g dry)', calories: 180, protein: 12 }
    ],
    isFavorite: true
  },
  {
    id: 'b9',
    name: 'Steamed Broccoli & Mixed Green Veggies (200g)',
    type: 'dinner',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'none',
    macros: { calories: 90, protein: 6, carbs: 16, fat: 1, fiber: 7 },
    nutritionScore: 99,
    prepTimeMinutes: 8,
    description: 'Steamed florets of broccoli, French beans, and carrots with sea salt and black pepper.',
    image: '',
    recipeSteps: [
      'Chop broccoli, beans, and carrots.',
      'Steam for 6 minutes until tender-crisp.'
    ],
    ingredients: [
      { name: 'Mixed Vegetables & Broccoli', amount: '200g', calories: 90, protein: 6 }
    ],
    isFavorite: true
  },
  {
    id: 'b10',
    name: 'Boiled Black Chana / Kala Chana (150g)',
    type: 'snack',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'none',
    macros: { calories: 240, protein: 14, carbs: 40, fat: 3, fiber: 11 },
    nutritionScore: 98,
    prepTimeMinutes: 15,
    description: 'High-fiber black chickpeas pressure-boiled with ginger, lemon juice, and rock salt.',
    image: '',
    recipeSteps: [
      'Pressure cook overnight soaked black chana for 5 whistles.',
      'Drain water and toss with fresh lemon juice and chopped green chillies.'
    ],
    ingredients: [
      { name: 'Black Chickpeas (Kala Chana)', amount: '150g cooked', calories: 240, protein: 14 }
    ],
    isFavorite: true
  },
  {
    id: 'b11',
    name: 'Fresh Probiotic Curd / Plain Yogurt (200g)',
    type: 'snack',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'none',
    macros: { calories: 120, protein: 10, carbs: 8, fat: 4, fiber: 0 },
    nutritionScore: 95,
    prepTimeMinutes: 1,
    description: 'Chilled homemade probiotic milk curd supporting gut health and digestive absorption.',
    image: '',
    recipeSteps: [
      'Serve 200g chilled fresh curd in a glass bowl.'
    ],
    ingredients: [
      { name: 'Fresh Plain Curd', amount: '200g', calories: 120, protein: 10 }
    ],
    isFavorite: false
  },
  {
    id: 'b12',
    name: 'Roasted Salted Peanuts (50g)',
    type: 'snack',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'none',
    macros: { calories: 280, protein: 13, carbs: 8, fat: 24, fiber: 4 },
    nutritionScore: 91,
    prepTimeMinutes: 2,
    description: 'Crunchy dry-roasted groundnuts providing plant protein and heart-healthy unsaturated fats.',
    image: '',
    recipeSteps: [
      'Dry roast raw peanuts on medium flame for 5 minutes until skins loosen.'
    ],
    ingredients: [
      { name: 'Roasted Peanuts', amount: '50g', calories: 280, protein: 13 }
    ],
    isFavorite: false
  },

  // --- REGULAR GAUGE RECIPES ---
  {
    id: 'm1',
    name: 'High-Protein Chicken Dosa',
    type: 'breakfast',
    cuisine: 'tamil',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 480, protein: 36, carbs: 42, fat: 12, fiber: 5 },
    nutritionScore: 94,
    prepTimeMinutes: 20,
    description: 'Crisp fermented rice-lentil crepe stuffed with spiced shredded chicken breast cooked in minimal cold-pressed sesame oil.',
    image: '',
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
    macros: { calories: 465, protein: 31, carbs: 48, fat: 14, fiber: 8 },
    nutritionScore: 91,
    prepTimeMinutes: 25,
    description: 'Lentil-rich protein pancake made of chana dal, toor dal, and urad dal, topped with 2 whole country eggs and shallots.',
    image: '',
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
    macros: { calories: 495, protein: 42, carbs: 54, fat: 9, fiber: 4 },
    nutritionScore: 96,
    prepTimeMinutes: 25,
    description: 'Steamed fluffy rice-black gram cakes paired with air-fried dry spiced chicken breast seasoned with curry leaves and black pepper.',
    image: '',
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
    macros: { calories: 410, protein: 28, carbs: 52, fat: 8, fiber: 10 },
    nutritionScore: 95,
    prepTimeMinutes: 15,
    description: 'Andhra-style whole green gram crepe infused with fresh ginger and cumin, stuffed with crumbled organic tofu and green chillies.',
    image: '',
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
    macros: { calories: 540, protein: 38, carbs: 64, fat: 12, fiber: 6 },
    nutritionScore: 93,
    prepTimeMinutes: 30,
    description: 'Tangy Malabar seer fish cooked with Kudampuli (Garcinia cambogica) and light coconut milk, served over nutrient-rich Kerala red rice.',
    image: '',
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
    macros: { calories: 520, protein: 29, carbs: 45, fat: 22, fiber: 5 },
    nutritionScore: 89,
    prepTimeMinutes: 25,
    description: 'Low-fat paneer cubes roasted in roasted Chettinad spice blend, accompanied by crispy unpolished brown rice crepe.',
    image: '',
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
    macros: { calories: 340, protein: 18, carbs: 46, fat: 8, fiber: 9 },
    nutritionScore: 92,
    prepTimeMinutes: 20,
    description: 'Guilt-free air-fried black gram donuts crisped with pepper & curry leaves, drenched in thick drumstick toor dal sambar.',
    image: '',
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
    macros: { calories: 510, protein: 39, carbs: 41, fat: 16, fiber: 6 },
    nutritionScore: 90,
    prepTimeMinutes: 35,
    description: 'Lean tender lamb/mutton slow cooked dry in black pepper and crushed garlic gravy, served alongside 2 calcium-packed finger millet dosas.',
    image: '',
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
    macros: { calories: 280, protein: 16, carbs: 40, fat: 5, fiber: 12 },
    nutritionScore: 97,
    prepTimeMinutes: 10,
    description: 'Traditional temple-style steamed legume salad tempered with mustard seeds, curry leaves, ginger, and fresh scraped coconut.',
    image: '',
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
  },
  {
    id: 'm10',
    name: 'Protein Oats Upma with Peanuts & Veggies',
    type: 'breakfast',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'low',
    macros: { calories: 380, protein: 18, carbs: 54, fat: 10, fiber: 9 },
    nutritionScore: 93,
    prepTimeMinutes: 15,
    description: 'Rolled oats cooked with mustard seeds, roasted peanuts, green peas, carrots, and curry leaves.',
    image: '',
    recipeSteps: [
      'Dry roast 80g rolled oats for 3 minutes.',
      'Temper 1 tsp oil with mustard seeds, green chillies, curry leaves, and 15g peanuts.',
      'Sauté diced veggies, add water, bring to boil, and stir in oats until fluffy.'
    ],
    ingredients: [
      { name: 'Rolled Oats', amount: '80g', calories: 280, protein: 11 },
      { name: 'Roasted Peanuts', amount: '15g', calories: 85, protein: 4 },
      { name: 'Veggies & Tempering', amount: '50g', calories: 15, protein: 3 }
    ],
    isFavorite: false
  },
  {
    id: 'm11',
    name: 'Double Egg Chettinad Omelette + Multi-Grain Toast',
    type: 'breakfast',
    cuisine: 'tamil',
    dietary: 'eggitarian',
    oilLevel: 'low',
    macros: { calories: 390, protein: 26, carbs: 32, fat: 16, fiber: 5 },
    nutritionScore: 92,
    prepTimeMinutes: 12,
    description: 'Fluffy 3-egg white + 1 whole egg omelette spiced with shallots, crushed pepper, and coriander, served with multi-grain toast.',
    image: '',
    recipeSteps: [
      'Whisk eggs with shallots, green chillies, black pepper, and curry leaves.',
      'Pour on hot skillet drizzled with 3ml oil.',
      'Cook until set and serve with 2 toasted multi-grain bread slices.'
    ],
    ingredients: [
      { name: 'Eggs (3 whites + 1 whole)', amount: '4 eggs', calories: 180, protein: 22 },
      { name: 'Multi-Grain Toast', amount: '2 slices', calories: 170, protein: 4 }
    ],
    isFavorite: true
  },
  {
    id: 'm12',
    name: 'High-Protein Chicken Biryani (Low Oil)',
    type: 'lunch',
    cuisine: 'tamil',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 580, protein: 46, carbs: 68, fat: 12, fiber: 5 },
    nutritionScore: 95,
    prepTimeMinutes: 35,
    description: 'Aromatic Seeraga Samba rice Dum cooked with succulent marinated chicken breast, mint, coriander, and curd.',
    image: '',
    recipeSteps: [
      'Marinate 200g chicken breast in low-fat curd, ginger-garlic paste, chili powder, and biryani spices.',
      'Layer half-boiled Seeraga Samba rice over chicken in a heavy bottom pot.',
      'Cook covered on low flame (dum) for 20 minutes and serve with onion raita.'
    ],
    ingredients: [
      { name: 'Chicken Breast', amount: '200g', calories: 260, protein: 42 },
      { name: 'Seeraga Samba Rice', amount: '120g', calories: 270, protein: 4 }
    ],
    isFavorite: true
  },
  {
    id: 'm13',
    name: 'Soya Chunk Chukka Gravy + Curd Rice',
    type: 'lunch',
    cuisine: 'tamil',
    dietary: 'vegetarian',
    oilLevel: 'low',
    macros: { calories: 470, protein: 34, carbs: 58, fat: 10, fiber: 8 },
    nutritionScore: 94,
    prepTimeMinutes: 25,
    description: 'Spicy pepper-tempered soya chunks dry gravy accompanied by cool probiotic brown rice curd rice.',
    image: '',
    recipeSteps: [
      'Boil 70g soya chunks, squeeze water, and toss in Chettinad pepper masala gravy.',
      'Mix brown rice with fresh low-fat curd and temper with mustard seeds and curry leaves.',
      'Serve spicy soya chukka side-by-side with chilled curd rice.'
    ],
    ingredients: [
      { name: 'Soya Chunks', amount: '70g dry', calories: 235, protein: 31 },
      { name: 'Brown Rice Curd Rice', amount: '180g', calories: 215, protein: 3 }
    ],
    isFavorite: false
  },
  {
    id: 'm14',
    name: 'Andhra Chilli Chicken + Brown Rice',
    type: 'lunch',
    cuisine: 'andhra',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 510, protein: 44, carbs: 52, fat: 11, fiber: 5 },
    nutritionScore: 93,
    prepTimeMinutes: 30,
    description: 'Fiery Andhra green chilli chicken stir-fry served with fiber-dense steamed brown rice.',
    image: '',
    recipeSteps: [
      'Sauté 200g boneless chicken breast with green chilli paste, ginger, garlic, and curry leaves.',
      'Simmer until sauce thickens and chicken tenderizes.',
      'Serve alongside steamed brown rice.'
    ],
    ingredients: [
      { name: 'Chicken Breast', amount: '200g', calories: 260, protein: 41 },
      { name: 'Brown Rice (Cooked)', amount: '170g', calories: 220, protein: 3 }
    ],
    isFavorite: true
  },
  {
    id: 'm15',
    name: 'Roasted Chana & Peanut Bhel',
    type: 'snack',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'none',
    macros: { calories: 260, protein: 14, carbs: 36, fat: 6, fiber: 9 },
    nutritionScore: 98,
    prepTimeMinutes: 5,
    description: 'Crunchy high-fiber snack made of roasted black chana, puffed rice, tomatoes, cucumbers, and lemon juice.',
    image: '',
    recipeSteps: [
      'Combine roasted chana, puffed rice, finely chopped onion, tomato, and green chilli.',
      'Drizzle fresh lemon juice and toss with chaat masala and mint leaves.'
    ],
    ingredients: [
      { name: 'Roasted Black Chana', amount: '60g', calories: 190, protein: 11 },
      { name: 'Puffed Rice & Veggies', amount: '40g', calories: 70, protein: 3 }
    ],
    isFavorite: true
  },
  {
    id: 'm16',
    name: 'Boiled Egg Pepper Fry (3 Eggs)',
    type: 'snack',
    cuisine: 'tamil',
    dietary: 'eggitarian',
    oilLevel: 'low',
    macros: { calories: 230, protein: 21, carbs: 4, fat: 14, fiber: 2 },
    nutritionScore: 95,
    prepTimeMinutes: 10,
    description: 'Hard-boiled eggs tossed in a spicy black pepper, shallot, and curry leaf tempering.',
    image: '',
    recipeSteps: [
      'Boil 3 eggs, peel, and cut into halves.',
      'Temper 1 tsp sesame oil with mustard seeds, curry leaves, diced shallots, and coarse black pepper powder.',
      'Toss egg halves gently for 2 minutes.'
    ],
    ingredients: [
      { name: 'Whole Boiled Eggs', amount: '3 large', calories: 210, protein: 18 },
      { name: 'Pepper & Oil Temper', amount: '10g', calories: 20, protein: 3 }
    ],
    isFavorite: false
  },
  {
    id: 'm17',
    name: 'Grilled Vanjaram Steak + Cauliflower Mash',
    type: 'dinner',
    cuisine: 'tamil',
    dietary: 'non-veg',
    oilLevel: 'low',
    macros: { calories: 430, protein: 42, carbs: 14, fat: 22, fiber: 5 },
    nutritionScore: 96,
    prepTimeMinutes: 20,
    description: 'King mackerel (Vanjaram) pan-grilled with south-indian spices served over creamy garlic cauliflower puree.',
    image: '',
    recipeSteps: [
      'Marinate 180g Vanjaram fish steak in chilli, turmeric, lemon, and ginger paste.',
      'Pan grill with 4ml oil for 4 minutes on each side.',
      'Steam cauliflower and blend with garlic and pepper into a silky mash.'
    ],
    ingredients: [
      { name: 'Vanjaram (King Mackerel)', amount: '180g', calories: 290, protein: 38 },
      { name: 'Cauliflower Mash', amount: '150g', calories: 90, protein: 4 }
    ],
    isFavorite: true
  },
  {
    id: 'm18',
    name: 'Tofu Tikka Masala + Whole Wheat Phulka (2 pcs)',
    type: 'dinner',
    cuisine: 'south-indian',
    dietary: 'vegetarian',
    oilLevel: 'low',
    macros: { calories: 420, protein: 27, carbs: 48, fat: 12, fiber: 7 },
    nutritionScore: 91,
    prepTimeMinutes: 25,
    description: 'Tandoori marinated firm tofu cubes cooked in tomato-onion gravy, paired with oil-free wheat phulkas.',
    image: '',
    recipeSteps: [
      'Sear marinated tofu cubes until golden.',
      'Simmer tomato-onion gravy with kasuri methi and low-fat cream.',
      'Serve warm with 2 freshly puffed phulkas.'
    ],
    ingredients: [
      { name: 'Firm Tofu', amount: '150g', calories: 180, protein: 18 },
      { name: 'Whole Wheat Phulka', amount: '2 pcs', calories: 180, protein: 6 }
    ],
    isFavorite: false
  }
];

export const MOCK_USER_PROFILE: UserProfileData = {
  name: 'Tharun Kumar',
  email: 'tharun@example.com',
  age: 28,
  gender: 'male',
  heightCm: 178,
  weightKg: 76,
  activityLevel: 'moderately_active',
  goal: 'muscle_gain',
  targetCalories: 2200,
  targetProtein: 140,
  dietaryPreference: 'non-veg',
  oilPreference: 'low',
  isOnboarded: true
};

export const MOCK_DAILY_NUTRITION: DailyNutritionTarget = {
  targetCalories: 2200,
  consumedCalories: 1455,
  targetProtein: 140,
  consumedProtein: 101,
  targetCarbs: 220,
  consumedCarbs: 144,
  targetFat: 60,
  consumedFat: 38,
  targetFiber: 35,
  consumedFiber: 23
};

export const MOCK_LOGGED_MEALS = {
  breakfast: [MOCK_MEALS[0]], // Boiled Chicken Breast
  lunch: [MOCK_MEALS[6]],    // Steamed Vanjaram Fish
  snack: [MOCK_MEALS[9]],    // Boiled Black Chana
  dinner: [MOCK_MEALS[3]]    // Boiled Mutton
};
