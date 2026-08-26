import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Sparkles, 
  Filter, 
  Search, 
  Sliders, 
  RotateCcw
} from 'lucide-react';
import type { MealItem, MealType, GeneratorFilters } from '../types';
import { MOCK_MEALS } from '../data/mockData';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { MealCard } from '../components/ui/MealCard';

interface GeneratorViewProps {
  onViewMealDetails: (meal: MealItem) => void;
  onAddMealToPlan: (meal: MealItem) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  onViewMealDetails,
  onAddMealToPlan
}) => {
  const [filters, setFilters] = useState<GeneratorFilters>({
    mealType: 'breakfast',
    maxCalories: 550,
    minProtein: 25,
    cuisine: 'all',
    dietary: 'all',
    oilLevel: 'low',
    searchQuery: ''
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set(['m1', 'm2', 'm4', 'm5', 'm7', 'm9']));

  const handleToggleFavorite = (meal: MealItem) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(meal.id)) {
        next.delete(meal.id);
      } else {
        next.add(meal.id);
      }
      return next;
    });
  };

  // Deterministic Filtering & Ranking Algorithm
  const filteredMeals = MOCK_MEALS.map((m) => ({
    ...m,
    isFavorite: favorites.has(m.id)
  })).filter((meal) => {
    if (filters.mealType !== 'all' && meal.type !== filters.mealType) return false;
    if (meal.macros.calories > filters.maxCalories) return false;
    if (meal.macros.protein < filters.minProtein) return false;
    if (filters.oilLevel !== 'any' && meal.oilLevel !== filters.oilLevel) return false;
    if (filters.dietary !== 'all' && meal.dietary !== filters.dietary) return false;
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = meal.name.toLowerCase().includes(q);
      const matchDesc = meal.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  }).sort((a, b) => {
    const scoreA = (a.macros.protein / a.macros.calories) * 1000 + a.nutritionScore;
    const scoreB = (b.macros.protein / b.macros.calories) * 1000 + b.nutritionScore;
    return scoreB - scoreA;
  });

  const resetFilters = () => {
    setFilters({
      mealType: 'all',
      maxCalories: 600,
      minProtein: 20,
      cuisine: 'all',
      dietary: 'all',
      oilLevel: 'any',
      searchQuery: ''
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Database-Driven Recommendation Engine
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          South Indian Meal Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Specify your remaining calorie budget and target protein to see matching regional meals.
        </p>
      </motion.div>

      {/* Filter Control Box */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="gradient" className="p-5 space-y-4 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> Macro & Recipe Filters
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Filters
            </Button>
          </div>

          {/* Quick Sliders & Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              label="Meal Type"
              value={filters.mealType}
              onChange={(e) => setFilters({ ...filters, mealType: e.target.value as MealType })}
              options={[
                { value: 'all', label: 'All Meals' },
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'snack', label: 'Evening Snack' },
                { value: 'dinner', label: 'Dinner' }
              ]}
            />

            {/* Max Calories Range Input */}
            <div className="space-y-1.5">
              <label htmlFor="max-cal-input" className="block text-xs font-semibold text-slate-300 flex justify-between">
                <span>Max Calories</span>
                <span className="text-amber-400 font-mono font-bold">{filters.maxCalories} kcal</span>
              </label>
              <input
                id="max-cal-input"
                type="range"
                min={250}
                max={800}
                step={25}
                value={filters.maxCalories}
                onChange={(e) => setFilters({ ...filters, maxCalories: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg focus-visible:outline-2 focus-visible:outline-amber-400"
              />
            </div>

            {/* Min Protein Range Input */}
            <div className="space-y-1.5">
              <label htmlFor="min-pro-input" className="block text-xs font-semibold text-slate-300 flex justify-between">
                <span>Min Protein</span>
                <span className="text-emerald-400 font-mono font-bold">{filters.minProtein}g</span>
              </label>
              <input
                id="min-pro-input"
                type="range"
                min={10}
                max={60}
                step={5}
                value={filters.minProtein}
                onChange={(e) => setFilters({ ...filters, minProtein: Number(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-900 rounded-lg focus-visible:outline-2 focus-visible:outline-emerald-400"
              />
            </div>

            <Select
              label="Oil Level Preference"
              value={filters.oilLevel}
              onChange={(e) => setFilters({ ...filters, oilLevel: e.target.value as any })}
              options={[
                { value: 'low', label: 'Low Oil (Healthy)' },
                { value: 'medium', label: 'Medium Oil' },
                { value: 'standard', label: 'Standard' },
                { value: 'any', label: 'Any Oil Level' }
              ]}
            />
          </div>

          {/* Secondary Search & Dietary Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            <Input
              placeholder="Search dish (e.g. Dosa, Idli, Fish)..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />

            <Select
              label="Dietary Preference"
              value={filters.dietary}
              onChange={(e) => setFilters({ ...filters, dietary: e.target.value })}
              options={[
                { value: 'all', label: 'All Preferences' },
                { value: 'vegetarian', label: 'Vegetarian Only' },
                { value: 'eggitarian', label: 'Eggitarian' },
                { value: 'non-veg', label: 'Non-Vegetarian' }
              ]}
            />

            <div className="flex items-end">
              <div className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between font-mono">
                <span>Matching Dishes:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  {filteredMeals.length} found
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Results Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" /> Target Recommended Meals
        </h2>
        <span className="text-xs text-slate-400">
          Sorted by Protein Density & Score
        </span>
      </motion.div>

      {/* Meal Grid */}
      {filteredMeals.length === 0 ? (
        <motion.div variants={itemVariants}>
          <GlassCard variant="subtle" className="text-center py-12 px-6 space-y-4 border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Meals Match These Exact Filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try broadening your calorie cap or lowering the minimum protein threshold to discover more dishes.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset All Filters
            </Button>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <motion.div key={meal.id} variants={itemVariants}>
              <MealCard
                meal={meal}
                onAdd={onAddMealToPlan}
                onViewDetails={onViewMealDetails}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
