import React from 'react';
import { AlertTriangle, Trash2, RotateCcw, AlertCircle, Info, X } from 'lucide-react';

export type ModalVariant = 'danger' | 'warning' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  icon?: 'trash' | 'reset' | 'alert' | 'info';
  isAlertOnly?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'alert',
  isAlertOnly = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case 'trash':
        return <Trash2 className="w-5 h-5 text-rose-500" />;
      case 'reset':
        return <RotateCcw className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'alert':
      default:
        return variant === 'danger' ? (
          <AlertTriangle className="w-5 h-5 text-rose-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-500" />
        );
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30';
      case 'info':
      default:
        return 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-white/[0.08] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/70 flex flex-col animate-in zoom-in-95 duration-150">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-sm ${getIconBg()}`}>
              {getIcon()}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-end gap-2.5">
          {!isAlertOnly && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${getConfirmButtonClasses()}`}
          >
            {isAlertOnly ? 'Got it' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
