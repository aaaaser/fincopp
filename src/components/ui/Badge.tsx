import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  const toneClass =
    tone === 'success'
      ? 'bg-[#448361]/12 text-[#448361] dark:bg-[#448361]/20 dark:text-[#6db58d]'
      : tone === 'danger'
        ? 'bg-[#D44C47]/12 text-[#D44C47] dark:bg-[#D44C47]/20 dark:text-[#ea7873]'
        : tone === 'warning'
          ? 'bg-[#CB912F]/12 text-[#9a6b1b] dark:bg-[#CB912F]/20 dark:text-[#e2b15a]'
          : tone === 'accent'
            ? 'bg-[#E87932]/12 text-[#c95d19] dark:bg-[#E87932]/20 dark:text-[#f09356]'
            : 'bg-[#F5F5F4] text-[#787774] dark:bg-[#252525] dark:text-[#9B9B9B]';

  return (
    <span
      className={`inline-flex items-center rounded-[2px] px-1.5 py-0.5 text-[12px] font-medium leading-tight whitespace-nowrap shrink-0 ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
