import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  helperText?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  label,
  value,
  helperText,
  icon: Icon,
  tone = 'default',
}: StatCardProps) {
  const toneColor =
    tone === 'success'
      ? 'text-[#448361]'
      : tone === 'warning'
        ? 'text-[#CB912F]'
        : tone === 'danger'
          ? 'text-[#D44C47]'
          : 'text-[#E87932]';

  return (
    <div className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]">{label}</p>
        {Icon ? <Icon className={`h-4 w-4 shrink-0 ${toneColor}`} aria-hidden="true" /> : null}
      </div>
      <p className="mt-1.5 truncate text-[20px] font-semibold tracking-tight text-[#252525] tabular-nums dark:text-[#E6E6E6]">
        {value}
      </p>
      {helperText ? (
        <p className="mt-1 truncate text-[12px] text-[#787774] dark:text-[#9B9B9B]">{helperText}</p>
      ) : null}
    </div>
  );
}
