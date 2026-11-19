import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastMessage } from '../../hooks/useFincopStore';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info;
        const iconColor =
          toast.type === 'success'
            ? 'text-[#448361]'
            : toast.type === 'error'
              ? 'text-[#D44C47]'
              : 'text-[#E87932]';

        return (
          <div
            key={toast.id}
            className="flex items-start gap-2.5 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-3.5 py-3 dark:border-[#343434] dark:bg-[#202020]"
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#252525] dark:text-[#E6E6E6]">
                {toast.title}
              </p>
              {toast.message ? (
                <p className="mt-0.5 text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                  {toast.message}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup toast"
              className="rounded-[2px] p-1 text-[#787774] transition-colors hover:bg-[#F5F5F4] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:bg-[#252525] dark:hover:text-[#E6E6E6]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
