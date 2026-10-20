import React from 'react';
import { useToastStore } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 end-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#0B0B0B] text-white rounded-[20px] p-3.5 shadow-2xl border border-white/10 flex items-start gap-3 animate-slide-in-end transition-all"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#D6F25C]" />}
              {isError && <AlertCircle className="w-4 h-4 text-[#F0625D]" />}
              {isWarning && <AlertCircle className="w-4 h-4 text-[#7DD3EA]" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-[#A99BF2]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-[#8A8A8A] mt-0.5 leading-normal">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8A8A8A] hover:text-white transition-colors p-1"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
