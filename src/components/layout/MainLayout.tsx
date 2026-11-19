import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { ThemeMode } from '../../hooks/useTheme';
import { Toast } from '../common/Toast';
import { QuickAddModal } from '../forms/QuickAddModal';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { QuickSearchModal, type QuickSearchNavEntry } from './QuickSearchModal';

export const ROUTE_DIRECTORY: QuickSearchNavEntry[] = [
  { path: '/', label: 'Dashboard', group: 'Utama' },
  { path: '/dompet', label: 'Dompet', group: 'Utama' },
  { path: '/pemasukan', label: 'Pemasukan', group: 'Keuangan' },
  { path: '/pengeluaran', label: 'Pengeluaran', group: 'Keuangan' },
  { path: '/transfer', label: 'Transfer Antar-Dompet', group: 'Keuangan' },
  { path: '/utang-piutang', label: 'Utang & Piutang', group: 'Keuangan' },
  { path: '/donasi', label: 'Donasi Live Stream', group: 'Live Stream' },
  { path: '/antrean-mabar', label: 'Antrean Mabar', group: 'Live Stream' },
  { path: '/riwayat-mabar', label: 'Riwayat Mabar', group: 'Live Stream' },
  { path: '/laporan', label: 'Laporan', group: 'Analisis' },
  { path: '/notifikasi', label: 'Notifikasi', group: 'Sistem' },
  { path: '/backup-restore', label: 'Backup & Restore', group: 'Sistem' },
  { path: '/pengaturan', label: 'Pengaturan', group: 'Sistem' },
];

interface MainLayoutProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  children: ReactNode;
}

export function MainLayout({ theme, onToggleTheme, children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const location = useLocation();
  const { toasts, dismissToast } = useFincopStore();

  const currentRoute =
    ROUTE_DIRECTORY.find((r) => r.path === location.pathname) ?? ROUTE_DIRECTORY[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FFFFFF] text-[#252525] dark:bg-[#191919] dark:text-[#E6E6E6]">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          pageLabel={currentRoute.label}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenSearch={() => setQuickSearchOpen(true)}
        />

        {/* Navigasi responsif untuk layar kecil */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#E9E9E7] bg-[#F7F7F5] px-3 py-1.5 dark:border-[#343434] dark:bg-[#202020] md:hidden">
          {ROUTE_DIRECTORY.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `rounded-[2px] px-2.5 py-1 text-[12px] whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#EAEAE7] font-medium text-[#E87932] dark:bg-[#2C2C2C]'
                    : 'text-[#787774] dark:text-[#9B9B9B]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <main className="mx-auto w-full max-w-[1360px] flex-1 px-6 py-6">{children}</main>
      </div>

      <QuickSearchModal
        open={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        navRoutes={ROUTE_DIRECTORY}
      />
      <QuickAddModal />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
