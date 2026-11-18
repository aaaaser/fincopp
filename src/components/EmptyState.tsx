import type { LucideIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-6 py-12 text-center dark:border-[#343434] dark:bg-[#202020]">
      <Icon className="h-6 w-6 text-[#787774] dark:text-[#9B9B9B]" aria-hidden="true" />
      <h3 className="mt-3 text-[16px] font-semibold text-[#252525] dark:text-[#E6E6E6]">{title}</h3>
      <p className="mt-1.5 max-w-md text-[14px] text-[#787774] dark:text-[#9B9B9B]">
        {description}
      </p>
      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
