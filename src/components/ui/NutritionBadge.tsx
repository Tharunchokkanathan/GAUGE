import React from 'react';

interface NutritionBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'emerald' | 'teal' | 'amber' | 'purple' | 'slate';
  icon?: React.ReactNode;
}

export const NutritionBadge: React.FC<NutritionBadgeProps> = ({
  label,
  value,
  unit,
  variant = 'emerald',
  icon
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    slate: 'bg-slate-800/60 text-slate-300 border-slate-700/60'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border backdrop-blur-md ${variantStyles[variant]}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="opacity-80 font-normal">{label}:</span>
      <span className="font-bold font-mono">
        {value}{unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
};
