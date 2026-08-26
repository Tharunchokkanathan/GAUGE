import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'line' | 'avatar';
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  type = 'card',
  className = ''
}) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((_, i) => (
          <div key={i} className="glass-panel-subtle rounded-2xl p-5 space-y-4 animate-pulse">
            <div className="h-40 bg-slate-800/80 rounded-xl" />
            <div className="h-5 bg-slate-800/80 rounded w-3/4" />
            <div className="h-4 bg-slate-800/50 rounded w-1/2" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-slate-800/80 rounded-lg flex-1" />
              <div className="h-8 bg-slate-800/80 rounded-lg flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-slate-800/80 rounded-md animate-pulse w-full" />
      ))}
    </div>
  );
};
