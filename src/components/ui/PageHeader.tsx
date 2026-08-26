import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
