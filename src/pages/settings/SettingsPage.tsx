import { Monitor, RotateCcw, Save, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { ThemeMode } from '../../hooks/useTheme';
import { formatRupiah } from '../../utils/currency';

interface SettingsPageProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function SettingsPage({ theme, onToggleTheme }: SettingsPageProps) {
  const { settings, updateSettings, resetPrototypeData } = useFincopStore();

  const [appName, setAppName] = useState(settings.appName);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [pricePerMatch, setPricePerMatch] = useState(String(settings.pricePerMatch));
  const [notifyDueReminders, setNotifyDueReminders] = useState(settings.notifyDueReminders);
  const [notifyDesktopPopup, setNotifyDesktopPopup] = useState(settings.notifyDesktopPopup);
  const [autoQueueFromDonation, setAutoQueueFromDonation] = useState(
    settings.autoQueueFromDonation
  );
  const [fifoStrictMode, setFifoStrictMode] = useState(settings.fifoStrictMode);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSave = () => {
    updateSettings({
      appName: appName.trim() || 'FINCOP',
      subtitle: subtitle.trim() || 'Finansial Ucopp',
      pricePerMatch: Math.max(100, Number(pricePerMatch) || 1000),
      notifyDueReminders,
      notifyDesktopPopup,
      autoQueueFromDonation,
      fifoStrictMode,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Aplikasi"
        subtitle="Konfigurasi profil aplikasi, tema tampilan, mata uang, preferensi notifikasi, tarif mabar, serta pengelolaan data dummy prototype."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setResetConfirmOpen(true)}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Data Dummy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              Simpan Pengaturan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Profil & Mata Uang */}
        <section className="space-y-4 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]">
          <div className="flex items-center gap-2 border-b border-[#E9E9E7] pb-2.5 dark:border-[#343434]">
            <SettingsIcon className="h-4 w-4 text-[#E87932]" aria-hidden="true" />
            <h2 className="text-[15px] font-semibold">Profil Aplikasi & Mata Uang</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Nama Aplikasi"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
            <Input
              label="Subtitle Aplikasi"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-2.5 text-[13px] dark:border-[#343434] dark:bg-[#202020]">
            <div>
              <p className="font-medium">Mata Uang Utama</p>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                Standar tunggal Rupiah Indonesia (IDR)
              </p>
            </div>
            <StatusBadge tone="accent">IDR (Rp)</StatusBadge>
          </div>
        </section>

        {/* Tema & Tampilan */}
        <section className="space-y-4 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]">
          <div className="flex items-center gap-2 border-b border-[#E9E9E7] pb-2.5 dark:border-[#343434]">
            <Monitor className="h-4 w-4 text-[#E87932]" aria-hidden="true" />
            <h2 className="text-[15px] font-semibold">Tema & Tampilan</h2>
          </div>
          <div className="flex items-center justify-between rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-2.5 text-[13px] dark:border-[#343434] dark:bg-[#202020]">
            <div>
              <p className="font-medium">Mode Tampilan Saat Ini</p>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                {theme === 'dark' ? 'Dark Mode (#191919)' : 'Light Mode (#FFFFFF)'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={onToggleTheme}>
              Ubah ke {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
          <div className="rounded-[2px] border border-[#E9E9E7] p-3 text-[12px] text-[#787774] dark:border-[#343434] dark:text-[#9B9B9B]">
            <p className="font-medium text-[#252525] dark:text-[#E6E6E6]">
              Informasi Versi Prototype
            </p>
            <p className="mt-1">
              FINCOP v0.1.0 — Tahap 1 UI Prototype (React + TypeScript + Tailwind CSS). Seluruh data menggunakan state lokal dan belum terhubung ke MySQL 8.
            </p>
          </div>
        </section>

        {/* Preferensi Notifikasi */}
        <section className="space-y-3 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]">
          <h2 className="border-b border-[#E9E9E7] pb-2.5 text-[15px] font-semibold dark:border-[#343434]">
            Preferensi Notifikasi
          </h2>
          <label className="flex items-center justify-between gap-2 text-[13px]">
            <span>Aktifkan pengingat tagihan & utang jatuh tempo (H-7, H-3, H-1)</span>
            <input
              type="checkbox"
              checked={notifyDueReminders}
              onChange={(e) => setNotifyDueReminders(e.target.checked)}
              className="h-4 w-4 accent-[#E87932]"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-[13px]">
            <span>Tampilkan notifikasi desktop Electron saat aplikasi berjalan</span>
            <input
              type="checkbox"
              checked={notifyDesktopPopup}
              onChange={(e) => setNotifyDesktopPopup(e.target.checked)}
              className="h-4 w-4 accent-[#E87932]"
            />
          </label>
        </section>

        {/* Konfigurasi Donasi & Antrean Mabar */}
        <section className="space-y-3 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]">
          <h2 className="border-b border-[#E9E9E7] pb-2.5 text-[15px] font-semibold dark:border-[#343434]">
            Pengaturan Donasi & Antrean Mabar
          </h2>
          <CurrencyInput
            label="Harga per 1 Match Mabar"
            value={pricePerMatch}
            onChange={(e) => setPricePerMatch(e.target.value)}
            helperText={`Contoh: Donasi Rp10.500 = ${Math.floor(10500 / Math.max(1, Number(pricePerMatch) || 1000))} match`}
          />
          <label className="flex items-center justify-between gap-2 text-[13px]">
            <span>Buat antrean mabar otomatis setiap donasi dicatat</span>
            <input
              type="checkbox"
              checked={autoQueueFromDonation}
              onChange={(e) => setAutoQueueFromDonation(e.target.checked)}
              className="h-4 w-4 accent-[#E87932]"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-[13px]">
            <span>Terapkan urutan FIFO ketat (kecuali prioritas manual)</span>
            <input
              type="checkbox"
              checked={fifoStrictMode}
              onChange={(e) => setFifoStrictMode(e.target.checked)}
              className="h-4 w-4 accent-[#E87932]"
            />
          </label>
          <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
            Tarif aktif saat ini: <strong className="font-mono">{formatRupiah(settings.pricePerMatch)}</strong> / match.
          </p>
        </section>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset Seluruh Data Dummy?"
        message="Semua perubahan transaksi, dompet, utang, donasi, dan antrean mabar di sesi ini akan dikembalikan ke data awal simulasi."
        confirmLabel="Ya, Reset Data"
        onConfirm={() => {
          resetPrototypeData();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
