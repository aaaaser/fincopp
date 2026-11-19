import {
  ArrowDown,
  ArrowUp,
  Check,
  Gift,
  ListOrdered,
  Play,
  Star,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { MatchQueueItem } from '../../types/finance';
import { formatWaktuSingkat } from '../../utils/date';

export function QueuePage() {
  const {
    sortedActiveQueue,
    startQueueMatch,
    completeOneMatch,
    cancelQueueItem,
    toggleQueuePriority,
    moveQueueOrder,
    setQuickAddType,
  } = useFincopStore();

  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [cancelTarget, setCancelTarget] = useState<MatchQueueItem | null>(null);

  const filteredQueue = useMemo(() => {
    return sortedActiveQueue.filter((item) => {
      if (platformFilter !== 'ALL' && item.platform !== platformFilter) return false;
      if (search.trim()) {
        return item.nickname.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [sortedActiveQueue, platformFilter, search]);

  const totalRemainingMatches = useMemo(
    () => sortedActiveQueue.reduce((sum, q) => sum + q.remainingMatches, 0),
    [sortedActiveQueue]
  );

  const priorityCount = useMemo(
    () => sortedActiveQueue.filter((q) => q.isPriority).length,
    [sortedActiveQueue]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Antrean Mabar (FIFO & Prioritas)"
        subtitle="Kelola urutan penonton secara FIFO (First In First Out) atau aktifkan prioritas manual. Penyelesaian match dilakukan manual tanpa timer."
        actions={
          <>
            <Link to="/riwayat-mabar">
              <Button variant="secondary" size="sm">
                Lihat Riwayat Mabar
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => setQuickAddType('donation')}>
              <Gift className="h-3.5 w-3.5" />
              Tambah dari Donasi
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Penonton Dalam Antrean"
          value={`${sortedActiveQueue.length} Penonton`}
          helperText="Urutan prioritas di atas, diikuti FIFO"
          icon={ListOrdered}
        />
        <StatCard
          label="Total Sisa Match"
          value={`${totalRemainingMatches} Match`}
          helperText="Akumulasi seluruh antrean aktif"
          icon={Play}
          tone="default"
        />
        <StatCard
          label="Antrean Prioritas Manual"
          value={`${priorityCount} Penonton`}
          helperText="Didahulukan di atas antrean reguler"
          icon={Star}
          tone="warning"
        />
      </div>

      {/* Toolbar Filter */}
      <div className="rounded-none border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919]">
        <div className="flex flex-col justify-between gap-2.5 border-b border-[#E9E9E7] px-3.5 py-2.5 dark:border-[#343434] sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nickname penonton..."
            className="w-full sm:w-64"
          />
          <FilterDropdown
            ariaLabel="Filter platform antrean"
            value={platformFilter}
            onChange={setPlatformFilter}
            options={[
              { value: 'ALL', label: 'Semua Platform' },
              { value: 'TikTok', label: 'TikTok' },
              { value: 'YouTube', label: 'YouTube' },
              { value: 'Lainnya', label: 'Lainnya' },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] font-medium text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
                <th className="px-3.5 py-2.5 font-medium">Posisi</th>
                <th className="px-3.5 py-2.5 font-medium">Nickname</th>
                <th className="px-3.5 py-2.5 font-medium">Platform</th>
                <th className="px-3.5 py-2.5 text-right font-medium">Total</th>
                <th className="px-3.5 py-2.5 text-right font-medium">Selesai</th>
                <th className="px-3.5 py-2.5 text-right font-medium">Tersisa</th>
                <th className="px-3.5 py-2.5 font-medium">Progres</th>
                <th className="px-3.5 py-2.5 font-medium">Status</th>
                <th className="px-3.5 py-2.5 font-medium">Waktu Masuk</th>
                <th className="px-3.5 py-2.5 text-right font-medium">Aksi Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
              {filteredQueue.map((item, idx) => {
                const progressPct =
                  item.totalMatches > 0
                    ? Math.round((item.completedMatches / item.totalMatches) * 100)
                    : 0;
                const prevSameGroup =
                  idx > 0 && filteredQueue[idx - 1].isPriority === item.isPriority;
                const nextSameGroup =
                  idx < filteredQueue.length - 1 &&
                  filteredQueue[idx + 1].isPriority === item.isPriority;

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#F5F5F4] dark:hover:bg-[#252525]"
                  >
                    <td className="px-3.5 py-2.5 font-mono font-semibold text-[#252525] tabular-nums dark:text-[#E6E6E6]">
                      #{idx + 1}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#252525] dark:text-[#E6E6E6]">
                          {item.nickname}
                        </span>
                        {item.isPriority ? (
                          <StatusBadge tone="warning">Prioritas</StatusBadge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <StatusBadge tone={item.platform === 'TikTok' ? 'accent' : 'danger'}>
                        {item.platform}
                      </StatusBadge>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums">
                      {item.totalMatches}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-[#448361] tabular-nums">
                      {item.completedMatches}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-[#E87932] tabular-nums">
                      {item.remainingMatches}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-[#E9E9E7] dark:bg-[#343434]">
                          <div
                            className="h-1.5 bg-[#E87932]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-[#787774] tabular-nums dark:text-[#9B9B9B]">
                          {progressPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <StatusBadge tone={item.status === 'BERLANGSUNG' ? 'accent' : 'neutral'}>
                        {item.status === 'BERLANGSUNG' ? 'Berlangsung' : 'Menunggu'}
                      </StatusBadge>
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-[12px] text-[#787774] tabular-nums dark:text-[#9B9B9B]">
                      {formatWaktuSingkat(item.queuedAt)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1">
                        {item.status === 'MENUNGGU' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => startQueueMatch(item.id)}
                          >
                            <Play className="h-3 w-3" />
                            Mulai Match
                          </Button>
                        ) : null}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => completeOneMatch(item.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Selesaikan Match
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQueuePriority(item.id, !item.isPriority)}
                          title={
                            item.isPriority ? 'Turunkan dari prioritas' : 'Naikkan ke prioritas'
                          }
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              item.isPriority ? 'fill-[#CB912F] text-[#CB912F]' : ''
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!prevSameGroup}
                          onClick={() => moveQueueOrder(item.id, 'up')}
                          title="Geser naik dalam kelompok"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!nextSameGroup}
                          onClick={() => moveQueueOrder(item.id, 'down')}
                          title="Geser turun dalam kelompok"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelTarget(item)}
                          title="Batalkan antrean"
                          className="text-[#D44C47]"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredQueue.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]"
                  >
                    Tidak ada antrean mabar aktif saat ini.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Batalkan Antrean Mabar?"
        message={
          cancelTarget
            ? `Antrean milik ${cancelTarget.nickname} (sisa ${cancelTarget.remainingMatches} match) akan dibatalkan dan dipindahkan ke Riwayat Mabar.`
            : ''
        }
        confirmLabel="Ya, Batalkan Antrean"
        onConfirm={() => {
          if (cancelTarget) cancelQueueItem(cancelTarget.id);
          setCancelTarget(null);
        }}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
