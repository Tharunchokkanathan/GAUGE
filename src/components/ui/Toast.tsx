import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

interface ToastProps {
  message: string;
  submessage?: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, submessage, isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50 max-w-sm pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 bg-slate-950/90 shadow-2xl shadow-emerald-500/20 flex items-start gap-3 backdrop-blur-xl">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                {message} <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </h4>
              {submessage && (
                <p className="text-xs text-slate-300 mt-0.5 truncate font-mono">{submessage}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
