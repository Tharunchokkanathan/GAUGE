import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'gradient' | 'interactive';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card',
    subtle: 'glass-panel-subtle',
    gradient: 'bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 shadow-xl',
    interactive: 'glass-card hover:border-emerald-500/40 hover:shadow-emerald-500/10 cursor-pointer active:scale-[0.99]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`rounded-2xl p-4 sm:p-5 relative overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
