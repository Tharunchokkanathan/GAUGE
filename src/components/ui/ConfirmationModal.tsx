import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const iconColor =
    variant === 'danger'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      : variant === 'warning'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#090d1a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconColor}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 flex-1">
              <h3 className="text-lg font-extrabold text-white">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
            </div>

            <button
              onClick={onCancel}
              className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              className={confirmBtnClass}
              icon={<Trash2 className="w-4 h-4" />}
            >
              {confirmLabel}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
