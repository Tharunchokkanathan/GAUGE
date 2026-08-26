import React from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'emerald' | 'teal' | 'cyan' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  color = 'emerald'
}) => {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  return (
    <GlassCard variant="gradient" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{value}</div>
        {trend && <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{trend}</span>}
      </div>

      {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
    </GlassCard>
  );
};
