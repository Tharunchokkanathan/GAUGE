import React from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <GlassCard variant="subtle" className="text-center py-10 px-6 border-dashed border-slate-800 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
        {icon}
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </GlassCard>
  );
};
