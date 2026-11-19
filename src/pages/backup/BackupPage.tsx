import {
  Clock,
  FolderOpen,
  HardDriveDownload,
  RotateCcw,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable, type DataTableColumn } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { BackupRecord } from '../../types/finance';
import { formatWaktuSingkat } from '../../utils/date';

export function BackupPage() {
  const { backupLogs, settings, updateSettings, runManualBackup, runSimulatedRestore } =
    useFincopStore();

  const [folderPath, setFolderPath] = useState(settings.autoBackupFolder);
  const [autoEnabled, setAutoEnabled] = useState(settings.autoBackupEnabled);
  const [frequency, setFrequency] = useState(settings.autoBackupFrequency);
  const [backupTime, setBackupTime] = useState(settings.autoBackupTime);
  const [retentionDays, setRetentionDays] = useState(String(settings.backupRetentionDays));
  const [selectedRestoreFile, setSelectedRestoreFile] = useState<string>('');
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedRestoreFile(file.name);
    }
  };

  const handleSaveSchedule = () => {
    updateSettings({
      autoBackupEnabled: autoEnabled,
      autoBackupFrequency: frequency,
      autoBackupTime: backupTime,
      autoBackupFolder: folderPath,
      backupRetentionDays: Math.max(1, Number(retentionDays) || 14),
    });
  };

  const columns: DataTableColumn<BackupRecord>[] = [
    {
      key: 'createdAt',
      header: 'Waktu Backup',
      sortable: true,
      sortValue: (b) => b.createdAt,
      render: (b) => (
        <span className="whitespace-nowrap text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatWaktuSingkat(b.createdAt)}
        </span>
      ),
    },
    {
      key: 'fileName',
      header: 'Nama File',
      sortable: true,
      sortValue: (b) => b.fileName,
      render: (b) => <span className="font-mono text-[12px]">{b.fileName}</span>,
    },
    {
      key: 'type',
      header: 'Mode',
      render: (b) => (
        <StatusBadge tone={b.type === 'MANUAL' ? 'accent' : 'neutral'}>
          {b.type === 'MANUAL' ? 'Manual' : 'Otomatis'}
        </StatusBadge>
      ),
    },
    {
      key: 'folderPath',
      header: 'Lokasi Folder',
      render: (b) => (
        <span className="font-mono text-[12px] text-[#787774] dark:text-[#9B9B9B]">
          {b.folderPath}
        </span>
      ),
    },
    {
      key: 'sizeLabel',
      header: 'Ukuran',
      align: 'right',
      render: (b) => <span className="font-mono text-[12px]">{b.sizeLabel}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <StatusBadge tone={b.status === 'BERHASIL' ? 'success' : 'danger'}>
          {b.status === 'BERHASIL' ? 'Berhasil' : 'Gagal'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Restore (Simulasi UI)"
        subtitle="Kelola pencadangan manual, penjadwalan backup otomatis ke folder lokal, dan simulasi pemulihan database."
        actions={
          <Button variant="primary" size="sm" onClick={() => runManualBackup(folderPath)}>
            <HardDriveDownload className="h-3.5 w-3.5" />
            Backup Sekarang
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Backup Terakhir"
          value={backupLogs[0] ? formatWaktuSingkat(backupLogs[0].createdAt) : '-'}
          helperText={backupLogs[0]?.fileName ?? 'Belum ada riwayat'}
          icon={HardDriveDownload}
          tone="success"
        />
        <StatCard
          label="Jadwal Backup Otomatis"
          value={autoEnabled ? `${frequency} · ${backupTime}` : 'Nonaktif'}
          helperText={`Retensi penyimpanan ${retentionDays} hari`}
          icon={Clock}
        />
        <StatCard
          label="Total File Tersimpan"
          value={`${backupLogs.length} Arsip`}
          helperText={folderPath}
          icon={FolderOpen}
        />
      </div>

      {/* Pengaturan Jadwal Backup & Restore */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="space-y-4 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919] lg:col-span-7">
          <div>
            <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
              Jadwal Backup Otomatis
            </h2>
            <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
              Konfigurasi simulasi jadwal pencadangan berkala di desktop Windows
            </p>
          </div>

          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={autoEnabled}
              onChange={(e) => setAutoEnabled(e.target.checked)}
              className="h-4 w-4 accent-[#E87932]"
            />
            Aktifkan backup otomatis terjadwal
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label="Frekuensi"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'HARIAN' | 'MINGGUAN' | 'BULANAN')}
              options={[
                { value: 'HARIAN', label: 'Harian' },
                { value: 'MINGGUAN', label: 'Mingguan' },
                { value: 'BULANAN', label: 'Bulanan' },
              ]}
            />
            <Input
              label="Jam Eksekusi"
              type="time"
              value={backupTime}
              onChange={(e) => setBackupTime(e.target.value)}
            />
            <Input
              label="Retensi (Hari)"
              type="number"
              min="1"
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
            />
          </div>

          <Input
            label="Folder Tujuan Backup"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
          />

          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={handleSaveSchedule}>
              Simpan Jadwal Backup
            </Button>
          </div>
        </section>

        <section className="flex flex-col justify-between space-y-4 rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919] lg:col-span-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#CB912F]" aria-hidden="true" />
              <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                Restore Database (.sql)
              </h2>
            </div>
            <p className="text-[13px] text-[#787774] dark:text-[#9B9B9B]">
              Pada versi produksi, proses restore akan otomatis membuat backup pengaman sebelum menimpa database. Pada tahap UI Prototype ini, aksi dijalankan sebagai simulasi UI.
            </p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-dashed border-[#E9E9E7] bg-[#F7F7F5] px-4 py-5 text-[13px] text-[#787774] transition-colors hover:border-[#E87932] hover:text-[#252525] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]">
              <Upload className="h-4 w-4 text-[#E87932]" />
              <span>
                {selectedRestoreFile
                  ? `File dipilih: ${selectedRestoreFile}`
                  : 'Pilih file backup (.sql / .zip) untuk simulasi'}
              </span>
              <input
                type="file"
                accept=".sql,.zip"
                onChange={handleFilePick}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <Button
              variant="danger"
              size="sm"
              disabled={!selectedRestoreFile}
              onClick={() => setRestoreConfirmOpen(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Simulasikan Restore
            </Button>
          </div>
        </section>
      </div>

      <DataTable
        rows={backupLogs}
        columns={columns}
        rowKey={(b) => b.id}
        emptyMessage="Belum ada riwayat backup."
      />

      <ConfirmDialog
        open={restoreConfirmOpen}
        title="Konfirmasi Simulasi Restore Database"
        message={`Data saat ini akan dipulihkan menggunakan file "${selectedRestoreFile}" setelah membuat backup pengaman otomatis (simulasi UI).`}
        confirmLabel="Ya, Jalankan Simulasi Restore"
        onConfirm={() => {
          runSimulatedRestore(selectedRestoreFile);
          setRestoreConfirmOpen(false);
        }}
        onCancel={() => setRestoreConfirmOpen(false)}
      />
    </div>
  );
}
