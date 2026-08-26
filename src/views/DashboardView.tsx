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
  Compass
} from 'lucide-react';
import type { Route, MealItem, DailyNutritionTarget, MealType } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MealCard } from '../components/ui/MealCard';
import { EmptyState } from '../components/ui/EmptyState';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

interface DashboardViewProps {
  onNavigate: (route: Route) => void;
  onViewMealDetails: (meal: MealItem) => void;
  dailyNutrition: DailyNutritionTarget;
  loggedMeals: Record<MealType, MealItem[]>;
  onAddMealClick: (mealType: MealType) => void;
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
  dailyNutrition,
  loggedMeals,
  onAddMealClick
}) => {
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
            Good morning, Tharun 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is your daily macro targets & South Indian nutrition progress.
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
              <Sparkles className="w-5 h-5 text-emerald-400" /> Today's Macro Progress
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

          {/* Secondary Macro Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                    onClick={() => onAddMealClick(section.type)}
                  >
                    Add Meal
                  </Button>
                </div>

                {meals.length === 0 ? (
                  <EmptyState
                    icon={section.icon}
                    title={`No ${section.title} Logged Yet`}
                    description="Use the generator or browse meals to log your food for today."
                    actionLabel={`Generate ${section.title}`}
                    onAction={() => onNavigate('generator')}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onViewDetails={onViewMealDetails}
                        compact
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
