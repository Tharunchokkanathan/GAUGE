import { motion, useReducedMotion } from 'framer-motion';

export const LiquidBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/10 -top-32 -left-32 blur-3xl opacity-60" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-teal-500/08 bottom-10 -right-20 blur-3xl opacity-60" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 will-change-transform" aria-hidden="true">
      {/* Liquid Organic Shape 1 - Emerald */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.08, 0.95, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 -top-40 -left-40 blur-3xl opacity-70"
      />

      {/* Liquid Organic Shape 2 - Cyan / Teal */}
      <motion.div
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 35, -30, 0],
          scale: [1, 0.94, 1.1, 1]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10 bottom-0 -right-32 blur-3xl opacity-65"
      />

      {/* Liquid Organic Shape 3 - Amber Glow */}
      <motion.div
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.05, 0.98, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-r from-amber-500/08 to-emerald-500/08 top-1/3 left-1/2 -translate-x-1/2 blur-3xl opacity-50"
      />
    </div>
  );
};
