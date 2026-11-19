import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  currentLabel: string;
}

export function Breadcrumb({ currentLabel }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
      <Link
        to="/"
        className="text-[#787774] transition-colors hover:text-[#252525] whitespace-nowrap dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]"
      >
        FINCOP
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#787774] dark:text-[#9B9B9B]" />
      <span className="truncate font-medium text-[#252525] dark:text-[#E6E6E6]">
        {currentLabel}
      </span>
    </nav>
  );
}
