import { AlertTriangle, Bell, Check, CheckCheck, Clock, HandCoins } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { NotificationCategory } from '../../types/finance';
import { formatTanggalSingkat } from '../../utils/date';

type NotificationFilter = 'ALL' | NotificationCategory | 'HISTORY';

const TAB_ITEMS: Array<{ key: NotificationFilter; label: string }> = [
  { key: 'ALL', label: 'Semua' },
  { key: 'TAGIHAN_TERLAMBAT', label: 'Tagihan Terlambat' },
  { key: 'TAGIHAN_MENDEKATI', label: 'Tagihan Mendekati Jatuh Tempo' },
  { key: 'UTANG_MENDEKATI', label: 'Utang Mendekati Jatuh Tempo' },
  { key: 'PIUTANG_MENDEKATI', label: 'Piutang Mendekati Jatuh Tempo' },
  { key: 'HISTORY', label: 'Riwayat Dibaca' },
];

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFincopStore();
  const [activeTab, setActiveTab] = useState<NotificationFilter>('ALL');

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const overdueBillsCount = useMemo(
    () => notifications.filter((n) => n.category === 'TAGIHAN_TERLAMBAT').length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return notifications;
    if (activeTab === 'HISTORY') return notifications.filter((n) => n.isRead);
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  const getCategoryMeta = (cat: NotificationCategory) => {
    switch (cat) {
      case 'TAGIHAN_TERLAMBAT':
        return { label: 'Tagihan Terlambat', tone: 'danger' as const, icon: AlertTriangle };
      case 'TAGIHAN_MENDEKATI':
        return { label: 'Tagihan Jatuh Tempo', tone: 'warning' as const, icon: Clock };
      case 'UTANG_MENDEKATI':
        return { label: 'Utang Jatuh Tempo', tone: 'danger' as const, icon: HandCoins };
      case 'PIUTANG_MENDEKATI':
        return { label: 'Piutang Jatuh Tempo', tone: 'accent' as const, icon: HandCoins };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi & Pengingat"
        subtitle="Pusat peringatan tagihan rutin yang mendekati atau melewati jatuh tempo serta jadwal utang/piutang."
        actions={
          <Button
            variant="secondary"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllNotificationsRead}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tandai Semua Dibaca
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Notifikasi Belum Dibaca"
          value={`${unreadCount} Notifikasi`}
          helperText="Menunggu peninjauan Anda"
          icon={Bell}
          tone={unreadCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Peringatan Tagihan Terlambat"
          value={`${overdueBillsCount} Peringatan`}
          helperText="Membutuhkan tindakan segera"
          icon={AlertTriangle}
          tone={overdueBillsCount > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Total Riwayat Notifikasi"
          value={`${notifications.length} Catatan`}
          helperText="Tersimpan dalam sesi simulasi"
          icon={Clock}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-[#E9E9E7] dark:border-[#343434]">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-[#E87932] text-[#E87932]'
                : 'border-transparent text-[#787774] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-[#E9E9E7] rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:divide-[#343434] dark:border-[#343434] dark:bg-[#191919]">
        {filtered.map((item) => {
          const meta = getCategoryMeta(item.category);
          const Icon = meta.icon;
          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center ${
                !item.isRead ? 'bg-[#F7F7F5]/65 dark:bg-[#202020]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    meta.tone === 'danger'
                      ? 'text-[#D44C47]'
                      : meta.tone === 'warning'
                        ? 'text-[#CB912F]'
                        : 'text-[#E87932]'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    {!item.isRead ? <StatusBadge tone="accent">Baru</StatusBadge> : null}
                    <span className="text-[12px] text-[#787774] tabular-nums dark:text-[#9B9B9B]">
                      {formatTanggalSingkat(item.date)}
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] font-medium text-[#252525] dark:text-[#E6E6E6]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#787774] dark:text-[#9B9B9B]">
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {!item.isRead ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => markNotificationRead(item.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Tandai Dibaca
                  </Button>
                ) : (
                  <span className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                    Sudah dibaca
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]">
            Tidak ada notifikasi pada kategori ini.
          </div>
        ) : null}
      </div>
    </div>
  );
}
