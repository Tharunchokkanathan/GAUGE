import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  unit?: string;
  color?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  unit = 'g',
  color = 'from-emerald-400 to-teal-500',
  showPercentage = false,
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || max) && (
        <div className="flex justify-between items-center text-xs font-semibold">
          {label && <span className="text-slate-300">{label}</span>}
          <span className="text-slate-400 font-mono">
            <span className="text-white">{value}</span> / {max} {unit}
            {showPercentage && <span className="text-emerald-400 ml-1.5">({Math.round(percentage)}%)</span>}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/60 p-0.5 ${heightStyles[size]}`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
