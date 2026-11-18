import { BellRing, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Select } from '../components/ui/Select';
import type { LedgerSummaryData, PrismaTableSummary, SystemHealthData } from '../types/system';
import { calculateMatchAllocation, formatRupiah } from '../utils/currency';

interface SystemFoundationViewProps {
  health: SystemHealthData | null;
  ledgerSummary: LedgerSummaryData | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  onRefresh: () => void;
  onNotify: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function SystemFoundationView({
  health,
  ledgerSummary,
  loading,
  error,
  searchQuery,
  onSearchQueryChange,
  onRefresh,
  onNotify,
}: SystemFoundationViewProps) {
  const [moduleFilter, setModuleFilter] = useState<string>('Semua');
  const isElectron = typeof window !== 'undefined' && Boolean(window.fincopAPI?.isElectron);

  const handleTestDesktopNotification = async () => {
    if (window.fincopAPI?.isElectron) {
      const result = await window.fincopAPI.sendNotification({
        title: 'FINCOP — Pengingat Keuangan',
        body: 'Notifikasi desktop Electron aktif dan siap digunakan.',
      });
      onNotify({
        type: result.sent ? 'success' : 'error',
        title: result.sent ? 'Notifikasi Desktop Terkirim' : 'Notifikasi Gagal',
        message: result.reason ?? 'Periksa pusat notifikasi Windows Anda.',
      });
      return;
    }

    onNotify({
      type: 'info',
      title: 'Mode Preview Web',
      message:
        'Electron Notification API aktif saat dijalankan di aplikasi desktop (npm run dev:electron).',
    });
  };

  const moduleOptions = useMemo(() => {
    const base = [{ value: 'Semua', label: 'Semua Modul' }];
    if (!health) return base;
    const unique = Array.from(new Set(health.schema.tables.map((t) => t.module)));
    return [...base, ...unique.map((m) => ({ value: m, label: m }))];
  }, [health]);

  const filteredTables = useMemo(() => {
    if (!health) return [];
    const q = searchQuery.trim().toLowerCase();
    return health.schema.tables.filter((table) => {
      const matchesModule = moduleFilter === 'Semua' || table.module === moduleFilter;
      const matchesQuery =
        q.length === 0 ||
        table.tableName.toLowerCase().includes(q) ||
        table.modelName.toLowerCase().includes(q) ||
        table.module.toLowerCase().includes(q) ||
        table.description.toLowerCase().includes(q);
      return matchesModule && matchesQuery;
    });
  }, [health, moduleFilter, searchQuery]);

  const columns: DataTableColumn<PrismaTableSummary>[] = [
    {
      key: 'tableName',
      header: 'Tabel MySQL',
      sortable: true,
      sortValue: (row) => row.tableName,
      render: (row) => (
        <span className="font-mono text-[12px] font-medium text-[#252525] dark:text-[#E6E6E6]">
          {row.tableName}
        </span>
      ),
    },
    {
      key: 'modelName',
      header: 'Model Prisma',
      sortable: true,
      sortValue: (row) => row.modelName,
      render: (row) => (
        <span className="font-mono text-[12px] text-[#787774] dark:text-[#9B9B9B]">
          {row.modelName}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Modul',
      sortable: true,
      sortValue: (row) => row.module,
      render: (row) => <Badge tone="neutral">{row.module}</Badge>,
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (row) => (
        <span className="text-[13px] text-[#787774] dark:text-[#9B9B9B]">{row.description}</span>
      ),
    },
  ];

  const sampleMatchCalc = calculateMatchAllocation('10500.00', '1000.00');

  return (
    <div className="space-y-8">
      {/* Page Header (28px Title) */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E9E9E7] pb-5 dark:border-[#343434] sm:flex-row sm:items-end">
        <div>
          <p className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]">
            Fase 1 & Fase 2 · Fondasi Aplikasi, Skema Database & Sistem Ledger
          </p>
          <h2 className="mt-1 text-[28px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#252525] dark:text-[#E6E6E6]">
            Sistem & Database Lokal
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={handleTestDesktopNotification}>
            <BellRing className="h-3.5 w-3.5 text-[#E87932]" />
            <span>Uji Notifikasi</span>
          </Button>
          <Button variant="primary" disabled={loading} onClick={onRefresh}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Memeriksa...' : 'Uji Koneksi MySQL'}</span>
          </Button>
        </div>
      </div>

      {/* Ringkasan Status Terstruktur (2px Radius, Minimalist) */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Backend Express API"
          value={health ? 'Aktif' : error ? 'Terputus' : 'Memuat...'}
          helperText={
            health ? `Node ${health.application.nodeVersion}` : 'Menunggu /api/health'
          }
          tone={health ? 'success' : 'danger'}
        />
        <StatCard
          label="Database MySQL 8"
          value={
            loading
              ? 'Memeriksa...'
              : health?.database.connected
                ? 'Terhubung'
                : 'Belum Terhubung'
          }
          helperText={
            health?.database.connected
              ? `${health.database.database ?? 'fincop_db'} · ${health.database.latencyMs ?? 0} ms`
              : health?.database.configured
                ? 'Layanan MySQL belum berjalan'
                : 'DATABASE_URL belum diatur'
          }
          tone={health?.database.connected ? 'success' : 'warning'}
        />
        <StatCard
          label="Skema & Ledger"
          value={health ? `${health.schema.totalTables} Tabel` : '17 Tabel'}
          helperText={
            ledgerSummary?.connected
              ? `Saldo Ledger: ${formatRupiah(ledgerSummary.totalLedgerBalance)}`
              : 'DECIMAL(18,2) · cash_transactions'
          }
          tone="default"
        />
        <StatCard
          label="Desktop & Keamanan"
          value={isElectron ? 'Electron Aktif' : 'Web Preview'}
          helperText="contextIsolation · nodeIntegration: false"
          tone="default"
        />
      </section>

      {/* Detail Diagnostik MySQL & Verifikasi Ledger */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
            Diagnostik Koneksi & Konsistensi Saldo
          </h3>
          {health?.database.connected ? (
            <Badge tone="success">MySQL 8 Terhubung</Badge>
          ) : (
            <Badge tone="warning">Menunggu MySQL Lokal</Badge>
          )}
        </div>

        <div className="rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] p-4 dark:border-[#343434] dark:bg-[#202020]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Host & Port</p>
              <p className="mt-1 font-mono text-[13px] font-medium text-[#252525] tabular-nums dark:text-[#E6E6E6]">
                {health?.database.host ? `${health.database.host}:${health.database.port}` : '127.0.0.1:3306'}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Database</p>
              <p className="mt-1 font-mono text-[13px] font-medium text-[#252525] dark:text-[#E6E6E6]">
                {health?.database.database ?? 'fincop_db'}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Audit Ledger</p>
              <p className="mt-1 text-[13px] font-medium text-[#252525] dark:text-[#E6E6E6]">
                {ledgerSummary?.allConsistent ? 'Konsisten dengan cash_transactions' : 'Perlu rekonsiliasi'}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Uji Presisi Match & IDR</p>
              <p className="mt-1 font-mono text-[13px] text-[#252525] tabular-nums dark:text-[#E6E6E6]">
                {formatRupiah(10500)} = {sampleMatchCalc.matchCount} match + {formatRupiah(sampleMatchCalc.remainderRupiah)}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[#E9E9E7] pt-3 text-[13px] text-[#787774] dark:border-[#343434] dark:text-[#9B9B9B]">
            <span className="font-medium text-[#252525] dark:text-[#E6E6E6]">Status: </span>
            {error ?? health?.database.message ?? 'Memeriksa koneksi...'}
          </div>
        </div>
      </section>

      {/* Tabel Utama Skema Database (0px Radius, Sorting, Pagination, Search, Filter) */}
      <section className="space-y-3">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h3 className="text-[18px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
              Skema Tabel Database (`fincop_db`)
            </h3>
            <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
              17 tabel MySQL 8 dengan kolom DECIMAL(18,2) dan relasi foreign key melalui Prisma ORM.
            </p>
          </div>
        </div>

        <DataTable
          rows={filteredTables}
          columns={columns}
          rowKey={(row) => row.tableName}
          searchPlaceholder="Cari nama tabel, model, atau fungsi..."
          searchValue={searchQuery}
          onSearchChange={onSearchQueryChange}
          pageSize={8}
          filterControls={
            <div className="w-44">
              <Select
                aria-label="Filter modul tabel"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                options={moduleOptions}
              />
            </div>
          }
          emptyMessage="Tidak ada tabel skema yang sesuai dengan pencarian Anda."
        />
      </section>
    </div>
  );
}
