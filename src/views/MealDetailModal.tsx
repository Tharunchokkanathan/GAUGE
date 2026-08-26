import React, { useState, useEffect } from 'react';
import { Flame, Dumbbell, Clock, Sparkles, Droplets, Plus, Check, Utensils, Wheat, Sliders, Calculator, Edit3 } from 'lucide-react';
import type { MealItem, OilLevel, MealType } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { calculateIngredientNutrition, calculateServingNutrition } from '../utils/nutritionEngine';

interface MealDetailModalProps {
  meal: MealItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMeal?: (meal: MealItem, portionMultiplier: number, oil: OilLevel, targetMealType: MealType) => void;
  onUpdateMeal?: (mealId: string, updatedMeal: MealItem) => void;
  targetMealType?: MealType;
  isEditing?: boolean;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  isOpen,
  onClose,
  onAddMeal,
  onUpdateMeal,
  targetMealType,
  isEditing = false
}) => {
  // State for Dynamic Servings, Oil Grams, Meal Type, and Ingredient Gram Overrides
  const [servings, setServings] = useState<number>(1);
  const [oilGrams, setOilGrams] = useState<number>(5);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [ingredientGrams, setIngredientGrams] = useState<Record<number, number>>({});
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or reset state when meal opens
  useEffect(() => {
    if (meal) {
      setServings(meal.servings || 1);
      const initialOil = meal.oilLevel === 'none' ? 0 : meal.oilLevel === 'low' ? 5 : meal.oilLevel === 'medium' ? 10 : 15;
      setOilGrams(initialOil);

      const defaultCourse = targetMealType || (meal.type === 'all' ? 'breakfast' : meal.type) || 'breakfast';
      setSelectedMealType(defaultCourse as MealType);

      const initialIngMap: Record<number, number> = {};
      if (meal.ingredients) {
        meal.ingredients.forEach((ing, idx) => {
          const match = ing.amount.match(/(\d+)\s*g/i);
          const parsedGrams = match ? parseInt(match[1], 10) : 100;
          initialIngMap[idx] = parsedGrams;
        });
      }
      setIngredientGrams(initialIngMap);
      setIsSubmitting(false);
      setIsAdded(false);
    }
  }, [meal, targetMealType]);

  if (!meal) return null;

  // 1. Calculate Base Ingredient Contributions using nutritionEngine
  let rawBaseCalories = 0;
  let rawBaseProtein = 0;
  let rawBaseCarbs = 0;
  let rawBaseFat = 0;
  let rawBaseFiber = 0;

  const resolvedIngredients = (meal.ingredients || []).map((ing, idx) => {
    const match = ing.amount.match(/(\d+)\s*g/i);
    const defaultGrams = match ? parseInt(match[1], 10) : 100;
    const currentGrams = ingredientGrams[idx] ?? defaultGrams;

    // Derived nutrition per 100g for this ingredient
    const factor = defaultGrams / 100;
    const per100g = {
      energyKcal: ing.calories / (factor || 1),
      proteinG: ing.protein / (factor || 1),
      carbohydratesG: ((meal.macros.carbs || 30) / Math.max(1, meal.ingredients.length)) / (factor || 1),
      fatG: ((meal.macros.fat || 10) / Math.max(1, meal.ingredients.length)) / (factor || 1),
      fiberG: 3 / (factor || 1)
    };

    const mockFoodItem: any = {
      id: `ing-${idx}`,
      name: ing.name,
      nutritionPer100g: per100g
    };

    const snapshot = calculateIngredientNutrition(mockFoodItem, currentGrams);

    rawBaseCalories += snapshot.energyKcal;
    rawBaseProtein += snapshot.proteinG;
    rawBaseCarbs += snapshot.carbohydratesG;
    rawBaseFat += snapshot.fatG;
    rawBaseFiber += snapshot.fiberG || 0;

    return {
      name: ing.name,
      grams: currentGrams,
      snapshot
    };
  });

  // If meal has no ingredients defined, fallback to raw macros
  if (!meal.ingredients || meal.ingredients.length === 0) {
    rawBaseCalories = meal.macros.calories;
    rawBaseProtein = meal.macros.protein;
    rawBaseCarbs = meal.macros.carbs;
    rawBaseFat = meal.macros.fat;
    rawBaseFiber = meal.macros.fiber || 5;
  }

  // 2. Calculate Oil Contribution (9 kcal/g, 1g fat/g)
  const oilCalories = oilGrams * 9;
  const oilFat = oilGrams * 1;

  // 3. Batch Totals & Servings Scaling
  const batchTotals = {
    energyKcal: rawBaseCalories + oilCalories,
    proteinG: rawBaseProtein,
    carbohydratesG: rawBaseCarbs,
    fatG: rawBaseFat + oilFat,
    fiberG: rawBaseFiber,
    sodiumMg: 0,
    calciumMg: 0,
    ironMg: 0
  };

  const perServingSnapshot = calculateServingNutrition(batchTotals, 1);

  // Scaled by selected serving size multiplier
  const finalCalories = Math.round(perServingSnapshot.energyKcal * servings);
  const finalProtein = Math.round(perServingSnapshot.proteinG * servings);
  const finalCarbs = Math.round(perServingSnapshot.carbohydratesG * servings);
  const finalFat = Math.round(perServingSnapshot.fatG * servings);
  const finalFiber = Math.round((perServingSnapshot.fiberG || 0) * servings);

  const handleIngredientGramChange = (idx: number, delta: number) => {
    setIngredientGrams((prev) => {
      const current = prev[idx] || 100;
      const updated = Math.max(10, current + delta);
      return { ...prev, [idx]: updated };
    });
  };

  const handleAddOrUpdate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const mapOilLevel: OilLevel = oilGrams === 0 ? 'none' : oilGrams <= 5 ? 'low' : oilGrams <= 10 ? 'medium' : 'standard';

    const updatedMealItem: MealItem = {
      ...meal,
      type: selectedMealType,
      servings: servings,
      oilLevel: mapOilLevel,
      macros: {
        calories: finalCalories,
        protein: finalProtein,
        carbs: finalCarbs,
        fat: finalFat,
        fiber: finalFiber
      },
      nutritionSnapshot: {
        energyKcal: finalCalories,
        proteinG: finalProtein,
        carbohydratesG: finalCarbs,
        fatG: finalFat,
        fiberG: finalFiber
      }
    };

    if (isEditing && onUpdateMeal) {
      await onUpdateMeal(meal.id, updatedMealItem);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        setIsSubmitting(false);
        onClose();
      }, 700);
    } else if (onAddMeal) {
      await onAddMeal(meal, servings, mapOilLevel, selectedMealType);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        setIsSubmitting(false);
        onClose();
      }, 700);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Edit Portion: ${meal.name}` : meal.name} maxWidth="lg">
      <div className="space-y-6 pb-2">
        {/* Banner image & details */}
        <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-800">
          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/30">
              {String(meal.cuisine).toUpperCase()} CUISINE
            </span>
            <span className="font-mono font-bold text-amber-300 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Score: {meal.nutritionScore}/100
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{meal.description}</p>

        {/* Course Target Selector: Breakfast, Lunch, Snack, Dinner */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400 font-sans">
              <Utensils className="w-3.5 h-3.5" /> Target Meal Course
            </span>
            <span className="text-slate-400 text-[11px] capitalize font-mono">{selectedMealType}</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { type: 'breakfast', label: 'Breakfast' },
              { type: 'lunch', label: 'Lunch' },
              { type: 'snack', label: 'Snack' },
              { type: 'dinner', label: 'Dinner' }
            ].map((course) => (
              <button
                key={course.type}
                type="button"
                onClick={() => setSelectedMealType(course.type as MealType)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                  selectedMealType === course.type
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {course.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Controls: Serving Size & Oil Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          {/* Serving Size Adjuster */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1"><Sliders className="w-3.5 h-3.5 text-emerald-400" /> Serving Size</span>
              <span className="text-emerald-400 font-mono font-bold">{servings}x serving</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[0.5, 1.0, 1.5, 2.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setServings(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    servings === val
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {val}x
                </button>
              ))}
            </div>
          </div>

          {/* Oil Level Adjuster */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-amber-400" /> Cooking Oil Amount</span>
              <span className="text-amber-400 font-mono font-bold">{oilGrams}g oil</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[
                { label: '0g (Zero)', grams: 0 },
                { label: '5g (Low)', grams: 5 },
                { label: '10g (Med)', grams: 10 },
                { label: '15g (Std)', grams: 15 }
              ].map((opt) => (
                <button
                  key={opt.grams}
                  type="button"
                  onClick={() => setOilGrams(opt.grams)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    oilGrams === opt.grams
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Dynamic Macro Badges with Smooth Animated Numbers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" /> Real-time Nutrition Snapshot
            </h4>
            <span className="text-[11px] text-emerald-400 font-mono">Captured at Logging Time</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] text-amber-400 block font-sans font-bold uppercase flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Calories
              </span>
              <span className="text-lg font-extrabold text-amber-300 mt-0.5 block">
                <AnimatedNumber value={finalCalories} /> <span className="text-[10px] text-slate-400">kcal</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-emerald-400 block font-sans font-bold uppercase flex items-center justify-center gap-1">
                <Dumbbell className="w-3 h-3 text-emerald-400" /> Protein
              </span>
              <span className="text-lg font-extrabold text-emerald-300 mt-0.5 block">
                <AnimatedNumber value={finalProtein} /> <span className="text-[10px] text-slate-400">g</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center">
              <span className="text-[10px] text-teal-400 block font-sans font-bold uppercase">Carbs</span>
              <span className="text-lg font-extrabold text-teal-300 mt-0.5 block">
                <AnimatedNumber value={finalCarbs} /> <span className="text-[10px] text-slate-400">g</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Fat</span>
              <span className="text-lg font-extrabold text-slate-200 mt-0.5 block">
                <AnimatedNumber value={finalFat} /> <span className="text-[10px] text-slate-400">g</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <span className="text-[10px] text-cyan-400 block font-sans font-bold uppercase flex items-center justify-center gap-1">
                <Wheat className="w-3 h-3 text-cyan-400" /> Fiber
              </span>
              <span className="text-lg font-extrabold text-cyan-300 mt-0.5 block">
                <AnimatedNumber value={finalFiber} /> <span className="text-[10px] text-slate-400">g</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ingredients Breakdown with Quantity Adjustment */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Ingredient Quantities & Mass Scaling
            </h4>
            <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 text-xs space-y-1">
              {resolvedIngredients.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-100 font-semibold block">{item.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      <span className="text-amber-400 font-bold">{Math.round(item.snapshot.energyKcal * servings)} kcal</span> • <span className="text-emerald-400 font-bold">{Math.round(item.snapshot.proteinG * servings)}g protein</span>
                    </span>
                  </div>

                  {/* Gram Adjustment Controls */}
                  <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleIngredientGramChange(idx, -10)}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-mono font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs text-emerald-300 px-1 font-bold">
                      {item.grams}g
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIngredientGramChange(idx, 10)}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-mono font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* Oil Ingredient Row */}
              <div className="py-2.5 flex items-center justify-between gap-3 border-t border-amber-500/20 bg-amber-500/5 px-2 rounded-lg">
                <div>
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-amber-400" /> Cooking Oil / Ghee ({oilGrams}g)
                  </span>
                  <span className="text-[11px] text-amber-400/80 font-mono">
                    +{Math.round(oilCalories * servings)} kcal • +{Math.round(oilFat * servings)}g healthy fat
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                  +{oilGrams}g
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Steps */}
        {meal.recipeSteps && meal.recipeSteps.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" /> Instructions ({meal.prepTimeMinutes} mins)
            </h4>
            <div className="space-y-2">
              {meal.recipeSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Update CTA Button with Double-Submit Protection */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full shadow-xl shadow-emerald-500/20"
            icon={
              isAdded ? (
                <Check className="w-5 h-5 text-slate-950" />
              ) : isEditing ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )
            }
            onClick={handleAddOrUpdate}
          >
            {isSubmitting ? (
              'Saving to Firestore...'
            ) : isAdded ? (
              isEditing ? 'Portion Updated!' : 'Added to Daily Plan!'
            ) : isEditing ? (
              `Update Logged Portion (${finalCalories} kcal • ${finalProtein}g protein)`
            ) : (
              `Log to ${selectedMealType.toUpperCase()} (${finalCalories} kcal • ${finalProtein}g protein)`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
