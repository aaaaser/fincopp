import type { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex items-center">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 hidden -translate-x-1/2 rounded-[2px] border border-[#343434] bg-[#252525] px-2 py-1 text-[11px] font-medium text-[#FFFFFF] whitespace-nowrap group-hover:block group-focus-within:block"
      >
        {label}
      </span>
    </span>
  );
}
