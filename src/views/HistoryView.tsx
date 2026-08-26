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
  Sparkles,
  Target,
  Calendar,
  AlertCircle
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

interface HistoryViewProps {
  onViewMealDetails?: (meal: MealItem) => void;
}

// Generate real empty history structure for 30 days (0 consumed unless logged in Firestore)
const createEmpty30DayHistory = (targetCal: number = 2200, targetPro: number = 140): DailyHistoryRecord[] => {
  const records: DailyHistoryRecord[] = [];
  for (let i = 0; i < 30; i++) {
    const dateKey = getDateKeyForDaysAgo(i);
    const { formattedDate, dayName } = formatReadableDate(dateKey);

    records.push({
      date: dateKey,
      formattedDate: i === 0 ? 'Today' : formattedDate,
      dayName: i === 0 ? 'Today' : dayName,
      consumedCalories: 0,
      targetCalories: targetCal,
      consumedProtein: 0,
      targetProtein: targetPro,
      consumedCarbs: 0,
      targetCarbs: 220,
      consumedFat: 0,
      targetFat: 60,
      consumedFiber: 0,
      targetFiber: 35,
      meals: []
    });
  }
  return records;
};

export const HistoryView: React.FC<HistoryViewProps> = ({ onViewMealDetails }) => {
  const { user, userProfile } = useAuth();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [historyRecords, setHistoryRecords] = useState<DailyHistoryRecord[]>(
    createEmpty30DayHistory(userProfile?.targetCalories, userProfile?.targetProtein)
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0); // 0 = Today

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setIsLoading(true);
      const targetCal = userProfile?.targetCalories || 2200;
      const targetPro = userProfile?.targetProtein || 140;

      if (user?.uid) {
        try {
          const res = await FirestoreUserService.getDailyHistoryRange(user.uid, 30, targetCal, targetPro);
          if (isMounted && res && res.length > 0) {
            setHistoryRecords(res);
          }
        } catch (err) {
          console.warn('Error fetching Firestore history range:', err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        if (isMounted) {
          setHistoryRecords(createEmpty30DayHistory(targetCal, targetPro));
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, userProfile?.targetCalories, userProfile?.targetProtein]);

  // Selected Daily Record
  const currentDailyRecord: DailyHistoryRecord = historyRecords[selectedDayIdx] || historyRecords[0] || {
    date: getTodayDateKey(),
    formattedDate: 'Today',
    dayName: 'Today',
    consumedCalories: 0,
    targetCalories: userProfile?.targetCalories || 2200,
    consumedProtein: 0,
    targetProtein: userProfile?.targetProtein || 140,
    consumedCarbs: 0,
    targetCarbs: 220,
    consumedFat: 0,
    targetFat: 60,
    consumedFiber: 0,
    targetFiber: 35,
    meals: []
  };

  // WEEKLY STATS (Past 7 Days)
  const weeklyRecords = historyRecords.slice(0, 7);
  const avgWeeklyCalories = Math.round(weeklyRecords.reduce((sum, r) => sum + r.consumedCalories, 0) / 7);
  const avgWeeklyProtein = Math.round(weeklyRecords.reduce((sum, r) => sum + r.consumedProtein, 0) / 7);

  // Target consistency (Count of days where calories & protein met >= 80% of target and <= 115% of calorie target)
  const weeklyConsistentDaysCount = weeklyRecords.filter((r) => {
    if (r.consumedCalories === 0 && r.consumedProtein === 0) return false;
    const proteinHit = r.consumedProtein >= r.targetProtein * 0.85;
    const caloriesHit = r.consumedCalories >= r.targetCalories * 0.8 && r.consumedCalories <= r.targetCalories * 1.15;
    return proteinHit || caloriesHit;
  }).length;

  const weeklyConsistencyPct = Math.round((weeklyConsistentDaysCount / 7) * 100);

  // MONTHLY STATS (Past 30 Days)
  const avgMonthlyCalories = Math.round(historyRecords.reduce((sum, r) => sum + r.consumedCalories, 0) / 30);
  const avgMonthlyProtein = Math.round(historyRecords.reduce((sum, r) => sum + r.consumedProtein, 0) / 30);
  const totalLoggedMeals = historyRecords.reduce((sum, r) => sum + r.meals.length, 0);

  // Best Protein Day
  let bestProteinRecord: DailyHistoryRecord | null = null;
  historyRecords.forEach((r) => {
    if (!bestProteinRecord || r.consumedProtein > bestProteinRecord.consumedProtein) {
      bestProteinRecord = r;
    }
  });

  // Most Consistent Days Count & List
  const monthlyConsistentRecords = historyRecords.filter((r) => {
    if (r.consumedCalories === 0 && r.consumedProtein === 0) return false;
    const proteinHit = r.consumedProtein >= r.targetProtein * 0.85;
    const caloriesHit = r.consumedCalories >= r.targetCalories * 0.8 && r.consumedCalories <= r.targetCalories * 1.15;
    return proteinHit && caloriesHit;
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
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === mode.id
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
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
          <p>Loading real nutrition history logs from Firestore...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* ==================== DAILY VIEW ==================== */}
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
                  <div className="text-base sm:text-lg font-extrabold text-white">
                    {currentDailyRecord.formattedDate} <span className="text-xs text-slate-400 font-mono">({currentDailyRecord.date})</span>
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

              {/* Day Macro Progress Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Calories Consumed"
                  value={`${currentDailyRecord.consumedCalories} kcal`}
                  subtext={`Target: ${currentDailyRecord.targetCalories} kcal`}
                  icon={<Flame className="w-5 h-5 text-amber-400" />}
                  trend={`${Math.round((currentDailyRecord.consumedCalories / Math.max(1, currentDailyRecord.targetCalories)) * 100)}% Target`}
                  color="amber"
                />

                <StatCard
                  title="Protein Consumed"
                  value={`${currentDailyRecord.consumedProtein}g`}
                  subtext={`Target: ${currentDailyRecord.targetProtein}g`}
                  icon={<Dumbbell className="w-5 h-5 text-emerald-400" />}
                  trend={`${Math.round((currentDailyRecord.consumedProtein / Math.max(1, currentDailyRecord.targetProtein)) * 100)}% Target`}
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
                  <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                    {currentDailyRecord.meals.length} meal{currentDailyRecord.meals.length !== 1 ? 's' : ''} logged
                  </span>
                </div>

                {currentDailyRecord.meals.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">No meals logged for this date in Firestore.</p>
                    <p className="text-xs text-slate-500">Log meals on the Dashboard or Generator to view them here.</p>
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

          {/* ==================== WEEKLY VIEW ==================== */}
          {viewMode === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Average Calories"
                  value={`${avgWeeklyCalories} kcal/day`}
                  subtext={`Target: ${userProfile?.targetCalories || 2200} kcal`}
                  icon={<Flame className="w-5 h-5 text-amber-400" />}
                  trend="Past 7 Days Avg"
                  color="amber"
                />

                <StatCard
                  title="Average Protein"
                  value={`${avgWeeklyProtein} g/day`}
                  subtext={`Target: ${userProfile?.targetProtein || 140} g`}
                  icon={<Dumbbell className="w-5 h-5 text-emerald-400" />}
                  trend="Past 7 Days Avg"
                  color="emerald"
                />

                <StatCard
                  title="Target Consistency"
                  value={`${weeklyConsistencyPct}%`}
                  subtext={`${weeklyConsistentDaysCount} / 7 Days On Target`}
                  icon={<Award className="w-5 h-5 text-cyan-400" />}
                  trend="Adherence Score"
                  color="cyan"
                />
              </div>

              {/* Weekly Lightweight SVG Bar Chart */}
              <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Past 7 Days Macro Chart
                </h3>
                <WeeklyBarChart records={weeklyRecords} />
              </GlassCard>

              {/* Day-by-Day List Breakdown (Each Day: Calories & Protein) */}
              <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" /> Daily Log Breakdown (Past 7 Days)
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Firestore Stream</span>
                </div>

                <div className="space-y-3">
                  {weeklyRecords.map((item) => {
                    const calPerc = Math.round((item.consumedCalories / Math.max(1, item.targetCalories)) * 100);
                    const proPerc = Math.round((item.consumedProtein / Math.max(1, item.targetProtein)) * 100);

                    return (
                      <div key={item.date} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{item.dayName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{item.formattedDate}</span>
                            {item.meals.length > 0 ? (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-3 h-3" /> {item.meals.length} logged
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded font-mono">
                                No logs
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className="text-amber-400 font-semibold">{item.consumedCalories} / {item.targetCalories} kcal ({calPerc}%)</span>
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

          {/* ==================== MONTHLY VIEW ==================== */}
          {viewMode === 'monthly' && (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Monthly Stat Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  title="Average Calories"
                  value={`${avgMonthlyCalories} kcal`}
                  subtext={`Target: ${userProfile?.targetCalories || 2200} kcal/day`}
                  icon={<Flame className="w-5 h-5 text-amber-400" />}
                  trend="30-Day Average"
                  color="amber"
                />

                <StatCard
                  title="Average Protein"
                  value={`${avgMonthlyProtein}g`}
                  subtext={`Target: ${userProfile?.targetProtein || 140} g/day`}
                  icon={<Dumbbell className="w-5 h-5 text-emerald-400" />}
                  trend="30-Day Average"
                  color="emerald"
                />

                <StatCard
                  title="Total Logged Meals"
                  value={`${totalLoggedMeals}`}
                  subtext="Across 30 days"
                  icon={<Utensils className="w-5 h-5 text-teal-400" />}
                  trend="Total Count"
                  color="teal"
                />

                <StatCard
                  title="Best Protein Day"
                  value={bestProteinRecord ? `${(bestProteinRecord as DailyHistoryRecord).consumedProtein}g` : '0g'}
                  subtext={bestProteinRecord && (bestProteinRecord as DailyHistoryRecord).consumedProtein > 0 ? (bestProteinRecord as DailyHistoryRecord).formattedDate : 'No record'}
                  icon={<Sparkles className="w-5 h-5 text-cyan-400" />}
                  trend="Highest Protein"
                  color="cyan"
                />

                <StatCard
                  title="Most Consistent Days"
                  value={`${monthlyConsistentRecords.length} Days`}
                  subtext="Hit target thresholds"
                  icon={<Target className="w-5 h-5 text-emerald-400" />}
                  trend={`${Math.round((monthlyConsistentRecords.length / 30) * 100)}% Monthly Rate`}
                  color="emerald"
                />
              </div>

              {/* Monthly Line Trend SVG Chart */}
              <GlassCard variant="gradient" className="p-6 space-y-4 border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> 30-Day Nutrition Trend Analytics
                </h3>
                <MonthlyLineChart records={historyRecords} />
              </GlassCard>

              {/* Highlights of Consistent Days */}
              {monthlyConsistentRecords.length > 0 && (
                <GlassCard variant="gradient" className="p-6 space-y-3 border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Consistent Days Showcase
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {monthlyConsistentRecords.map((rec) => (
                      <div
                        key={rec.date}
                        className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2"
                      >
                        <span className="font-bold text-white">{rec.formattedDate}</span>
                        <span>•</span>
                        <span>{rec.consumedCalories} kcal</span>
                        <span>•</span>
                        <span className="font-bold">{rec.consumedProtein}g pro</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default HistoryView;
