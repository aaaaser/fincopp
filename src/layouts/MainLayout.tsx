import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarClock,
  ChevronRight,
  Gift,
  HandCoins,
  LayoutDashboard,
  ListOrdered,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  User,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { ThemeMode } from '../hooks/useTheme';
import type { NavSectionId } from '../types/system';
import { formatTanggalHeader } from '../utils/date';
import { Dropdown } from '../components/ui/Dropdown';
import { Tooltip } from '../components/ui/Tooltip';
import { Badge } from '../components/ui/Badge';

interface NavItem {
  id: NavSectionId;
  label: string;
  icon: typeof LayoutDashboard;
}

export const FINCOP_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallets', label: 'Dompet', icon: WalletCards },
  { id: 'incomes', label: 'Pemasukan', icon: ArrowDownLeft },
  { id: 'expenses', label: 'Pengeluaran', icon: ArrowUpRight },
  { id: 'recurring-expenses', label: 'Pengeluaran rutin', icon: CalendarClock },
  { id: 'debts', label: 'Utang dan piutang', icon: HandCoins },
  { id: 'donations', label: 'Donasi live stream', icon: Gift },
  { id: 'queue', label: 'Antrean mabar', icon: ListOrdered },
  { id: 'reports', label: 'Laporan', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export interface HeaderNotificationItem {
  id: string;
  title: string;
  detail: string;
  tone: 'warning' | 'success' | 'neutral';
}

interface MainLayoutProps {
  activeSection: NavSectionId;
  onSelectSection: (section: NavSectionId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  notifications: HeaderNotificationItem[];
  children: ReactNode;
}

export function MainLayout({
  activeSection,
  onSelectSection,
  theme,
  onToggleTheme,
  globalSearch,
  onGlobalSearchChange,
  notifications,
  children,
}: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const todayFormatted = formatTanggalHeader(new Date());
  const currentItem =
    FINCOP_NAV_ITEMS.find((item) => item.id === activeSection) ?? FINCOP_NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-[#FFFFFF] text-[#252525] dark:bg-[#191919] dark:text-[#E6E6E6]">
      {/* Sidebar Permanen Kiri (0px Radius, Notion-style) */}
      <aside
        className={`hidden shrink-0 flex-col rounded-none border-r border-[#E9E9E7] bg-[#F7F7F5] transition-[width] duration-150 dark:border-[#343434] dark:bg-[#202020] md:flex ${
          sidebarCollapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      >
        {/* Logo FINCOP */}
        <div className="flex h-12 items-center justify-between border-b border-[#E9E9E7] px-3 dark:border-[#343434]">
          <button
            type="button"
            onClick={() => onSelectSection('dashboard')}
            className="flex min-w-0 items-center gap-2.5 text-left"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] bg-[#E87932] text-white">
              <Wallet className="h-4 w-4" aria-hidden="true" />
            </div>
            {!sidebarCollapsed ? (
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold tracking-tight text-[#252525] dark:text-[#E6E6E6]">
                  FINCOP
                </p>
                <p className="truncate text-[10px] font-medium text-[#787774] dark:text-[#9B9B9B]">
                  Finansial Ucopp
                </p>
              </div>
            ) : null}
          </button>
        </div>

        {/* Daftar Menu */}
        <nav className="flex-1 space-y-0.5 px-2 py-3" aria-label="Menu utama FINCOP">
          {FINCOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeSection;
            const button = (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-[2px] px-2.5 py-1.5 text-left text-[13px] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#EAEAE7] font-medium text-[#252525] dark:bg-[#2C2C2C] dark:text-[#E6E6E6]'
                    : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:bg-[#262626] dark:hover:text-[#E6E6E6]'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-[#E87932]' : 'text-[#787774] dark:text-[#9B9B9B]'
                  }`}
                  aria-hidden="true"
                />
                {!sidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
              </button>
            );

            return sidebarCollapsed ? (
              <Tooltip key={item.id} label={item.label}>
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </nav>

        {!sidebarCollapsed ? (
          <div className="border-t border-[#E9E9E7] px-3 py-3 text-[12px] text-[#787774] dark:border-[#343434] dark:text-[#9B9B9B]">
            <p className="truncate font-medium text-[#252525] dark:text-[#E6E6E6]">
              Personal Finance
            </p>
            <p className="mt-0.5 truncate">Lokal · IDR (Rupiah)</p>
          </div>
        ) : null}
      </aside>

      {/* Workspace Sebelah Kanan */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header: Toggle + Breadcrumb + Search + Notification + Profile */}
        <header className="flex h-12 items-center justify-between gap-4 border-b border-[#E9E9E7] bg-[#FFFFFF] px-4 dark:border-[#343434] dark:bg-[#191919]">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
              className="hidden h-7 w-7 items-center justify-center rounded-[2px] text-[#787774] transition-colors hover:bg-[#F5F5F4] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:bg-[#252525] dark:hover:text-[#E6E6E6] md:inline-flex"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
              <button
                type="button"
                onClick={() => onSelectSection('dashboard')}
                className="text-[#787774] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]"
              >
                FINCOP
              </button>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#787774] dark:text-[#9B9B9B]" />
              <span className="truncate font-medium text-[#252525] dark:text-[#E6E6E6]">
                {currentItem.label}
              </span>
              <span className="hidden text-[12px] text-[#787774] dark:text-[#9B9B9B] xl:inline">
                · {todayFormatted}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#787774] dark:text-[#9B9B9B]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
                placeholder="Cari di workspace..."
                aria-label="Cari di workspace"
                className="h-7 w-44 rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] pl-8 pr-2.5 text-[12px] text-[#252525] placeholder:text-[#787774] focus:w-56 focus:border-[#E87932] focus:bg-[#FFFFFF] focus:outline-none transition-[width] dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:placeholder:text-[#9B9B9B] dark:focus:bg-[#191919]"
              />
            </div>

            {/* Notification Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifikasi"
                className="relative inline-flex h-7 items-center gap-1.5 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-2 text-[12px] text-[#252525] transition-colors hover:bg-[#F5F5F4] dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
              >
                <Bell className="h-3.5 w-3.5 text-[#787774] dark:text-[#9B9B9B]" />
                {notifications.length > 0 ? (
                  <span className="font-mono text-[11px] font-medium text-[#E87932] tabular-nums">
                    {notifications.length}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 z-40 mt-1.5 w-80 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#202020]">
                  <div className="flex items-center justify-between border-b border-[#E9E9E7] px-3 py-2 dark:border-[#343434]">
                    <span className="text-[12px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                      Notifikasi Sistem
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] text-[#787774] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
                    {notifications.map((item) => (
                      <div key={item.id} className="px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-medium text-[#252525] dark:text-[#E6E6E6]">
                            {item.title}
                          </span>
                          <Badge tone={item.tone}>
                            {item.tone === 'success'
                              ? 'Aktif'
                              : item.tone === 'warning'
                                ? 'Perhatian'
                                : 'Info'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                    {notifications.length === 0 ? (
                      <p className="px-3 py-4 text-center text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                        Tidak ada notifikasi baru.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Profile & Theme Switcher Dropdown */}
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] px-2.5 text-[12px] font-medium text-[#252525] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0 dark:border-[#343434] dark:bg-[#202020] dark:text-[#E6E6E6] dark:hover:bg-[#252525]"
                >
                  <User className="h-3.5 w-3.5 text-[#E87932]" aria-hidden="true" />
                  <span>Ucopp</span>
                </button>
              }
              items={[
                {
                  id: 'toggle-theme',
                  label: theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode',
                  icon: theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />,
                  onSelect: onToggleTheme,
                },
                {
                  id: 'open-settings',
                  label: 'Pengaturan & Database',
                  icon: <Settings className="h-3.5 w-3.5" />,
                  onSelect: () => onSelectSection('settings'),
                },
              ]}
            />
          </div>
        </header>

        {/* Navigasi Mobile / Layar Kecil */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#E9E9E7] bg-[#F7F7F5] px-3 py-1.5 dark:border-[#343434] dark:bg-[#202020] md:hidden">
          {FINCOP_NAV_ITEMS.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`rounded-[2px] px-2.5 py-1 text-[12px] whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#EAEAE7] font-medium text-[#252525] dark:bg-[#2C2C2C] dark:text-[#E6E6E6]'
                    : 'text-[#787774] dark:text-[#9B9B9B]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Area Konten Utama */}
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-7">{children}</main>
      </div>
    </div>
  );
}
