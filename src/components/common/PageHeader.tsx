import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-[#E9E9E7] pb-4 dark:border-[#343434] sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#252525] dark:text-[#E6E6E6]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-[#787774] dark:text-[#9B9B9B]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
