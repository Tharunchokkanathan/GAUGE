import React, { useState } from 'react';
import { History, Flame, Dumbbell, TrendingUp, Award } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';

export const HistoryView: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const historyDays = [
    { day: 'Mon', date: 'Aug 20', calories: 2150, protein: 138, targetCalories: 2200, targetProtein: 140 },
    { day: 'Tue', date: 'Aug 21', calories: 2210, protein: 142, targetCalories: 2200, targetProtein: 140 },
    { day: 'Wed', date: 'Aug 22', calories: 2080, protein: 135, targetCalories: 2200, targetProtein: 140 },
    { day: 'Thu', date: 'Aug 23', calories: 2190, protein: 144, targetCalories: 2200, targetProtein: 140 },
    { day: 'Fri', date: 'Aug 24', calories: 2240, protein: 140, targetCalories: 2200, targetProtein: 140 },
    { day: 'Sat', date: 'Aug 25', calories: 2180, protein: 136, targetCalories: 2200, targetProtein: 140 },
    { day: 'Sun', date: 'Aug 26', calories: 1455, protein: 101, targetCalories: 2200, targetProtein: 140 }
  ];

  const avgCalories = Math.round(historyDays.reduce((a, b) => a + b.calories, 0) / historyDays.length);
  const avgProtein = Math.round(historyDays.reduce((a, b) => a + b.protein, 0) / historyDays.length);

  return (
    <div className="space-y-6 pb-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-8 h-8 text-emerald-400" /> Nutrition History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your weekly consistency and macro adherence over time.
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === 'week' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === 'month' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Trends
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Avg Daily Calories"
          value={`${avgCalories} kcal`}
          subtext="Target: 2200 kcal/day"
          icon={<Flame className="w-5 h-5 text-amber-400" />}
          trend="98% Adherence"
          color="amber"
        />

        <StatCard
          title="Avg Daily Protein"
          value={`${avgProtein}g`}
          subtext="Target: 140g/day"
          icon={<Dumbbell className="w-5 h-5 text-emerald-400" />}
          trend="97% Target"
          color="emerald"
        />

        <StatCard
          title="Consistency Streak"
          value="6 Days"
          subtext="Target hit continuously"
          icon={<Award className="w-5 h-5 text-cyan-400" />}
          trend="🔥 Active"
          color="cyan"
        />
      </div>

      {/* Weekly History Chart / Bars */}
      <GlassCard variant="gradient" className="p-6 space-y-6 border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Daily Protein & Calorie Consistency
          </h2>
          <span className="text-xs text-slate-400 font-mono">Last 7 Days</span>
        </div>

        <div className="space-y-4">
          {historyDays.map((item, idx) => {
            const calPerc = Math.round((item.calories / item.targetCalories) * 100);
            const proPerc = Math.round((item.protein / item.targetProtein) * 100);

            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{item.day}</span>
                    <span className="text-slate-500 font-normal">{item.date}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-amber-400">{item.calories} / {item.targetCalories} kcal ({calPerc}%)</span>
                    <span className="text-emerald-400 font-bold">{item.protein} / {item.targetProtein}g protein ({proPerc}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ProgressBar
                    value={item.calories}
                    max={item.targetCalories}
                    unit="kcal"
                    color="from-amber-400 to-amber-500"
                    size="sm"
                  />
                  <ProgressBar
                    value={item.protein}
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
    </div>
  );
};
