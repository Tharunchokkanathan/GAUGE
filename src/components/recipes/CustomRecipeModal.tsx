import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  Droplets, 
  Sparkles, 
  Check, 
  ChefHat,
  Search
} from 'lucide-react';
import type { MealItem, MealType, OilLevel } from '../../types';
import { OPEN_FOOD_DATABASE } from '../../data/foodDatabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { GlassCard } from '../ui/GlassCard';

interface CustomRecipeIngredientInput {
  foodId: string;
  name: string;
  grams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

interface CustomRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: MealItem) => void;
  editingRecipe?: MealItem | null;
}

export const CustomRecipeModal: React.FC<CustomRecipeModalProps> = ({
  isOpen,
  onClose,
  onSaveRecipe,
  editingRecipe
}) => {
  const [recipeName, setRecipeName] = useState<string>('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [servings, setServings] = useState<number>(1);
  const [oilGrams, setOilGrams] = useState<number>(5);
  const [description, setDescription] = useState<string>('');
  const [recipeStepsText, setRecipeStepsText] = useState<string>('');
  
  // Food Database Search for Ingredient Selection
  const [foodSearchQuery, setFoodSearchQuery] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<CustomRecipeIngredientInput[]>([
    {
      foodId: 'chicken-breast-raw',
      name: 'Chicken Breast (Boneless)',
      grams: 200,
      caloriesPer100g: 165,
      proteinPer100g: 31,
      carbsPer100g: 0,
      fatPer100g: 3.6,
      fiberPer100g: 0
    },
    {
      foodId: 'onion-fresh',
      name: 'Onion (Raw)',
      grams: 30,
      caloriesPer100g: 40,
      proteinPer100g: 1.1,
      carbsPer100g: 9.3,
      fatPer100g: 0.1,
      fiberPer100g: 1.7
    }
  ]);

  // Load editing recipe if provided
  useEffect(() => {
    if (editingRecipe) {
      setRecipeName(editingRecipe.name);
      setMealType(editingRecipe.type);
      setServings(editingRecipe.servings || 1);
      const oilG = editingRecipe.oilLevel === 'none' ? 0 : editingRecipe.oilLevel === 'low' ? 5 : editingRecipe.oilLevel === 'medium' ? 10 : 15;
      setOilGrams(oilG);
      setDescription(editingRecipe.description || '');
      setRecipeStepsText(editingRecipe.recipeSteps ? editingRecipe.recipeSteps.join('\n') : '');
      
      if (editingRecipe.ingredients && editingRecipe.ingredients.length > 0) {
        setSelectedIngredients(editingRecipe.ingredients.map((ing, idx) => ({
          foodId: `custom-ing-${idx}`,
          name: ing.name,
          grams: parseInt(ing.amount, 10) || 100,
          caloriesPer100g: Math.round(((ing.calories || 100) / (parseInt(ing.amount, 10) || 100)) * 100),
          proteinPer100g: Math.round(((ing.protein || 10) / (parseInt(ing.amount, 10) || 100)) * 100),
          carbsPer100g: 10,
          fatPer100g: 2,
          fiberPer100g: 1
        })));
      }
    } else {
      setRecipeName('');
      setMealType('lunch');
      setServings(1);
      setOilGrams(5);
      setDescription('');
      setRecipeStepsText('');
    }
  }, [editingRecipe, isOpen]);

  // Search Results from Open Food Database
  const filteredFoods = OPEN_FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(foodSearchQuery.toLowerCase())
  ).slice(0, 5);

  const handleAddIngredient = (food: typeof OPEN_FOOD_DATABASE[0]) => {
    setSelectedIngredients((prev) => [
      ...prev,
      {
        foodId: food.id,
        name: food.name,
        grams: food.defaultServingGrams || 100,
        caloriesPer100g: food.nutritionPer100g.energyKcal,
        proteinPer100g: food.nutritionPer100g.proteinG,
        carbsPer100g: food.nutritionPer100g.carbohydratesG,
        fatPer100g: food.nutritionPer100g.fatG,
        fiberPer100g: food.nutritionPer100g.fiberG || 0
      }
    ]);
    setFoodSearchQuery('');
  };

  const handleRemoveIngredient = (index: number) => {
    setSelectedIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateGram = (index: number, newGrams: number) => {
    setSelectedIngredients((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, grams: Math.max(1, newGrams) } : item))
    );
  };

  // AUTOMATIC NUTRITION CALCULATIONS (per serving)
  const baseIngredientsCalories = selectedIngredients.reduce(
    (sum, ing) => sum + (ing.grams / 100) * ing.caloriesPer100g, 0
  );
  const baseIngredientsProtein = selectedIngredients.reduce(
    (sum, ing) => sum + (ing.grams / 100) * ing.proteinPer100g, 0
  );
  const baseIngredientsCarbs = selectedIngredients.reduce(
    (sum, ing) => sum + (ing.grams / 100) * ing.carbsPer100g, 0
  );
  const baseIngredientsFat = selectedIngredients.reduce(
    (sum, ing) => sum + (ing.grams / 100) * ing.fatPer100g, 0
  );
  const baseIngredientsFiber = selectedIngredients.reduce(
    (sum, ing) => sum + (ing.grams / 100) * ing.fiberPer100g, 0
  );

  // Cooking Oil addition: 9 kcal/g, 1g fat/g
  const oilCalories = oilGrams * 9;
  const oilFat = oilGrams;

  const batchTotalCalories = baseIngredientsCalories + oilCalories;
  const batchTotalProtein = baseIngredientsProtein;
  const batchTotalCarbs = baseIngredientsCarbs;
  const batchTotalFat = baseIngredientsFat + oilFat;
  const batchTotalFiber = baseIngredientsFiber;

  // Per serving calculation
  const servingsCount = Math.max(1, servings);
  const calculatedCalories = Math.round(batchTotalCalories / servingsCount);
  const calculatedProtein = Math.round(batchTotalProtein / servingsCount);
  const calculatedCarbs = Math.round(batchTotalCarbs / servingsCount);
  const calculatedFat = Math.round(batchTotalFat / servingsCount);
  const calculatedFiber = Math.round(batchTotalFiber / servingsCount);

  const handleSave = () => {
    if (!recipeName.trim()) return;

    const oilLevelEnum: OilLevel = oilGrams === 0 ? 'none' : oilGrams <= 5 ? 'low' : oilGrams <= 10 ? 'medium' : 'high';

    const newRecipe: MealItem = {
      id: editingRecipe?.id || `custom-${Date.now()}`,
      recipeId: editingRecipe?.recipeId || `custom-${Date.now()}`,
      name: recipeName.trim(),
      type: mealType,
      cuisine: 'south-indian',
      dietary: calculatedProtein >= 25 ? 'non-veg' : 'vegetarian',
      oilLevel: oilLevelEnum,
      servings: servingsCount,
      macros: {
        calories: calculatedCalories,
        protein: calculatedProtein,
        carbs: calculatedCarbs,
        fat: calculatedFat,
        fiber: calculatedFiber
      },
      nutritionScore: Math.min(98, Math.max(70, Math.round(80 + (calculatedProtein / 10) - (calculatedFat / 5)))),
      prepTimeMinutes: 20,
      description: description.trim() || `Custom macro recipe with ${calculatedProtein}g protein & ${calculatedCalories} kcal.`,
      image: '',
      recipeSteps: recipeStepsText.split('\n').filter((s) => s.trim().length > 0),
      ingredients: selectedIngredients.map((ing) => ({
        name: ing.name,
        amount: `${ing.grams}g`,
        calories: Math.round((ing.grams / 100) * ing.caloriesPer100g),
        protein: Math.round((ing.grams / 100) * ing.proteinPer100g)
      })),
      isCustom: true
    };

    onSaveRecipe(newRecipe);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-[#090d1a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {editingRecipe ? 'Edit Custom Recipe' : 'Create Custom Recipe'}
                </h2>
                <p className="text-xs text-slate-400">
                  Automatic nutrition math calculated from IFCT & USDA raw datasets.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Name & Meal Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Recipe Name *"
                placeholder="e.g. Low Oil Chicken Fry"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
              />

              <Select
                label="Meal Course *"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'snack', label: 'Snack' },
                  { value: 'dinner', label: 'Dinner' }
                ]}
              />
            </div>

            {/* Servings & Oil Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Servings Count ({servings})
                </label>
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-2">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value, 10))}
                    className="flex-1 accent-purple-500 cursor-pointer"
                  />
                  <span className="font-mono text-sm text-purple-300 font-bold px-2 py-0.5 bg-purple-500/20 rounded">
                    {servings} serving{servings > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" /> Cooking Oil / Ghee ({oilGrams}g)
                </label>
                <div className="flex items-center gap-2">
                  {[0, 5, 10, 15].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setOilGrams(g)}
                      className={`flex-1 py-2 text-xs font-mono rounded-xl border transition-all ${
                        oilGrams === g
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g === 0 ? 'No Oil' : `${g}g`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredient Search & Add */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Add Ingredients (Search Food Database)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Type to search (e.g. Chicken, Rice, Paneer, Egg, Onion...)"
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />

                {foodSearchQuery.trim().length > 0 && (
                  <div className="absolute top-12 left-0 right-0 z-30 bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-2xl space-y-1">
                    {filteredFoods.length === 0 ? (
                      <div className="p-3 text-xs text-slate-500 text-center">No matching food item found.</div>
                    ) : (
                      filteredFoods.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddIngredient(item)}
                          className="w-full text-left p-2 rounded-lg hover:bg-purple-500/10 flex items-center justify-between text-xs text-slate-200 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-white block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{item.category} • {item.foodState}</span>
                          </div>
                          <span className="text-purple-400 font-mono text-[11px] font-bold">+ Add</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Ingredients List */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block flex items-center justify-between">
                <span>Selected Ingredients ({selectedIngredients.length})</span>
                <span className="text-[11px] text-purple-400 font-mono">Real-time macro tally</span>
              </label>

              <div className="space-y-2">
                {selectedIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white block truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {Math.round((item.grams / 100) * item.caloriesPer100g)} kcal • {Math.round((item.grams / 100) * item.proteinPer100g)}g protein
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={item.grams}
                        onChange={(e) => handleUpdateGram(idx, parseInt(e.target.value, 10) || 1)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center text-xs font-mono text-purple-300 font-bold focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-[11px] text-slate-400 font-mono">g</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipe Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Preparation Instructions (Optional, 1 step per line)
              </label>
              <textarea
                rows={3}
                placeholder="Step 1: Marinate chicken...&#10;Step 2: Heat 5g oil...&#10;Step 3: Saute until cooked through..."
                value={recipeStepsText}
                onChange={(e) => setRecipeStepsText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* AUTOMATIC NUTRITION PREVIEW CARD */}
            <GlassCard variant="gradient" className="p-4 border-purple-500/30 bg-purple-500/5 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-purple-500/20 pb-2">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Automatic Calculated Nutrition (Per Serving)
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                  Deterministic Math
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Calories</span>
                  <span className="text-xs font-bold text-amber-400">{calculatedCalories} kcal</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Protein</span>
                  <span className="text-xs font-bold text-emerald-400">{calculatedProtein}g</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Carbs</span>
                  <span className="text-xs font-semibold text-cyan-300">{calculatedCarbs}g</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Fat</span>
                  <span className="text-xs font-semibold text-slate-300">{calculatedFat}g</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Fiber</span>
                  <span className="text-xs font-semibold text-teal-300">{calculatedFiber}g</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={!recipeName.trim()}
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-500/20"
              icon={<Check className="w-4 h-4" />}
            >
              {editingRecipe ? 'Save Changes' : 'Create & Save Recipe'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
