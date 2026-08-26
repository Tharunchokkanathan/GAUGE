import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { DailyHistoryRecord } from '../../types';

interface MonthlyLineChartProps {
  records: DailyHistoryRecord[]; // Expected up to 30 records
}

export const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ records }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!records || records.length === 0) {
    return <div className="text-xs text-slate-500 py-8 text-center">No monthly history available.</div>;
  }

  // Reverse so left to right is past to present
  const data = [...records].reverse();
  const count = data.length;

  const maxCal = Math.max(...data.map((d) => Math.max(d.consumedCalories, d.targetCalories)), 2500);
  const maxPro = Math.max(...data.map((d) => Math.max(d.consumedProtein, d.targetProtein)), 160);

  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 30;
  const paddingY = 25;

  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  // Compute SVG Points
  const calPoints = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, count - 1)) * usableWidth;
    const y = svgHeight - paddingY - (item.consumedCalories / maxCal) * usableHeight;
    return { x, y, item };
  });

  const proPoints = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, count - 1)) * usableWidth;
    const y = svgHeight - paddingY - (item.consumedProtein / maxPro) * usableHeight;
    return { x, y, item };
  });

  // Polyline string generators
  const calPath = calPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const proPath = proPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const calArea = `${calPath} L ${calPoints[calPoints.length - 1].x},${svgHeight - paddingY} L ${calPoints[0].x},${svgHeight - paddingY} Z`;
  const proArea = `${proPath} L ${proPoints[proPoints.length - 1].x},${svgHeight - paddingY} L ${proPoints[0].x},${svgHeight - paddingY} Z`;

  const activeRecord = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="space-y-4">
      {/* Chart Legend */}
      <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded bg-amber-400" />
            <span className="text-slate-300">Calories (kcal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded bg-emerald-400" />
            <span className="text-slate-300">Protein (g)</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">Past 30 Days Trend</span>
      </div>

      {/* SVG Chart Frame */}
      <div className="relative w-full bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
        {/* Hover Tooltip Overlay */}
        {activeRecord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-3 right-4 bg-slate-950/90 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs font-mono shadow-xl backdrop-blur-md z-20 flex items-center gap-3"
          >
            <span className="text-white font-bold">{activeRecord.formattedDate}</span>
            <span className="text-amber-400 font-bold">{activeRecord.consumedCalories} kcal</span>
            <span className="text-emerald-400 font-bold">{activeRecord.consumedProtein}g pro</span>
            <span className="text-slate-400">({activeRecord.meals.length} meals)</span>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[500px]"
          >
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#334155" strokeOpacity="0.8" />

            {/* Filled Areas */}
            <path d={calArea} fill="url(#calGrad)" />
            <path d={proArea} fill="url(#proGrad)" />

            {/* Lines */}
            <path d={calPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <path d={proPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

            {/* Interactive Data Dots */}
            {data.map((item, idx) => {
              const cp = calPoints[idx];
              const pp = proPoints[idx];
              const isHovered = hoveredIdx === idx;

              return (
                <g key={item.date} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
                  {/* Vertical Guide Line */}
                  {isHovered && (
                    <line
                      x1={cp.x}
                      y1={paddingY}
                      x2={cp.x}
                      y2={svgHeight - paddingY}
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Calorie Dot */}
                  <circle
                    cx={cp.x}
                    cy={cp.y}
                    r={isHovered ? 5 : 3}
                    fill="#f59e0b"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="transition-all"
                  />

                  {/* Protein Dot */}
                  <circle
                    cx={pp.x}
                    cy={pp.y}
                    r={isHovered ? 5 : 3}
                    fill="#10b981"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="transition-all"
                  />

                  {/* Invisible Hit Target */}
                  <rect
                    x={cp.x - usableWidth / (count * 2)}
                    y={paddingY}
                    width={usableWidth / count}
                    height={usableHeight}
                    fill="transparent"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Date Labels under Chart */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/80 px-2">
          <span>{data[0]?.formattedDate}</span>
          <span>{data[Math.floor(data.length / 2)]?.formattedDate}</span>
          <span>{data[data.length - 1]?.formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
