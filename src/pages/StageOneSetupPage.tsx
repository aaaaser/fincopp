import {
  BellRing,
  BookOpenCheck,
  CheckCircle2,
  Database,
  HardDrive,
  Laptop,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { fetchLedgerSummary, fetchSystemHealth } from '../services/apiClient';
import type { LedgerSummaryData, SystemHealthData } from '../types/system';
import { calculateMatchAllocation, formatRupiah } from '../utils/currency';

interface StageOneSetupPageProps {
  onNotify: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function StageOneSetupPage({ onNotify }: StageOneSetupPageProps) {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [electronInfo, setElectronInfo] = useState<{
    isElectron: boolean;
    platform: string;
    electronVersion?: string;
  }>({
    isElectron: false,
    platform: 'Web Browser',
  });

  const loadHealth = useCallback(
    async (showToast = false) => {
      setLoading(true);
      setError(null);
      try {
        const [healthData, ledgerData] = await Promise.all([
          fetchSystemHealth(),
          fetchLedgerSummary(),
        ]);
        setHealth(healthData);
        setLedgerSummary(ledgerData);
        if (showToast) {
          onNotify({
            type: healthData.database.connected ? 'success' : 'info',
            title: healthData.database.connected
              ? 'Koneksi MySQL 8 & Ledger Terverifikasi'
              : 'Status Server Diperbarui',
            message: healthData.database.message,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat status sistem.';
        setError(msg);
        if (showToast) {
          onNotify({ type: 'error', title: 'Pemeriksaan Gagal', message: msg });
        }
      } finally {
        setLoading(false);
      }
    },
    [onNotify]
  );

  useEffect(() => {
    void loadHealth(false);

    if (window.fincopAPI?.isElectron) {
      void window.fincopAPI.getAppInfo().then((info) => {
        setElectronInfo({
          isElectron: true,
          platform: `Windows/Desktop (${info.platform})`,
          electronVersion: info.electronVersion,
        });
      });
    }
  }, [loadHealth]);

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
        'Electron Notification API aktif saat dijalankan lewat desktop app (npm run dev:electron).',
    });
  };

  const modules = useMemo(() => {
    if (!health) return ['Semua'];
    const unique = Array.from(new Set(health.schema.tables.map((t) => t.module)));
    return ['Semua', ...unique];
  }, [health]);

  const filteredTables = useMemo(() => {
    if (!health) return [];
    return health.schema.tables.filter((table) => {
      const matchesModule = moduleFilter === 'Semua' || table.module === moduleFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        table.tableName.toLowerCase().includes(q) ||
        table.modelName.toLowerCase().includes(q) ||
        table.description.toLowerCase().includes(q);
      return matchesModule && matchesQuery;
    });
  }, [health, moduleFilter, searchQuery]);

  const sampleMatchCalc = calculateMatchAllocation('10500.00', '1000.00');

  return (
    <div className="space-y-6">
      {/* Header Aksi Fase 1 & 2 */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Fase 1 & Fase 2 · Fondasi Arsitektur, Skema 17 Tabel & Sistem Ledger
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Kesiapan Sistem FINCOP (Finansial Ucopp)
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Verifikasi Electron, Express API, Prisma ORM (`Decimal(18,2)`), koneksi MySQL 8 lokal,
            dan audit konsistensi buku kas multi-dompet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleTestDesktopNotification}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <BellRing className="h-4 w-4 text-orange-500" aria-hidden="true" />
            <span>Uji Notifikasi Desktop</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadHealth(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{loading ? 'Memeriksa...' : 'Uji Koneksi & Ledger'}</span>
          </button>
        </div>
      </section>

      {/* Kartu Statistik Sistem */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Backend Express.js"
          value={health ? 'Aktif' : error ? 'Terputus' : 'Memuat...'}
          helperText={
            health
              ? `Node ${health.application.nodeVersion} · Uptime ${health.application.uptimeSeconds} dtk`
              : 'Menunggu respons /api/health'
          }
          icon={Server}
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
                ? 'Server MySQL lokal belum aktif'
                : 'DATABASE_URL belum diatur di .env'
          }
          icon={Database}
          tone={health?.database.connected ? 'success' : 'warning'}
        />
        <StatCard
          label="Skema Prisma ORM"
          value={health ? `${health.schema.totalTables} Tabel` : '17 Tabel'}
          helperText="Tipe Decimal(18,2) & migrasi siap"
          icon={HardDrive}
          tone="default"
        />
        <StatCard
          label="Audit Buku Kas"
          value={
            ledgerSummary?.connected
              ? ledgerSummary.allConsistent
                ? 'Konsisten'
                : 'Perlu Rekonsiliasi'
              : electronInfo.isElectron
                ? 'Electron Aktif'
                : 'Siap Audit'
          }
          helperText={
            ledgerSummary?.connected
              ? `Total Ledger: ${formatRupiah(ledgerSummary.totalLedgerBalance)}`
              : 'cash_transactions ↔ wallets.current_balance'
          }
          icon={ledgerSummary?.connected ? BookOpenCheck : Laptop}
          tone={ledgerSummary?.connected && !ledgerSummary.allConsistent ? 'danger' : 'default'}
        />
      </section>

      {/* Panel Diagnostik Koneksi MySQL 8 & Ledger */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Diagnostik Koneksi MySQL 8 & Konsistensi Ledger
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Seluruh perubahan saldo dompet dijamin atomik melalui Prisma `$transaction` dan tercatat pada `cash_transactions`.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {health?.database.connected ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Siap Menyimpan Data</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <XCircle className="h-4 w-4" aria-hidden="true" />
                <span>Menunggu MySQL Lokal (Laragon/XAMPP)</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Host & Port</p>
            <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
              {health?.database.host ? `${health.database.host}:${health.database.port}` : '127.0.0.1:3306'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Nama Database</p>
            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
              {health?.database.database ?? 'fincop_db'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Versi Server & Tabel</p>
            <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
              {health?.database.connected
                ? `${health.database.serverVersion ?? 'MySQL 8'} · ${health.database.tableCount} tabel`
                : 'Belum terdeteksi'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Uji Akurasi Kalkulasi IDR</p>
            <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
              {formatRupiah(10500)} = {sampleMatchCalc.matchCount} match + sisa{' '}
              {formatRupiah(sampleMatchCalc.remainderRupiah)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Status Pemeriksaan:</p>
          <p className="mt-1">{error ?? health?.database.message ?? 'Sedang memeriksa...'}</p>
          {!health?.database.connected ? (
            <p className="mt-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              Langkah lokal Windows: aktifkan MySQL di Laragon/XAMPP, buat database `fincop_db`,
              salin `.env.example` ke `.env`, lalu jalankan `npx prisma migrate deploy` dan
              `npm run prisma:seed`.
            </p>
          ) : null}
        </div>
      </section>

      {/* Daftar 17 Tabel Skema Prisma */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Rancangan 17 Tabel Database Prisma (MySQL 8)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Mencakup multi-dompet, transfer antar-dompet, transaksi finansial, buku kas ledger, notifikasi, dan log backup.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tabel atau model..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none sm:w-56 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {modules.slice(0, 5).map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setModuleFilter(mod)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    moduleFilter === mod
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="px-6 py-3">Nama Tabel MySQL</th>
                <th className="px-6 py-3">Model Prisma</th>
                <th className="px-6 py-3">Modul</th>
                <th className="px-6 py-3">Fungsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTables.map((table) => (
                <tr
                  key={table.tableName}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-6 py-3 font-mono text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {table.tableName}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {table.modelName}
                  </td>
                  <td className="px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {table.module}
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {table.description}
                  </td>
                </tr>
              ))}
              {filteredTables.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Tidak ada tabel yang cocok dengan kata kunci "{searchQuery}".
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ringkasan Keamanan */}
      <section className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Keamanan Desktop & Integritas Ledger Aktif
          </p>
          <p className="mt-1">
            Electron menggunakan <span className="font-mono">contextIsolation: true</span>,{' '}
            <span className="font-mono">nodeIntegration: false</span>, preload API terkontrol,
            validasi Zod pada API, dan pencatatan kas berbasis <span className="font-mono">Decimal(18,2)</span>{' '}
            di dalam database transaction Prisma.
          </p>
        </div>
      </section>
    </div>
  );
}
