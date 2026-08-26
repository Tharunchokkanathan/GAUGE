import React from 'react';
import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';

interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    primary: 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400',
    secondary: 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700/80',
    outline: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
  };

  const sizeStyles = {
    sm: 'p-1.5 rounded-lg text-xs',
    md: 'p-2.5 rounded-xl text-sm',
    lg: 'p-3.5 rounded-2xl text-base'
  };

  return (
    <motion.button
      whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
      aria-label={label}
      title={label}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  );
};
