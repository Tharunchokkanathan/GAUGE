import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, routeKey }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div key={routeKey}>{children}</div>;
  }

  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1.0] }}
    >
      {children}
    </motion.div>
  );
};
