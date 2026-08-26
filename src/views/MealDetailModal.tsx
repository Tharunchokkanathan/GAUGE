import React, { useState } from 'react';
import { Flame, Dumbbell, Clock, Sparkles, Droplets, Plus, Check, Utensils } from 'lucide-react';
import type { MealItem, OilLevel } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { NutritionBadge } from '../components/ui/NutritionBadge';

interface MealDetailModalProps {
  meal: MealItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMeal?: (meal: MealItem, portionMultiplier: number, oil: OilLevel) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  isOpen,
  onClose,
  onAddMeal
}) => {
  const [portion, setPortion] = useState<number>(1);
  const [selectedOil, setSelectedOil] = useState<OilLevel>(meal?.oilLevel || 'low');
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!meal) return null;

  // Calculate dynamic macros based on portion multiplier & oil adjustment
  const oilDelta = selectedOil === 'low' ? -35 : selectedOil === 'medium' ? 0 : 35;
  const scaledCalories = Math.round(meal.macros.calories * portion + oilDelta);
  const scaledProtein = Math.round(meal.macros.protein * portion);
  const scaledCarbs = Math.round(meal.macros.carbs * portion);
  const scaledFat = Math.round(meal.macros.fat * portion + (selectedOil === 'low' ? -4 : selectedOil === 'standard' ? 4 : 0));

  const handleAdd = () => {
    if (onAddMeal) {
      onAddMeal(meal, portion, selectedOil);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meal.name} maxWidth="lg">
      <div className="space-y-6 pb-2">
        {/* Banner image & quick details */}
        <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-800">
          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/30">
              {meal.cuisine.toUpperCase()} CUISINE
            </span>
            <span className="font-mono font-bold text-amber-300 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Score: {meal.nutritionScore}/100
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{meal.description}</p>

        {/* Portion & Oil Adjuster Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          {/* Portion Multiplier */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Portion Scaling</span>
              <span className="text-emerald-400 font-mono">{portion}x ({Math.round(100 * portion)}%)</span>
            </label>
            <div className="flex items-center gap-2">
              {[0.75, 1.0, 1.25, 1.5].map((val) => (
                <button
                  key={val}
                  onClick={() => setPortion(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    portion === val
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {val}x
                </button>
              ))}
            </div>
          </div>

          {/* Oil Level Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Oil Level Adjustment</span>
              <span className="text-amber-400 capitalize flex items-center gap-1 font-mono">
                <Droplets className="w-3 h-3" /> {selectedOil}
              </span>
            </label>
            <div className="flex items-center gap-2">
              {(['low', 'medium', 'standard'] as OilLevel[]).map((oil) => (
                <button
                  key={oil}
                  onClick={() => setSelectedOil(oil)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    selectedOil === oil
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {oil}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Dynamic Macro Badges */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculated Nutrition</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <NutritionBadge label="Calories" value={scaledCalories} unit="kcal" variant="amber" icon={<Flame className="w-3.5 h-3.5" />} />
            <NutritionBadge label="Protein" value={scaledProtein} unit="g" variant="emerald" icon={<Dumbbell className="w-3.5 h-3.5" />} />
            <NutritionBadge label="Carbs" value={scaledCarbs} unit="g" variant="teal" />
            <NutritionBadge label="Fat" value={Math.max(0, scaledFat)} unit="g" variant="slate" />
          </div>
        </div>

        {/* Ingredients Breakdown */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Ingredient Breakdown
          </h4>
          <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 text-xs">
            {meal.ingredients.map((ing, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <span className="text-slate-200 font-medium">{ing.name} ({ing.amount})</span>
                <span className="font-mono text-slate-400">
                  <span className="text-amber-400 font-semibold">{Math.round(ing.calories * portion)} kcal</span> • <span className="text-emerald-400 font-semibold">{Math.round(ing.protein * portion)}g protein</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipe Steps */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-400" /> Preparation & Recipe ({meal.prepTimeMinutes} mins)
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

        {/* Add CTA Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={isAdded ? <Check className="w-5 h-5 text-slate-950" /> : <Plus className="w-5 h-5" />}
            onClick={handleAdd}
          >
            {isAdded ? 'Added to Today’s Plan!' : `Add to Plan (${scaledCalories} kcal)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
