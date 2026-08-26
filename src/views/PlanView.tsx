import { motion } from 'framer-motion';
import { CalendarDays, Flame, Dumbbell, CheckCircle2, Trash2, Plus, Sparkles } from 'lucide-react';
import type { Route, MealItem, MealType } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

interface PlanViewProps {
  onNavigate: (route: Route) => void;
  loggedMeals: Record<MealType, MealItem[]>;
  onRemoveMeal?: (mealType: MealType, mealId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const PlanView: React.FC<PlanViewProps> = ({
  onNavigate,
  loggedMeals,
  onRemoveMeal
}) => {
  const allLogged = Object.values(loggedMeals).flat();
  const totalCalories = allLogged.reduce((sum, m) => sum + m.macros.calories, 0);
  const totalProtein = allLogged.reduce((sum, m) => sum + m.macros.protein, 0);
  const totalCarbs = allLogged.reduce((sum, m) => sum + m.macros.carbs, 0);
  const totalFat = allLogged.reduce((sum, m) => sum + m.macros.fat, 0);

  const sections: { key: MealType; label: string; time: string }[] = [
    { key: 'breakfast', label: 'Breakfast', time: '08:30 AM' },
    { key: 'lunch', label: 'Lunch', time: '01:30 PM' },
    { key: 'snack', label: 'Evening Snack', time: '05:30 PM' },
    { key: 'dinner', label: 'Dinner', time: '08:30 PM' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-6 max-w-5xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-8 h-8 text-emerald-400" /> Daily Meal Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your planned breakfast, lunch, snacks, and dinner for today.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => onNavigate('generator')}
        >
          Add Meal from Generator
        </Button>
      </motion.div>

      {/* Plan Macro Totals Header */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Today's Planned Totals
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {allLogged.length} Meals Planned
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Planned Calories</span>
              <span className="text-xl font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-4 h-4" /> {totalCalories} kcal
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Planned Protein</span>
              <span className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <Dumbbell className="w-4 h-4" /> {totalProtein}g
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Planned Carbs</span>
              <span className="text-xl font-bold text-cyan-300 mt-0.5 block">{totalCarbs}g</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Planned Fat</span>
              <span className="text-xl font-bold text-slate-300 mt-0.5 block">{totalFat}g</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Schedule Timeline */}
      <div className="space-y-4">
        {sections.map((section) => {
          const meals = loggedMeals[section.key] || [];
          return (
            <motion.div key={section.key} variants={itemVariants}>
              <GlassCard variant="interactive" className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {section.time}
                    </span>
                    <h3 className="font-bold text-base text-white">{section.label}</h3>
                  </div>

                  <span className="text-xs text-slate-400">
                    {meals.length} item{meals.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {meals.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500 italic">
                    No dish added for {section.label}. Click generator to add a meal fitting your macros.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div>
                            <h4 className="font-bold text-sm text-white">{meal.name}</h4>
                            <span className="text-xs text-slate-400 font-mono">
                              {meal.macros.calories} kcal • <span className="text-emerald-400 font-semibold">{meal.macros.protein}g protein</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Logged
                          </span>
                          {onRemoveMeal && (
                            <button
                              onClick={() => onRemoveMeal(section.key, meal.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-400"
                              aria-label={`Remove ${meal.name} from plan`}
                              title="Remove meal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
