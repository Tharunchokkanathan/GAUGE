import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // in seconds
  formatter?: (val: number) => string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 0.6,
  formatter = (v) => Math.round(v).toLocaleString(),
  className = ''
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const change = value - startValue;

    if (change === 0) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + change * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, shouldReduceMotion]);

  return <span className={className}>{formatter(displayValue)}</span>;
};
