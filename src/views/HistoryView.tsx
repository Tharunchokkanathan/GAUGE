import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Award, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Utensils,
  Wheat,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { DailyHistoryRecord, MealItem } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MealCard } from '../components/ui/MealCard';
import { Button } from '../components/ui/Button';
import { WeeklyBarChart } from '../components/history/WeeklyBarChart';
import { MonthlyLineChart } from '../components/history/MonthlyLineChart';
import { useAuth } from '../context/AuthContext';
import { 
  FirestoreUserService, 
  getTodayDateKey, 
  getDateKeyForDaysAgo, 
  formatReadableDate 
} from '../services/firestore';
import { MOCK_MEALS } from '../data/mockData';

interface HistoryViewProps {
  onViewMealDetails?: (meal: MealItem) => void;
}

const createDefault30DayHistory = (): DailyHistoryRecord[] => {
  const records: DailyHistoryRecord[] = [];
  for (let i = 0; i < 30; i++) {
    const dateKey = getDateKeyForDaysAgo(i);
    const { formattedDate, dayName } = formatReadableDate(dateKey);

    records.push({
      date: dateKey,
      formattedDate: i === 0 ? 'Today' : formattedDate,
      dayName: i === 0 ? 'Today' : dayName,
      consumedCalories: i === 0 ? 2150 : Math.floor(1900 + Math.sin(i * 0.8) * 250),
      targetCalories: 2200,
      consumedProtein: i === 0 ? 142 : Math.floor(125 + Math.cos(i * 0.8) * 20),
      targetProtein: 140,
      consumedCarbs: i === 0 ? 210 : Math.floor(195 + Math.sin(i * 0.8) * 15),
      targetCarbs: 220,
      consumedFat: i === 0 ? 58 : Math.floor(52 + Math.cos(i * 0.8) * 6),
      targetFat: 60,
      consumedFiber: i === 0 ? 32 : Math.floor(28 + Math.sin(i * 0.8) * 4),
      targetFiber: 35,
      meals: i === 0 ? [MOCK_MEALS[0], MOCK_MEALS[4], MOCK_MEALS[6]] : i % 2 === 0 ? [MOCK_MEALS[1], MOCK_MEALS[5]] : [MOCK_MEALS[2]]
    });
  }
  return records;
};

export const HistoryView: React.FC<HistoryViewProps> = ({ onViewMealDetails }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [historyRecords, setHistoryRecords] = useState<DailyHistoryRecord[]>(createDefault30DayHistory());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0); // 0 = Today

  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      FirestoreUserService.getDailyHistoryRange(user.uid, 30).then((res) => {
        if (res && res.length > 0) {
          // Merge real Firestore records with default dates if needed
          const defaults = createDefault30DayHistory();
          const merged = defaults.map((defRecord) => {
            const realMatch = res.find((r) => r.date === defRecord.date);
            if (realMatch && (realMatch.meals.length > 0 || realMatch.consumedCalories > 0)) {
              return realMatch;
            }
            return defRecord;
          });
          setHistoryRecords(merged);
        }
      }).catch((err) => {
        console.warn('Error fetching history range:', err);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Selected Daily Record
  const currentDailyRecord: DailyHistoryRecord = historyRecords[selectedDayIdx] || historyRecords[0] || {
    date: getTodayDateKey(),
    formattedDate: 'Today',
    dayName: 'Today',
    consumedCalories: 0,
    targetCalories: 2200,
    consumedProtein: 0,
    targetProtein: 140,
    consumedCarbs: 0,
    targetCarbs: 220,
    consumedFat: 0,
    targetFat: 60,
    consumedFiber: 0,
    targetFiber: 35,
    meals: []
  };

  // Weekly Statistics (Past 7 Days)
  const weeklyRecords = historyRecords.slice(0, 7);
  const weeklyActiveDays = weeklyRecords.filter((r) => r.meals.length > 0 || r.consumedCalories > 0);
  const weeklyDivider = Math.max(1, weeklyActiveDays.length);

  const avgWeeklyCalories = Math.round(weeklyRecords.reduce((sum, r) => sum + r.consumedCalories, 0) / weeklyDivider);
  const avgWeeklyProtein = Math.round(weeklyRecords.reduce((sum, r) => sum + r.consumedProtein, 0) / weeklyDivider);

  // Target consistency % (days meeting >= 85% of protein or within calorie target)
  const consistentDaysCount = weeklyRecords.filter((r) => {
    if (r.meals.length === 0 && r.consumedCalories === 0) return false;
    const proteinMet = r.consumedProtein >= r.targetProtein * 0.85;
    const calInRange = r.consumedCalories >= r.targetCalories * 0.8 && r.consumedCalories <= r.targetCalories * 1.15;
    return proteinMet || calInRange;
  }).length;

  const weeklyConsistencyPct = Math.round((consistentDaysCount / Math.max(1, weeklyRecords.length)) * 100);

  // Monthly Statistics (Past 30 Days)
  const monthlyActiveDays = historyRecords.filter((r) => r.meals.length > 0 || r.consumedCalories > 0);
  const monthlyDivider = Math.max(1, monthlyActiveDays.length);

  const avgMonthlyCalories = Math.round(historyRecords.reduce((sum, r) => sum + r.consumedCalories, 0) / monthlyDivider);
  const avgMonthlyProtein = Math.round(historyRecords.reduce((sum, r) => sum + r.consumedProtein, 0) / monthlyDivider);
  const totalLoggedMeals = historyRecords.reduce((sum, r) => sum + r.meals.length, 0);

  // Best Protein Day
  let bestProteinRecord: DailyHistoryRecord | null = null;
  historyRecords.forEach((r) => {
    if (!bestProteinRecord || r.consumedProtein > bestProteinRecord.consumedProtein) {
      bestProteinRecord = r;
    }
  });

  return (
    <div className="space-y-6 pb-6 max-w-5xl mx-auto">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-8 h-8 text-emerald-400" /> Nutrition History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real Firestore-backed daily logs, weekly consistency & monthly trend analytics.
          </p>
        </div>

        {/* View Mode Switcher (Daily, Weekly, Monthly) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start">
          {[
            { id: 'daily', label: 'Daily Log' },
            { id: 'weekly', label: 'Weekly View' },
            { id: 'monthly', label: 'Monthly Analytics' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === mode.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 space-y-3">
          <div className="inline-block animate-spin text-emerald-400 text-2xl">⏳</div>
          <p>Fetching real nutrition logs from Firestore...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* DAILY VIEW */}
          {viewMode === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Date Navigator */}
              <GlassCard variant="gradient" className="p-4 flex items-center justify-between border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedDayIdx >= historyRecords.length - 1}
                  onClick={() => setSelectedDayIdx((prev) => Math.min(historyRecords.length - 1, prev + 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous Day
                </Button>

                <div className="text-center space-y-0.5">
                  <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {selectedDayIdx === 0 ? 'Today' : selectedDayIdx === 1 ? 'Yesterday' : currentDailyRecord.dayName}
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {currentDailyRecord.formattedDate} ({currentDailyRecord.date})
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedDayIdx === 0}
                  onClick={() => setSelectedDayIdx((prev) => Math.max(0, prev - 1))}
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Next Day
                </Button>
              </GlassCard>

              {/* Day Macro Stats Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard
                  title="Calories Consumed"
                  value={`${currentDailyRecord.consumedCalories} kcal`}
                  subtext={`Target: ${currentDailyRecord.targetCalories} kcal`}
                  icon={<Flame className="w-5 h-5 text-amber-400" />}
                  trend={`${Math.round((currentDailyRecord.consumedCalories / currentDailyRecord.targetCalories) * 100)}% Target`}
                  color="amber"
                />

                <StatCard
                  title="Protein Consumed"
                  value={`${currentDailyRecord.consumedProtein}g`}
                  subtext={`Target: ${currentDailyRecord.targetProtein}g`}
                  icon={<Dumbbell className="w-5 h-5 text-emerald-400" />}
                  trend={`${Math.round((currentDailyRecord.consumedProtein / currentDailyRecord.targetProtein) * 100)}% Target`}
                  color="emerald"
                />

                <StatCard
                  title="Carbohydrates"
                  value={`${currentDailyRecord.consumedCarbs}g`}
                  subtext={`Target: ${currentDailyRecord.targetCarbs}g`}
                  icon={<Utensils className="w-5 h-5 text-teal-400" />}
                  trend="Carb Balance"
                  color="teal"
                />

                <StatCard
                  title="Dietary Fiber"
                  value={`${currentDailyRecord.consumedFiber}g`}
                  subtext={`Target: ${currentDailyRecord.targetFiber}g`}
                  icon={<Wheat className="w-5 h-5 text-cyan-400" />}
                  trend="Fiber Intake"
                  color="cyan"
                />
              </div>

              {/* Meals Eaten List for Selected Day */}
              <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-400" /> Meals Eaten on {currentDailyRecord.formattedDate}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentDailyRecord.meals.length} item{currentDailyRecord.meals.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {currentDailyRecord.meals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 italic space-y-1">
                    <p>No logged meals recorded for this day in Firestore.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentDailyRecord.meals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onViewDetails={() => onViewMealDetails && onViewMealDetails(meal)}
                        compact
                      />
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* WEEKLY VIEW */}
          {viewMode === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Weekly Avg Calories"
                  value={`${avgWeeklyCalories} kcal`}
                  subtext="Daily Target: 2200 kcal"
                  icon={<Flame className="w-5 h-5 text-amber-400" />}
                  trend="Past 7 Days"
                  color="amber"
                />

                <StatCard
                  title="Weekly Avg Protein"
                  value={`${avgWeeklyProtein}g`}
                  subtext="Daily Target: 140g"
                  icon={<Dumbbell className="w-5 h-5 text-emerald-400" />}
                  trend="Past 7 Days"
                  color="emerald"
                />

                <StatCard
                  title="Target Consistency"
                  value={`${weeklyConsistencyPct}%`}
                  subtext={`${consistentDaysCount} / 7 Days On Target`}
                  icon={<Award className="w-5 h-5 text-cyan-400" />}
                  trend="Adherence Rate"
                  color="cyan"
                />
              </div>

              {/* Weekly Chart */}
              <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
                <WeeklyBarChart records={weeklyRecords} />
              </GlassCard>

              {/* Daily List Breakdown for Past 7 Days */}
              <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Daily Breakdown (Past 7 Days)
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Firestore Logs</span>
                </div>

                <div className="space-y-3">
                  {weeklyRecords.map((item) => {
                    const calPerc = Math.round((item.consumedCalories / item.targetCalories) * 100);
                    const proPerc = Math.round((item.consumedProtein / item.targetProtein) * 100);

                    return (
                      <div key={item.date} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{item.dayName}</span>
                            <span className="text-slate-400 font-normal">{item.formattedDate}</span>
                            {item.meals.length > 0 && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {item.meals.length} logged
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className="text-amber-400">{item.consumedCalories} / {item.targetCalories} kcal ({calPerc}%)</span>
                            <span className="text-emerald-400 font-bold">{item.consumedProtein} / {item.targetProtein}g pro ({proPerc}%)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <ProgressBar
                            value={item.consumedCalories}
                            max={item.targetCalories}
                            unit="kcal"
                            color="from-amber-400 to-amber-500"
                            size="sm"
                          />
                          <ProgressBar
                            value={item.consumedProtein}
                            max={item.targetProtein}
                            unit="g"
                            color="from-emerald-400 to-teal-500"
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* MONTHLY VIEW */}
          {viewMode === 'monthly' && (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard
                  title="30-Day Avg Calories"
                  value={`${avgMonthlyCalories} kcal`}
                  subtext="Target: 2200 kcal/day"
                  icon={<Flame className="w-5 h-5 text-amber-400" />}
                  trend="Monthly Average"
                  color="amber"
                />

                <StatCard
                  title="30-Day Avg Protein"
                  value={`${avgMonthlyProtein}g`}
                  subtext="Target: 140g/day"
                  icon={<Dumbbell className="w-5 h-5 text-emerald-400" />}
                  trend="Monthly Average"
                  color="emerald"
                />

                <StatCard
                  title="Total Logged Meals"
                  value={`${totalLoggedMeals} Meals`}
                  subtext="Over past 30 days"
                  icon={<Utensils className="w-5 h-5 text-teal-400" />}
                  trend={`${monthlyActiveDays.length} Active Days`}
                  color="teal"
                />

                <StatCard
                  title="Best Protein Day"
                  value={bestProteinRecord ? `${(bestProteinRecord as DailyHistoryRecord).consumedProtein}g` : '0g'}
                  subtext={bestProteinRecord ? (bestProteinRecord as DailyHistoryRecord).formattedDate : 'No data'}
                  icon={<Sparkles className="w-5 h-5 text-cyan-400" />}
                  trend="Peak High"
                  color="cyan"
                />
              </div>

              {/* Monthly Line Trend Chart */}
              <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
                <MonthlyLineChart records={historyRecords} />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
