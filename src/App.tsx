import { Layers } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { ToastContainer, type ToastItem } from './components/ToastContainer';
import { useTheme } from './hooks/useTheme';
import { MainLayout, type HeaderNotificationItem } from './layouts/MainLayout';
import { SystemFoundationView } from './pages/StageOneSetupPage';
import { fetchLedgerSummary, fetchSystemHealth } from './services/apiClient';
import type { LedgerSummaryData, NavSectionId, SystemHealthData } from './types/system';

const MODULE_PHASE_ROADMAP: Record<
  Exclude<NavSectionId, 'settings'>,
  { title: string; phase: string; description: string }
> = {
  dashboard: {
    title: 'Dashboard Keuangan',
    phase: 'Fase 4',
    description:
      'Menampilkan total saldo seluruh dompet, pemasukan dan pengeluaran bulan ini, grafik arus kas & kategori, tagihan jatuh tempo, dan ringkasan antrean mabar setelah Fase 3–4 selesai.',
  },
  wallets: {
    title: 'Multi-Dompet & Transfer',
    phase: 'Fase 3',
    description:
      'Pengelolaan dompet Bank, Cash, dan E-wallet, pengaturan saldo awal, histori transaksi per dompet, serta transfer antar-dompet atomik akan diimplementasikan pada Fase 3.',
  },
  incomes: {
    title: 'Manajemen Pemasukan',
    phase: 'Fase 4',
    description:
      'CRUD pemasukan dengan pemilihan dompet tujuan, filter tanggal/kategori/dompet, pencarian, serta rekap bulanan dan tahunan akan diimplementasikan pada Fase 4.',
  },
  expenses: {
    title: 'Manajemen Pengeluaran',
    phase: 'Fase 5',
    description:
      'Pencatatan pengeluaran tidak rutin per dompet sumber pembayaran beserta filter dan pencarian akan diimplementasikan pada Fase 5.',
  },
  'recurring-expenses': {
    title: 'Pengeluaran Rutin & Pengingat',
    phase: 'Fase 5',
    description:
      'Jadwal tagihan mingguan/bulanan/tahunan, konfirmasi pembayaran tanpa mengurangi saldo sebelum dibayar, anti pembayaran ganda, serta pengingat jatuh tempo akan diimplementasikan pada Fase 5.',
  },
  debts: {
    title: 'Utang dan Piutang',
    phase: 'Fase 6',
    description:
      'Pencatatan utang dan piutang, pembayaran cicilan/pelunasan bertahap per dompet, serta pembaruan buku kas atomik akan diimplementasikan pada Fase 6.',
  },
  donations: {
    title: 'Donasi Live Stream',
    phase: 'Fase 7',
    description:
      'Input donasi manual TikTok/YouTube ke dompet penerimaan dengan konversi otomatis 1 match = Rp1.000 beserta sisa nominal akan diimplementasikan pada Fase 7.',
  },
  queue: {
    title: 'Antrean Mabar FIFO & Prioritas',
    phase: 'Fase 8',
    description:
      'Antrean mabar FIFO otomatis dari donasi, prioritas manual, penyelesaian match dengan proteksi concurrency, dan riwayat match akan diimplementasikan pada Fase 8.',
  },
  reports: {
    title: 'Laporan Keuangan & Ekspor',
    phase: 'Fase 9',
    description:
      'Laporan pemasukan, pengeluaran, saldo per dompet, transfer internal, utang/piutang, statistik match, dan ekspor CSV/Excel/PDF akan diimplementasikan pada Fase 9.',
  },
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<NavSectionId>('settings');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleNotify = useCallback(
    (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, ...toast }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
    },
    []
  );

  const loadSystemStatus = useCallback(
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
          handleNotify({
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
          handleNotify({ type: 'error', title: 'Pemeriksaan Gagal', message: msg });
        }
      } finally {
        setLoading(false);
      }
    },
    [handleNotify]
  );

  useEffect(() => {
    void loadSystemStatus(false);
  }, [loadSystemStatus]);

  const headerNotifications = useMemo<HeaderNotificationItem[]>(() => {
    const items: HeaderNotificationItem[] = [];
    if (health) {
      items.push({
        id: 'mysql-status',
        title: health.database.connected ? 'MySQL 8 Terhubung' : 'MySQL 8 Belum Terhubung',
        detail: health.database.message,
        tone: health.database.connected ? 'success' : 'warning',
      });
    }
    items.push({
      id: 'stage-status',
      title: 'Fase 1 & Fase 2 Aktif',
      detail: 'Skema 17 tabel, migrasi awal, sistem ledger, dan Notion design system siap.',
      tone: 'neutral',
    });
    return items;
  }, [health]);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <MainLayout
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      theme={theme}
      onToggleTheme={toggleTheme}
      globalSearch={globalSearch}
      onGlobalSearchChange={(val) => {
        setGlobalSearch(val);
        if (activeSection !== 'settings' && val.trim().length > 0) {
          setActiveSection('settings');
        }
      }}
      notifications={headerNotifications}
    >
      {activeSection === 'settings' ? (
        <SystemFoundationView
          health={health}
          ledgerSummary={ledgerSummary}
          loading={loading}
          error={error}
          searchQuery={globalSearch}
          onSearchQueryChange={setGlobalSearch}
          onRefresh={() => void loadSystemStatus(true)}
          onNotify={handleNotify}
        />
      ) : (
        <div className="space-y-6">
          <div className="border-b border-[#E9E9E7] pb-4 dark:border-[#343434]">
            <p className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]">
              Roadmap Implementasi · {MODULE_PHASE_ROADMAP[activeSection].phase}
            </p>
            <h2 className="mt-1 text-[28px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#252525] dark:text-[#E6E6E6]">
              {MODULE_PHASE_ROADMAP[activeSection].title}
            </h2>
          </div>

          <EmptyState
            icon={Layers}
            title={`Modul Siap Dikembangkan di ${MODULE_PHASE_ROADMAP[activeSection].phase}`}
            description={MODULE_PHASE_ROADMAP[activeSection].description}
            actionLabel="Buka Sistem & Database (Fase 1–2)"
            onAction={() => setActiveSection('settings')}
          />
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </MainLayout>
  );
}
