import { Layers } from 'lucide-react';
import { useCallback, useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { ToastContainer, type ToastItem } from './components/ToastContainer';
import { useTheme } from './hooks/useTheme';
import { MainLayout } from './layouts/MainLayout';
import { StageOneSetupPage } from './pages/StageOneSetupPage';
import type { NavSectionId } from './types/system';

const STAGE_ROADMAP_INFO: Record<
  Exclude<NavSectionId, 'stage1-setup'>,
  { title: string; stage: string; description: string }
> = {
  wallets: {
    title: 'Modul Multi-Dompet & Transfer',
    stage: 'Fase 3',
    description:
      'Pengelolaan dompet Bank, Cash, dan E-wallet, pengaturan saldo awal, histori per dompet, serta transfer antar-dompet yang netral terhadap pemasukan/pengeluaran akan dibangun pada Fase 3.',
  },
  dashboard: {
    title: 'Dashboard Keuangan Utama',
    stage: 'Fase 4',
    description:
      'Ringkasan total saldo seluruh dompet, pemasukan dan pengeluaran bulanan, grafik arus kas, tagihan jatuh tempo, dan ringkasan antrean mabar akan dibangun pada Fase 4.',
  },
  incomes: {
    title: 'Modul Pemasukan',
    stage: 'Fase 4',
    description:
      'Pencatatan CRUD pemasukan dengan pemilihan dompet tujuan, filter kategori, pencarian, serta rekap bulanan dan tahunan akan dibangun pada Fase 4.',
  },
  expenses: {
    title: 'Modul Pengeluaran & Tagihan Rutin',
    stage: 'Fase 5',
    description:
      'Pengeluaran rutin dan tidak rutin per dompet, jadwal tagihan otomatis, anti pembayaran ganda, serta pengingat jatuh tempo akan dibangun pada Fase 5.',
  },
  debts: {
    title: 'Modul Utang & Piutang',
    stage: 'Fase 6',
    description:
      'Manajemen utang dan piutang, pembayaran cicilan/pelunasan per dompet, dan pembaruan ledger atomik akan dibangun pada Fase 6.',
  },
  donations: {
    title: 'Modul Donasi Live Stream',
    stage: 'Fase 7',
    description:
      'Input donasi manual TikTok/YouTube ke dompet penerimaan dan konversi otomatis 1 match = Rp1.000 beserta sisa nominal akan dibangun pada Fase 7.',
  },
  queue: {
    title: 'Modul Antrean Mabar FIFO & Prioritas',
    stage: 'Fase 8',
    description:
      'Sistem antrean FIFO, penandaan prioritas manual, penyelesaian match berbasis database transaction, dan riwayat match akan dibangun pada Fase 8.',
  },
  reports: {
    title: 'Modul Laporan & Ekspor',
    stage: 'Fase 9',
    description:
      'Laporan arus kas, saldo per dompet, transfer antar-dompet, statistik donasi & match, serta ekspor CSV, Excel, dan PDF akan dibangun pada Fase 9.',
  },
  notifications: {
    title: 'Modul Notifikasi Desktop',
    stage: 'Fase 10',
    description:
      'Pengingat desktop Electron Notification API untuk tagihan rutin, utang, dan piutang dengan deduplikasi periode akan dibangun pada Fase 10.',
  },
  backup: {
    title: 'Modul Backup & Restore Database',
    stage: 'Fase 11',
    description:
      'Backup manual dan terjadwal otomatis dengan kebijakan retensi serta restore dengan backup pengaman akan dibangun pada Fase 11.',
  },
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<NavSectionId>('stage1-setup');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <MainLayout
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      {activeSection === 'stage1-setup' ? (
        <StageOneSetupPage onNotify={handleNotify} />
      ) : (
        <EmptyState
          icon={Layers}
          title={`${STAGE_ROADMAP_INFO[activeSection].title} (${STAGE_ROADMAP_INFO[activeSection].stage})`}
          description={STAGE_ROADMAP_INFO[activeSection].description}
          actionLabel="Kembali ke Fondasi & Ledger"
          onAction={() => setActiveSection('stage1-setup')}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </MainLayout>
  );
}
