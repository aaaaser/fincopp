import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info;
        const iconTone =
          toast.type === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : toast.type === 'error'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-orange-600 dark:text-orange-400';

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconTone}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </p>
              {toast.message ? (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{toast.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
