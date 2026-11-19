import { Bell, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { ThemeMode } from '../../hooks/useTheme';
import { formatTanggalHeader } from '../../utils/date';
import { StatusBadge } from '../common/StatusBadge';
import { ThemeToggle } from '../common/ThemeToggle';
import { Breadcrumb } from './Breadcrumb';
import { QuickAddMenu } from './QuickAddMenu';

interface AppHeaderProps {
  pageLabel: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

export function AppHeader({
  pageLabel,
  theme,
  onToggleTheme,
  onOpenSearch,
}: AppHeaderProps) {
  const { notifications, markNotificationRead } = useFincopStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.isRead);
  const today = formatTanggalHeader(new Date());

  useEffect(() => {
    if (!notifOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [notifOpen]);

  return (
    <header className="flex h-12 items-center justify-between gap-4 border-b border-[#E9E9E7] bg-[#FFFFFF] px-5 dark:border-[#343434] dark:bg-[#191919]">
      <div className="flex min-w-0 items-center gap-3">
        <Breadcrumb currentLabel={pageLabel} />
        <span className="hidden text-[12px] text-[#787774] dark:text-[#9B9B9B] xl:inline">
          · {today}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Search Trigger (Ctrl + K) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="inline-flex h-7 items-center gap-2 rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-2.5 text-[12px] text-[#787774] transition-colors hover:bg-[#F5F5F4] hover:text-[#252525] whitespace-nowrap shrink-0 dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B] dark:hover:bg-[#252525] dark:hover:text-[#E6E6E6]"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Cari cepat...</span>
          <kbd className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-1 font-mono text-[10px] text-[#787774] dark:border-[#343434] dark:bg-[#191919] dark:text-[#9B9B9B]">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick Add */}
        <QuickAddMenu />

        {/* Notification Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifikasi"
            className="inline-flex h-7 items-center gap-1.5 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-2 text-[12px] text-[#252525] transition-colors hover:bg-[#F5F5F4] dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
          >
            <Bell className="h-3.5 w-3.5 text-[#787774] dark:text-[#9B9B9B]" />
            {unread.length > 0 ? (
              <span className="font-mono text-[11px] font-semibold text-[#E87932] tabular-nums">
                {unread.length}
              </span>
            ) : null}
          </button>

          {notifOpen ? (
            <div className="absolute right-0 z-40 mt-1.5 w-80 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#202020]">
              <div className="flex items-center justify-between border-b border-[#E9E9E7] px-3 py-2 dark:border-[#343434]">
                <span className="text-[12px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                  Notifikasi ({unread.length} belum dibaca)
                </span>
                <Link
                  to="/notifikasi"
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] font-medium text-[#E87932] hover:underline"
                >
                  Lihat semua
                </Link>
              </div>
              <div className="max-h-72 divide-y divide-[#E9E9E7] overflow-y-auto dark:divide-[#343434]">
                {notifications.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => markNotificationRead(item.id)}
                    className="block w-full px-3 py-2.5 text-left transition-colors hover:bg-[#F5F5F4] dark:hover:bg-[#252525]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-[12px] ${
                          item.isRead
                            ? 'text-[#787774] dark:text-[#9B9B9B]'
                            : 'font-medium text-[#252525] dark:text-[#E6E6E6]'
                        }`}
                      >
                        {item.title}
                      </span>
                      {!item.isRead ? <StatusBadge tone="accent">Baru</StatusBadge> : null}
                    </div>
                    <p className="mt-1 text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                      {item.message}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
