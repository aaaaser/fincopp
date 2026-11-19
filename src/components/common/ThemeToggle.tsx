import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../../hooks/useTheme';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode'}
      title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      className="inline-flex h-7 items-center gap-1.5 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-2 text-[12px] font-medium text-[#252525] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0 dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
    >
      {theme === 'dark' ? (
        <Sun className="h-3.5 w-3.5 text-[#E87932]" aria-hidden="true" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-[#787774]" aria-hidden="true" />
      )}
      <span className="hidden md:inline">{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
    </button>
  );
}
