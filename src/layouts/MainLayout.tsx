import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Cpu,
  Gift,
  HandCoins,
  HardDriveDownload,
  LayoutDashboard,
  ListOrdered,
  Moon,
  Sun,
  Wallet,
  WalletCards,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { ThemeMode } from '../hooks/useTheme';
import type { NavSectionId } from '../types/system';
import { formatTanggalHeader } from '../utils/date';

interface NavItem {
  id: NavSectionId;
  label: string;
  stageNote?: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'stage1-setup', label: 'Fondasi & Ledger', icon: Cpu },
  { id: 'wallets', label: 'Multi-Dompet', stageNote: 'Fase 3', icon: WalletCards },
  { id: 'dashboard', label: 'Dashboard', stageNote: 'Fase 4', icon: LayoutDashboard },
  { id: 'incomes', label: 'Pemasukan', stageNote: 'Fase 4', icon: ArrowDownLeft },
  { id: 'expenses', label: 'Pengeluaran & Tagihan', stageNote: 'Fase 5', icon: ArrowUpRight },
  { id: 'debts', label: 'Utang & Piutang', stageNote: 'Fase 6', icon: HandCoins },
  { id: 'donations', label: 'Donasi Live Stream', stageNote: 'Fase 7', icon: Gift },
  { id: 'queue', label: 'Antrean Mabar', stageNote: 'Fase 8', icon: ListOrdered },
  { id: 'reports', label: 'Laporan & Ekspor', stageNote: 'Fase 9', icon: BarChart3 },
  { id: 'notifications', label: 'Notifikasi', stageNote: 'Fase 10', icon: Bell },
  { id: 'backup', label: 'Backup & Restore', stageNote: 'Fase 11', icon: HardDriveDownload },
];

interface MainLayoutProps {
  activeSection: NavSectionId;
  onSelectSection: (section: NavSectionId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  children: ReactNode;
}

export function MainLayout({
  activeSection,
  onSelectSection,
  theme,
  onToggleTheme,
  children,
}: MainLayoutProps) {
  const todayFormatted = formatTanggalHeader(new Date());
  const currentItem = NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigasi Kiri */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              FINCOP
            </p>
            <p className="truncate text-[11px] font-semibold tracking-wider text-orange-600 dark:text-orange-400">
              FINANSIAL UCOPP
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Menu utama FINCOP">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.stageNote ? (
                  <span
                    className={`shrink-0 text-[11px] ${
                      isActive ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.stageNote}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-300">Aplikasi Keuangan Lokal</p>
          <p className="mt-0.5">Mata Uang: Rupiah (IDR)</p>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
              {currentItem.label}
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              FINCOP — Finansial Ucopp · {todayFormatted}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-orange-400" aria-hidden="true" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <span>Mode Gelap</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Navigasi Mobile / Layar Kecil */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <main className="mx-auto w-full max-w-[1320px] flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
