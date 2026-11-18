import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-lg bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="confirm-modal-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
