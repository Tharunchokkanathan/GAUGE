import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { DailyHistoryRecord } from '../../types';

interface WeeklyBarChartProps {
  records: DailyHistoryRecord[]; // Expected 7 records
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ records }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!records || records.length === 0) {
    return <div className="text-xs text-slate-500 py-8 text-center">No history data available.</div>;
  }

  // Reverse so chronological left to right (oldest to newest)
  const displayRecords = [...records].reverse().slice(-7);

  const maxCal = Math.max(...displayRecords.map((r) => Math.max(r.consumedCalories, r.targetCalories)), 2500);
  const maxPro = Math.max(...displayRecords.map((r) => Math.max(r.consumedProtein, r.targetProtein)), 160);

  return (
    <div className="space-y-4">
      {/* Chart Legend */}
      <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-slate-300">Calories (kcal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-slate-300">Protein (g)</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">Past 7 Days</span>
      </div>

      {/* SVG Bar Chart Container */}
      <div className="relative w-full h-64 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
        {/* Horizontal Grid lines */}
        <div className="absolute inset-x-4 inset-y-8 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
        </div>

        {/* Bars Grid */}
        <div className="relative z-10 flex-1 flex items-end justify-around gap-2 pt-6 pb-2">
          {displayRecords.map((item, idx) => {
            const calHeightPct = Math.min(100, Math.round((item.consumedCalories / maxCal) * 100));
            const proHeightPct = Math.min(100, Math.round((item.consumedProtein / maxPro) * 100));
            const isHovered = activeIdx === idx;

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 bg-slate-950 border border-emerald-500/40 rounded-xl px-2.5 py-1 text-[10px] font-mono shadow-xl z-30 pointer-events-none whitespace-nowrap"
                  >
                    <span className="text-amber-400 font-bold">{item.consumedCalories} kcal</span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-emerald-400 font-bold">{item.consumedProtein}g pro</span>
                  </motion.div>
                )}

                {/* Bars Pair */}
                <div className="flex items-end gap-1.5 w-full justify-center h-full">
                  {/* Calorie Bar */}
                  <div className="w-3 sm:w-4 bg-slate-800/80 rounded-t-md h-full flex flex-col justify-end overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${calHeightPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className={`w-full rounded-t-md transition-colors ${
                        isHovered ? 'bg-amber-300 shadow-lg shadow-amber-400/30' : 'bg-amber-400/90'
                      }`}
                    />
                  </div>

                  {/* Protein Bar */}
                  <div className="w-3 sm:w-4 bg-slate-800/80 rounded-t-md h-full flex flex-col justify-end overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${proHeightPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 + 0.1 }}
                      className={`w-full rounded-t-md transition-colors ${
                        isHovered ? 'bg-emerald-300 shadow-lg shadow-emerald-400/30' : 'bg-emerald-400/90'
                      }`}
                    />
                  </div>
                </div>

                {/* Day Labels */}
                <div className="mt-2 text-center">
                  <span className={`text-[11px] font-bold block ${isHovered ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {item.dayName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {item.formattedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
