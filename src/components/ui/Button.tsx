import React from 'react';
import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 border border-emerald-400/40 text-slate-950',
    secondary:
      'bg-slate-800/80 text-slate-100 hover:bg-slate-700/80 border border-slate-700/80 shadow-md',
    outline:
      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50',
    ghost:
      'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
    danger:
      'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5 font-extrabold'
  };

  return (
    <motion.button
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center justify-center transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </motion.button>
  );
};
