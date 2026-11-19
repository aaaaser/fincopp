interface LoadingStateProps {
  rows?: number;
  label?: string;
}

export function LoadingState({ rows = 4, label = 'Memuat data...' }: LoadingStateProps) {
  return (
    <div
      className="rounded-none border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]"
      aria-busy="true"
      aria-label={label}
    >
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-8 w-full animate-pulse rounded-[2px] bg-[#F5F5F4] dark:bg-[#252525]"
          />
        ))}
      </div>
    </div>
  );
}
