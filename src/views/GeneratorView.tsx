import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Search, 
  AlertCircle, 
  Dumbbell, 
  Flame, 
  Award,
  RefreshCw,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import type { MealItem, MealType, UserProfileData } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { MealCard } from '../components/ui/MealCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { FirestoreRecipesService } from '../services/firestore';
import { recommendMeals, type GeneratorFilterState, type RankedMealItem } from '../utils/recommendationEngine';

interface GeneratorViewProps {
  onViewMealDetails: (meal: MealItem) => void;
  onAddMealToPlan: (meal: MealItem) => void;
  userProfile?: UserProfileData;
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
  onAddMealToPlan,
  userProfile
}) => {
  const [recipes, setRecipes] = useState<MealItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Filter State
  const [filters, setFilters] = useState<GeneratorFilterState>({
    mealType: 'breakfast',
    maxCalories: userProfile ? Math.min(800, Math.max(350, Math.round(userProfile.targetCalories * 0.35))) : 500,
    minProtein: userProfile ? Math.min(50, Math.max(15, Math.round(userProfile.targetProtein * 0.25))) : 25,
    cuisine: 'all',
    dietary: userProfile?.dietaryPreference ? (userProfile.dietaryPreference === 'non-veg' ? 'non-veg' : userProfile.dietaryPreference) : 'all',
    oilLevel: userProfile?.oilPreference || 'any',
    maxPrepTimeMinutes: 'any',
    searchQuery: '',
    sortBy: 'smart'
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set(['m1', 'm2', 'm4', 'm5', 'm7', 'm9']));

  // Fetch Firestore Recipes on Mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    FirestoreRecipesService.getRecipes().then((fetched) => {
      if (isMounted) {
        setRecipes(fetched);
        setIsLoading(false);
      }
    }).catch((err) => {
      console.warn('Firestore getRecipes error in GeneratorView:', err);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Run Recommendation Logic
  const rankedResults: RankedMealItem[] = recommendMeals(
    recipes.map((m) => ({ ...m, isFavorite: favorites.has(m.id) })),
    filters,
    userProfile
  );

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 400);
  };

  const handleRelaxProtein = () => {
    setFilters((prev) => ({
      ...prev,
      minProtein: Math.max(5, prev.minProtein - 5)
    }));
  };

  const handleIncreaseCalories = () => {
    setFilters((prev) => ({
      ...prev,
      maxCalories: Math.min(1200, prev.maxCalories + 50)
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      mealType: 'all',
      maxCalories: 600,
      minProtein: 20,
      cuisine: 'all',
      dietary: 'all',
      oilLevel: 'any',
      maxPrepTimeMinutes: 'any',
      searchQuery: '',
      sortBy: 'smart'
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Deterministic Firestore Recommendation Engine
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Meal Recommendation System
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Filter verified Indian recipes deterministically by remaining calories, protein targets, and dietary preferences.
        </p>
      </motion.div>

      {/* Filter Control Dashboard */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="gradient" className="p-6 space-y-5 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> Target Criteria & Recipe Filters
            </h2>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                icon={<RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRegenerating ? 'animate-spin' : ''}`} />}
                className="text-xs text-emerald-300"
              >
                Regenerate
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Core Target Sliders & Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              label="Meal Course"
              value={filters.mealType}
              onChange={(e) => setFilters({ ...filters, mealType: e.target.value as MealType })}
              options={[
                { value: 'all', label: 'All Courses' },
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'snack', label: 'Evening Snack' },
                { value: 'dinner', label: 'Dinner' }
              ]}
            />

            {/* Max Calories Range Input */}
            <div className="space-y-1.5">
              <label htmlFor="max-cal-range" className="block text-xs font-semibold text-slate-300 flex justify-between">
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-400" /> Max Calories</span>
                <span className="text-amber-400 font-mono font-bold">{filters.maxCalories} kcal</span>
              </label>
              <input
                id="max-cal-range"
                type="range"
                min={200}
                max={1000}
                step={25}
                value={filters.maxCalories}
                onChange={(e) => setFilters({ ...filters, maxCalories: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg focus-visible:outline-2 focus-visible:outline-amber-400"
              />
            </div>

            {/* Min Protein Range Input */}
            <div className="space-y-1.5">
              <label htmlFor="min-pro-range" className="block text-xs font-semibold text-slate-300 flex justify-between">
                <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Min Protein</span>
                <span className="text-emerald-400 font-mono font-bold">{filters.minProtein}g</span>
              </label>
              <input
                id="min-pro-range"
                type="range"
                min={5}
                max={70}
                step={5}
                value={filters.minProtein}
                onChange={(e) => setFilters({ ...filters, minProtein: Number(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-900 rounded-lg focus-visible:outline-2 focus-visible:outline-emerald-400"
              />
            </div>

            <Select
              label="Oil Preference"
              value={filters.oilLevel}
              onChange={(e) => setFilters({ ...filters, oilLevel: e.target.value as any })}
              options={[
                { value: 'any', label: 'Any Oil Level' },
                { value: 'none', label: 'Zero Oil / Steamed' },
                { value: 'low', label: 'Low Oil' },
                { value: 'medium', label: 'Medium Oil' },
                { value: 'standard', label: 'Standard Oil' }
              ]}
            />
          </div>

          {/* Secondary Controls: Cuisine, Dietary, Prep Time & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80">
            <Select
              label="Cuisine Region"
              value={filters.cuisine}
              onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
              options={[
                { value: 'all', label: 'All Cuisines' },
                { value: 'south-indian', label: 'South Indian' },
                { value: 'tamil', label: 'Tamil Nadu' },
                { value: 'kerala', label: 'Kerala' },
                { value: 'andhra', label: 'Andhra' },
                { value: 'karnataka', label: 'Karnataka' }
              ]}
            />

            <Select
              label="Dietary Choice"
              value={filters.dietary}
              onChange={(e) => setFilters({ ...filters, dietary: e.target.value })}
              options={[
                { value: 'all', label: 'All Diets' },
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'eggitarian', label: 'Eggitarian' },
                { value: 'non-veg', label: 'Non-Vegetarian' }
              ]}
            />

            <Select
              label="Max Prep Time"
              value={String(filters.maxPrepTimeMinutes)}
              onChange={(e) => setFilters({ ...filters, maxPrepTimeMinutes: e.target.value === 'any' ? 'any' : Number(e.target.value) })}
              options={[
                { value: 'any', label: 'Any Prep Time' },
                { value: '15', label: 'Under 15 Mins' },
                { value: '25', label: 'Under 25 Mins' },
                { value: '40', label: 'Under 40 Mins' }
              ]}
            />

            <Input
              label="Dish Search"
              placeholder="Search dish or ingredient..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Sorting & Results Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Recommended Recipes</h2>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            {rankedResults.length} matches
          </span>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Sort by:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={filters.sortBy === 'smart' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, sortBy: 'smart' })}
              icon={<Zap className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Smart Match
            </Button>

            <Button
              variant={filters.sortBy === 'protein_desc' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, sortBy: 'protein_desc' })}
              icon={<Dumbbell className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Protein
            </Button>

            <Button
              variant={filters.sortBy === 'calories_desc' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, sortBy: 'calories_desc' })}
              icon={<Flame className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Calories
            </Button>

            <Button
              variant={filters.sortBy === 'score_desc' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, sortBy: 'score_desc' })}
              icon={<Award className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Nutrition Score
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content Rendering: Loading vs Empty vs Cards */}
      {isLoading ? (
        <LoadingSkeleton count={6} type="card" />
      ) : rankedResults.length === 0 ? (
        /* Explicit No-Match Prompt with Quick Action Buttons */
        <motion.div variants={itemVariants}>
          <GlassCard variant="subtle" className="text-center py-12 px-6 space-y-6 border-dashed border-amber-500/30 bg-amber-500/5 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">No meals currently match your exact target.</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                We couldn't find recipes fitting <strong className="text-amber-400">{filters.maxCalories} kcal</strong> max and <strong className="text-emerald-400">{filters.minProtein}g protein</strong> min with your selected filters.
              </p>
            </div>

            {/* Constraint Relaxation Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRelaxProtein}
                icon={<Dumbbell className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Relax Protein Target (-5g)
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleIncreaseCalories}
                icon={<Flame className="w-4 h-4" />}
                className="bg-amber-600 hover:bg-amber-500"
              >
                Increase Calorie Limit (+50 kcal)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset All Filters
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        /* Recommended Meal Cards Grid */
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedResults.map(({ meal, matchScore, matchReasons }) => (
            <motion.div key={meal.id} variants={itemVariants} className="relative group">
              {/* Match Badge Banner */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-extrabold shadow-lg">
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>{matchScore}% Match • {matchReasons[0]}</span>
              </div>

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
