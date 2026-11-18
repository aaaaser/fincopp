import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  helperText?: string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  label,
  value,
  helperText,
  icon: Icon,
  tone = 'default',
}: StatCardProps) {
  const toneText =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : tone === 'danger'
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-orange-600 dark:text-orange-400';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-slate-100">
            {value}
          </p>
          {helperText ? (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
          ) : null}
        </div>
        <div className={`shrink-0 rounded-lg bg-slate-100 p-2.5 dark:bg-slate-800 ${toneText}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
