import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Gift,
  HandCoins,
  HardDriveDownload,
  History,
  LayoutDashboard,
  ListOrdered,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useFincopStore } from '../../hooks/useFincopStore';

export interface SidebarNavGroup {
  groupLabel: string;
  items: Array<{
    path: string;
    label: string;
    icon: typeof LayoutDashboard;
    badgeCount?: number;
  }>;
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const { notifications, sortedActiveQueue } = useFincopStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const activeQueueCount = sortedActiveQueue.length;

  const groups: SidebarNavGroup[] = [
    {
      groupLabel: 'Utama',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dompet', label: 'Dompet', icon: WalletCards },
      ],
    },
    {
      groupLabel: 'Keuangan',
      items: [
        { path: '/pemasukan', label: 'Pemasukan', icon: ArrowDownLeft },
        { path: '/pengeluaran', label: 'Pengeluaran', icon: ArrowUpRight },
        { path: '/transfer', label: 'Transfer Dompet', icon: ArrowLeftRight },
        { path: '/utang-piutang', label: 'Utang & Piutang', icon: HandCoins },
      ],
    },
    {
      groupLabel: 'Live Stream & Mabar',
      items: [
        { path: '/donasi', label: 'Donasi Live Stream', icon: Gift },
        {
          path: '/antrean-mabar',
          label: 'Antrean Mabar',
          icon: ListOrdered,
          badgeCount: activeQueueCount,
        },
        { path: '/riwayat-mabar', label: 'Riwayat Mabar', icon: History },
      ],
    },
    {
      groupLabel: 'Analisis & Sistem',
      items: [
        { path: '/laporan', label: 'Laporan', icon: BarChart3 },
        {
          path: '/notifikasi',
          label: 'Notifikasi',
          icon: Bell,
          badgeCount: unreadCount,
        },
        { path: '/backup-restore', label: 'Backup & Restore', icon: HardDriveDownload },
      ],
    },
  ];

  return (
    <aside
      className={`hidden shrink-0 flex-col rounded-none border-r border-[#E9E9E7] bg-[#F7F7F5] transition-[width] duration-150 dark:border-[#343434] dark:bg-[#202020] md:flex ${
        collapsed ? 'w-[60px]' : 'w-[244px]'
      }`}
    >
      {/* Brand FINCOP */}
      <div className="flex h-12 items-center justify-between border-b border-[#E9E9E7] px-3 dark:border-[#343434]">
        <NavLink to="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] bg-[#E87932] text-white">
            <Wallet className="h-4 w-4" aria-hidden="true" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight text-[#252525] dark:text-[#E6E6E6]">
                FINCOP
              </p>
              <p className="truncate text-[11px] text-[#787774] dark:text-[#9B9B9B]">
                Finansial Ucopp
              </p>
            </div>
          ) : null}
        </NavLink>

        {!collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Ciutkan sidebar"
            title="Ciutkan sidebar"
            className="rounded-[2px] p-1 text-[#787774] transition-colors hover:bg-[#EAEAE7] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:bg-[#2C2C2C] dark:hover:text-[#E6E6E6]"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="flex justify-center border-b border-[#E9E9E7] py-1.5 dark:border-[#343434]">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Perluas sidebar"
            title="Perluas sidebar"
            className="rounded-[2px] p-1.5 text-[#787774] hover:bg-[#EAEAE7] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:bg-[#2C2C2C] dark:hover:text-[#E6E6E6]"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Grouped Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3" aria-label="Menu utama FINCOP">
        {groups.map((group) => (
          <div key={group.groupLabel}>
            {!collapsed ? (
              <p className="mb-1 px-2.5 text-[11px] font-medium text-[#787774] dark:text-[#9B9B9B]">
                {group.groupLabel}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2 rounded-[2px] px-2.5 py-1.5 text-[13px] transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-[#EAEAE7] font-medium text-[#E87932] dark:bg-[#2C2C2C]'
                          : 'text-[#252525]/85 hover:bg-[#EFEFED] hover:text-[#252525] dark:text-[#E6E6E6]/80 dark:hover:bg-[#262626] dark:hover:text-[#E6E6E6]'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive
                                ? 'text-[#E87932]'
                                : 'text-[#787774] dark:text-[#9B9B9B]'
                            }`}
                            aria-hidden="true"
                          />
                          {!collapsed ? <span className="truncate">{item.label}</span> : null}
                        </span>
                        {!collapsed && item.badgeCount && item.badgeCount > 0 ? (
                          <span className="font-mono text-[11px] text-[#E87932] tabular-nums">
                            {item.badgeCount}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Pengaturan & Versi Aplikasi */}
      <div className="border-t border-[#E9E9E7] p-2 dark:border-[#343434]">
        <NavLink
          to="/pengaturan"
          title={collapsed ? 'Pengaturan' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-[2px] px-2.5 py-1.5 text-[13px] transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-[#EAEAE7] font-medium text-[#E87932] dark:bg-[#2C2C2C]'
                : 'text-[#252525]/85 hover:bg-[#EFEFED] dark:text-[#E6E6E6]/80 dark:hover:bg-[#262626]'
            } ${collapsed ? 'justify-center px-0' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-[#E87932]' : 'text-[#787774] dark:text-[#9B9B9B]'
                }`}
                aria-hidden="true"
              />
              {!collapsed ? <span>Pengaturan</span> : null}
            </>
          )}
        </NavLink>

        {!collapsed ? (
          <div className="mt-1.5 px-2.5 pb-1 text-[11px] text-[#787774] dark:text-[#9B9B9B]">
            <p className="truncate">v0.1.0 · UI Prototype</p>
            <p className="truncate">State Lokal (Simulasi)</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
