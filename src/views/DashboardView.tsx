import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Dumbbell, 
  Plus, 
  Sparkles, 
  UtensilsCrossed, 
  Coffee, 
  Sun, 
  Cookie, 
  Moon,
  ChevronRight,
  TrendingUp,
  Compass,
  Edit3,
  Trash2,
  Wheat
} from 'lucide-react';
import type { Route, MealItem, DailyNutritionTarget, MealType, UserProfileData } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { QuickAddMealModal } from '../components/dashboard/QuickAddMealModal';

interface DashboardViewProps {
  onNavigate: (route: Route) => void;
  onViewMealDetails: (meal: MealItem) => void;
  onEditMealPortion: (meal: MealItem) => void;
  dailyNutrition: DailyNutritionTarget;
  loggedMeals: Record<MealType, MealItem[]>;
  onAddMealClick: (mealType: MealType) => void;
  onQuickAddMeal?: (recipe: MealItem, targetMealType: MealType) => void;
  onRemoveMeal: (mealType: MealType, mealId: string) => Promise<void> | void;
  userProfile?: UserProfileData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onViewMealDetails,
  onEditMealPortion,
  dailyNutrition,
  loggedMeals,
  onQuickAddMeal,
  onRemoveMeal,
  userProfile
}) => {
  const [quickAddModalSection, setQuickAddModalSection] = useState<MealType | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  const caloriesRemaining = Math.max(0, dailyNutrition.targetCalories - dailyNutrition.consumedCalories);
  const proteinRemaining = Math.max(0, dailyNutrition.targetProtein - dailyNutrition.consumedProtein);
  
  const caloriePercentage = Math.min(100, Math.round((dailyNutrition.consumedCalories / dailyNutrition.targetCalories) * 100));
  const proteinPercentage = Math.min(100, Math.round((dailyNutrition.consumedProtein / dailyNutrition.targetProtein) * 100));

  const mealSections: { type: MealType; title: string; icon: React.ReactNode; time: string }[] = [
    { type: 'breakfast', title: 'Breakfast', icon: <Coffee className="w-4 h-4 text-amber-400" />, time: '08:00 AM - 10:00 AM' },
    { type: 'lunch', title: 'Lunch', icon: <Sun className="w-4 h-4 text-emerald-400" />, time: '01:00 PM - 03:00 PM' },
    { type: 'snack', title: 'Evening Snack', icon: <Cookie className="w-4 h-4 text-teal-400" />, time: '05:00 PM - 06:30 PM' },
    { type: 'dinner', title: 'Dinner', icon: <Moon className="w-4 h-4 text-cyan-400" />, time: '08:00 PM - 10:00 PM' }
  ];

  const firstName = userProfile?.name ? userProfile.name.split(' ')[0] : 'User';

  const handleRemove = async (sectionType: MealType, mealId: string) => {
    if (deletingMealId) return; // Prevent duplicate clicks
    setDeletingMealId(mealId);
    try {
      await onRemoveMeal(sectionType, mealId);
    } finally {
      setDeletingMealId(null);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-4 max-w-6xl mx-auto"
    >
      {/* Top Greeting Banner */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Today, {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real daily meal tracking & South Indian macro targets snapshot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={<Compass className="w-4 h-4" />}
            onClick={() => onNavigate('generator')}
          >
            Target Generator
          </Button>
        </div>
      </motion.div>

      {/* Main Nutrition Summary Dashboard Card */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="gradient" className="p-6 sm:p-8 space-y-6 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Today's Macro Snapshot
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              <AnimatedNumber value={dailyNutrition.consumedCalories} /> / {dailyNutrition.targetCalories} kcal
            </span>
          </div>

          {/* Hero Progress Gauge Rings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Calorie Ring */}
            <div
              className="flex items-center gap-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80"
              role="progressbar"
              aria-valuenow={dailyNutrition.consumedCalories}
              aria-valuemax={dailyNutrition.targetCalories}
              aria-label="Calorie consumption progress"
            >
              <ProgressRing progress={caloriePercentage} size={110} strokeWidth={9} color="stroke-amber-400">
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  <AnimatedNumber value={caloriePercentage} />%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">CALORIES</span>
              </ProgressRing>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-bold">
                  <Flame className="w-4 h-4 text-amber-400" /> Calorie Goal
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  <AnimatedNumber value={caloriesRemaining} /> <span className="text-xs text-slate-400 font-normal">kcal remaining</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Consumed: <span className="text-amber-400 font-bold"><AnimatedNumber value={dailyNutrition.consumedCalories} /></span> / {dailyNutrition.targetCalories} kcal
                </div>
              </div>
            </div>

            {/* Protein Ring */}
            <div
              className="flex items-center gap-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80"
              role="progressbar"
              aria-valuenow={dailyNutrition.consumedProtein}
              aria-valuemax={dailyNutrition.targetProtein}
              aria-label="Protein consumption progress"
            >
              <ProgressRing progress={proteinPercentage} size={110} strokeWidth={9} color="stroke-emerald-400">
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  <AnimatedNumber value={proteinPercentage} />%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">PROTEIN</span>
              </ProgressRing>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-bold">
                  <Dumbbell className="w-4 h-4 text-emerald-400" /> Protein Goal
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  <AnimatedNumber value={proteinRemaining} />g <span className="text-xs text-slate-400 font-normal">protein left</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Consumed: <span className="text-emerald-400 font-bold"><AnimatedNumber value={dailyNutrition.consumedProtein} />g</span> / {dailyNutrition.targetProtein}g
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Macro Progress Bars (Carbs, Fat, Fiber) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <ProgressBar
              label="Carbohydrates"
              value={dailyNutrition.consumedCarbs}
              max={dailyNutrition.targetCarbs}
              unit="g"
              color="from-teal-400 to-cyan-500"
              showPercentage
            />

            <ProgressBar
              label="Healthy Fats"
              value={dailyNutrition.consumedFat}
              max={dailyNutrition.targetFat}
              unit="g"
              color="from-slate-400 to-slate-500"
              showPercentage
            />

            <ProgressBar
              label="Dietary Fiber"
              value={dailyNutrition.consumedFiber || 0}
              max={dailyNutrition.targetFiber || 35}
              unit="g"
              color="from-cyan-400 to-emerald-500"
              showPercentage
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Target Recommendation Prompt Banner */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="gradient" className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Need a {caloriesRemaining} kcal meal with high protein?</h3>
              <p className="text-xs text-slate-300">GAUGE will filter South Indian meals that fit your exact remaining macros.</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="shrink-0 w-full sm:w-auto"
            onClick={() => onNavigate('generator')}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Find Matching Meals
          </Button>
        </GlassCard>
      </motion.div>

      {/* Today's Meal Sections */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-emerald-400" /> Today's Logged Meals
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {mealSections.map((section) => {
            const meals = loggedMeals[section.type] || [];
            return (
              <motion.div key={section.type} variants={itemVariants} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <h3 className="font-bold text-base text-white">{section.title}</h3>
                    <span className="text-xs text-slate-500 font-normal">({section.time})</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setQuickAddModalSection(section.type)}
                  >
                    Add Meal
                  </Button>
                </div>

                {meals.length === 0 ? (
                  <EmptyState
                    icon={section.icon}
                    title={`No ${section.title} Logged Yet`}
                    description={`Select a saved dish or generate a meal specifically for ${section.title}.`}
                    actionLabel={`Log ${section.title}`}
                    onAction={() => setQuickAddModalSection(section.type)}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meals.map((meal) => {
                      const isDeleting = deletingMealId === meal.id;
                      return (
                        <GlassCard
                          key={meal.id}
                          variant="interactive"
                          className="p-4 flex flex-col justify-between space-y-3 border-slate-800/80 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={meal.image}
                                  alt={meal.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                                />
                                <div>
                                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors leading-snug">
                                    {meal.name}
                                  </h4>
                                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
                                    {meal.servings || 1}x serving
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Snapshot Macro Pill Grid */}
                            <div className="grid grid-cols-5 gap-1 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono text-[11px]">
                              <div>
                                <span className="text-[9px] text-amber-400 block font-sans font-semibold">Kcal</span>
                                <span className="font-bold text-amber-300">{meal.macros.calories}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-emerald-400 block font-sans font-semibold">Pro</span>
                                <span className="font-bold text-emerald-300">{meal.macros.protein}g</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-teal-400 block font-sans font-semibold">Carb</span>
                                <span className="font-semibold text-teal-300">{meal.macros.carbs}g</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block font-sans font-semibold">Fat</span>
                                <span className="font-semibold text-slate-300">{meal.macros.fat}g</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-cyan-400 block font-sans font-semibold flex items-center justify-center gap-0.5">
                                  <Wheat className="w-2.5 h-2.5 text-cyan-400" /> Fib
                                </span>
                                <span className="font-semibold text-cyan-300">{meal.macros.fiber || 0}g</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions: Edit portion & Remove */}
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 justify-between">
                            <button
                              onClick={() => onViewMealDetails(meal)}
                              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              Details
                            </button>

                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Edit3 className="w-3 h-3" />}
                                onClick={() => onEditMealPortion(meal)}
                                className="text-[11px] py-1 px-2.5 h-7"
                              >
                                Edit Portion
                              </Button>

                              <button
                                disabled={isDeleting}
                                onClick={() => handleRemove(section.type, meal.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                aria-label={`Remove ${meal.name}`}
                                title="Remove meal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Add Meal Modal */}
      {quickAddModalSection && (
        <QuickAddMealModal
          isOpen={!!quickAddModalSection}
          onClose={() => setQuickAddModalSection(null)}
          targetMealType={quickAddModalSection}
          onSelectRecipeToLog={(recipe) => {
            if (onQuickAddMeal) {
              onQuickAddMeal(recipe, quickAddModalSection);
            }
          }}
          onNavigateToGenerator={() => onNavigate('generator')}
        />
      )}
    </motion.div>
  );
};
