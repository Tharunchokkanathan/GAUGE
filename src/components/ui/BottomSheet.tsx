import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'sheet-title' : undefined}
        >
          {/* Backdrop Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Sheet Surface */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-lg glass-panel border-t border-x border-slate-800 bg-slate-950/95 rounded-t-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Drag Pill Visual Indicator */}
            <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto opacity-60" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              {title ? (
                <h3 id="sheet-title" className="text-lg font-bold text-white tracking-tight">
                  {title}
                </h3>
              ) : <div />}

              <IconButton
                icon={<X className="w-5 h-5" />}
                onClick={onClose}
                label="Close bottom sheet"
                variant="ghost"
                size="sm"
              />
            </div>

            {/* Body */}
            <div className="space-y-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
