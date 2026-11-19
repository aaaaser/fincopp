import { CheckCircle2, History, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable, type DataTableColumn } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { MatchHistoryRecord } from '../../types/finance';
import { formatWaktuSingkat } from '../../utils/date';

export function MatchHistoryPage() {
  const { matchHistory } = useFincopStore();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredHistory = useMemo(() => {
    return matchHistory.filter((item) => {
      if (platformFilter !== 'ALL' && item.platform !== platformFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      const itemDate = item.completedAt.slice(0, 10);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      if (search.trim()) {
        return item.nickname.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [matchHistory, platformFilter, statusFilter, startDate, endDate, search]);

  const totalCompletedMatches = useMemo(
    () => matchHistory.reduce((s, m) => s + m.completedMatches, 0),
    [matchHistory]
  );

  const completedCount = useMemo(
    () => matchHistory.filter((m) => m.status === 'SELESAI').length,
    [matchHistory]
  );

  const cancelledCount = useMemo(
    () => matchHistory.filter((m) => m.status === 'DIBATALKAN').length,
    [matchHistory]
  );

  const columns: DataTableColumn<MatchHistoryRecord>[] = [
    {
      key: 'nickname',
      header: 'Nickname',
      sortable: true,
      sortValue: (m) => m.nickname,
      render: (m) => (
        <span className="font-medium text-[#252525] dark:text-[#E6E6E6]">{m.nickname}</span>
      ),
    },
    {
      key: 'platform',
      header: 'Platform',
      sortable: true,
      sortValue: (m) => m.platform,
      render: (m) => (
        <StatusBadge tone={m.platform === 'TikTok' ? 'accent' : 'danger'}>
          {m.platform}
        </StatusBadge>
      ),
    },
    {
      key: 'totalMatches',
      header: 'Total Match',
      align: 'right',
      sortable: true,
      sortValue: (m) => m.totalMatches,
      render: (m) => <span className="font-mono">{m.totalMatches}</span>,
    },
    {
      key: 'completedMatches',
      header: 'Match Selesai',
      align: 'right',
      sortable: true,
      sortValue: (m) => m.completedMatches,
      render: (m) => (
        <span className="font-mono font-semibold text-[#448361]">{m.completedMatches}</span>
      ),
    },
    {
      key: 'completedAt',
      header: 'Waktu Selesai',
      sortable: true,
      sortValue: (m) => m.completedAt,
      render: (m) => (
        <span className="text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatWaktuSingkat(m.completedAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => (
        <StatusBadge tone={m.status === 'SELESAI' ? 'success' : 'danger'}>
          {m.status === 'SELESAI' ? 'Selesai' : 'Dibatalkan'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Mabar"
        subtitle="Arsip antrean mabar yang telah diselesaikan maupun dibatalkan."
        actions={
          <Link to="/antrean-mabar">
            <Button variant="secondary" size="sm">
              Kembali ke Antrean Aktif
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Match Diselesaikan"
          value={`${totalCompletedMatches} Match`}
          helperText="Dari seluruh riwayat penonton"
          icon={History}
          tone="success"
        />
        <StatCard
          label="Antrean Selesai"
          value={`${completedCount} Penonton`}
          helperText="Menuntaskan seluruh kuota match"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Antrean Dibatalkan"
          value={`${cancelledCount} Penonton`}
          helperText="Dibatalkan sebelum kuota habis"
          icon={XCircle}
          tone={cancelledCount > 0 ? 'danger' : 'neutral' as 'default'}
        />
      </div>

      <DataTable
        rows={filteredHistory}
        columns={columns}
        rowKey={(m) => m.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nickname..."
        filterControls={
          <>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <FilterDropdown
              ariaLabel="Filter platform"
              value={platformFilter}
              onChange={setPlatformFilter}
              options={[
                { value: 'ALL', label: 'Semua Platform' },
                { value: 'TikTok', label: 'TikTok' },
                { value: 'YouTube', label: 'YouTube' },
                { value: 'Lainnya', label: 'Lainnya' },
              ]}
            />
            <FilterDropdown
              ariaLabel="Filter status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'SELESAI', label: 'Selesai' },
                { value: 'DIBATALKAN', label: 'Dibatalkan' },
              ]}
            />
          </>
        }
        emptyMessage="Belum ada riwayat mabar yang sesuai filter."
      />
    </div>
  );
}
