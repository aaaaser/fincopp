import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface FormModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function FormModal({
  open,
  title,
  subtitle,
  size = 'md',
  onClose,
  children,
  footer,
}: FormModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxW} flex-col rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] text-[#252525] dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E9E9E7] px-5 py-3.5 dark:border-[#343434]">
          <div className="min-w-0">
            <h3
              id="form-modal-title"
              className="text-[16px] font-semibold text-[#252525] dark:text-[#E6E6E6]"
            >
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-[12px] text-[#787774] dark:text-[#9B9B9B]">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="rounded-[2px] p-1 text-[#787774] transition-colors hover:bg-[#F5F5F4] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:bg-[#252525] dark:hover:text-[#E6E6E6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-[#E9E9E7] bg-[#F7F7F5] px-5 py-3 dark:border-[#343434] dark:bg-[#191919]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
