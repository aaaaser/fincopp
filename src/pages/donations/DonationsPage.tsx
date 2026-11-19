import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, Gift, Info, ListOrdered, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { FormModal } from '../../components/forms/FormModal';
import { WalletSelector } from '../../components/forms/WalletSelector';
import { DataTable, type DataTableColumn } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { DonationRecord, StreamPlatform } from '../../types/finance';
import { calculateMatchAllocation, formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat } from '../../utils/date';

const donationSchema = z.object({
  nickname: z.string().min(2, 'Nickname penonton minimal 2 karakter'),
  platform: z.enum(['TikTok', 'YouTube', 'Lainnya']),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  amount: z.coerce.number().min(100, 'Nominal minimal Rp100'),
  walletId: z.string().min(1, 'Pilih dompet penerima'),
  pricePerMatch: z.coerce.number().positive('Harga per match minimal Rp1'),
  notes: z.string().optional(),
});

type DonationFormValues = z.infer<typeof donationSchema>;

export function DonationsPage() {
  const { donations, settings, getWalletName, addDonation } = useFincopStore();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      nickname: '',
      platform: 'TikTok' as StreamPlatform,
      date: '2026-11-18',
      amount: 10000,
      walletId: 'w-dana',
      pricePerMatch: settings.pricePerMatch,
      notes: '',
    },
  });

  const watchAmount = Number(form.watch('amount') || 0);
  const watchPrice = Math.max(1, Number(form.watch('pricePerMatch') || settings.pricePerMatch));
  const liveCalc = useMemo(() => {
    try {
      return calculateMatchAllocation(Math.max(0, watchAmount), watchPrice);
    } catch {
      return { matchCount: 0, remainderRupiah: 0 };
    }
  }, [watchAmount, watchPrice]);

  const openModal = () => {
    form.reset({
      nickname: '',
      platform: 'TikTok',
      date: '2026-11-18',
      amount: 10000,
      walletId: 'w-dana',
      pricePerMatch: settings.pricePerMatch,
      notes: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = form.handleSubmit((raw) => {
    const data = raw as DonationFormValues;
    addDonation({
      nickname: data.nickname,
      platform: data.platform,
      date: data.date,
      amount: Number(data.amount),
      walletId: data.walletId,
      pricePerMatch: Number(data.pricePerMatch),
      notes: data.notes,
    });
    setModalOpen(false);
  });

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (platformFilter !== 'ALL' && d.platform !== platformFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.nickname.toLowerCase().includes(q) ||
          (d.notes ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [donations, platformFilter, search]);

  const totalDonationAmount = useMemo(
    () => donations.reduce((s, d) => s + d.amount, 0),
    [donations]
  );

  const totalMatchesGenerated = useMemo(
    () => donations.reduce((s, d) => s + d.matchCount, 0),
    [donations]
  );

  const totalRemainder = useMemo(
    () => donations.reduce((s, d) => s + d.remainderAmount, 0),
    [donations]
  );

  const columns: DataTableColumn<DonationRecord>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      sortable: true,
      sortValue: (d) => d.date,
      render: (d) => (
        <span className="whitespace-nowrap text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatTanggalSingkat(d.date)}
        </span>
      ),
    },
    {
      key: 'nickname',
      header: 'Nickname Penonton',
      sortable: true,
      sortValue: (d) => d.nickname,
      render: (d) => (
        <div>
          <p className="font-medium text-[#252525] dark:text-[#E6E6E6]">{d.nickname}</p>
          {d.notes ? (
            <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">{d.notes}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'platform',
      header: 'Platform',
      sortable: true,
      sortValue: (d) => d.platform,
      render: (d) => (
        <StatusBadge
          tone={d.platform === 'TikTok' ? 'accent' : d.platform === 'YouTube' ? 'danger' : 'neutral'}
        >
          {d.platform}
        </StatusBadge>
      ),
    },
    {
      key: 'walletId',
      header: 'Dompet Penerima',
      render: (d) => <StatusBadge tone="neutral">{getWalletName(d.walletId)}</StatusBadge>,
    },
    {
      key: 'matchCount',
      header: 'Konversi Match',
      align: 'right',
      sortable: true,
      sortValue: (d) => d.matchCount,
      render: (d) => (
        <span className="font-mono font-semibold text-[#E87932]">
          {d.matchCount} match
        </span>
      ),
    },
    {
      key: 'remainderAmount',
      header: 'Sisa Nominal',
      align: 'right',
      render: (d) => (
        <span className="font-mono text-[#787774] dark:text-[#9B9B9B]">
          {formatRupiah(d.remainderAmount)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Nominal Donasi',
      align: 'right',
      sortable: true,
      sortValue: (d) => d.amount,
      render: (d) => (
        <span className="font-mono font-medium text-[#448361]">+{formatRupiah(d.amount)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donasi Live Streaming"
        subtitle="Input donasi penonton TikTok atau YouTube secara manual; saldo dompet bertambah dan antrean mabar FIFO dibuat otomatis."
        actions={
          <Button variant="primary" size="sm" onClick={openModal}>
            <Plus className="h-3.5 w-3.5" />
            Input Donasi Baru
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-4 py-3 text-[13px] text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#E87932]" aria-hidden="true" />
        <p>
          Donasi langsung menambah saldo dompet penerima dan menghitung hak mabar (<strong className="text-[#252525] dark:text-[#E6E6E6]">1 match = {formatRupiah(settings.pricePerMatch)}</strong>). Data donasi <strong className="text-[#252525] dark:text-[#E6E6E6]">tidak dicatat ganda</strong> ke tabel Pemasukan umum.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Donasi Tercatat"
          value={formatRupiah(totalDonationAmount)}
          helperText={`${donations.length} transaksi donasi`}
          icon={Gift}
          tone="success"
        />
        <StatCard
          label="Total Match Terbentuk"
          value={`${totalMatchesGenerated} Match`}
          helperText={`Tarif aktif ${formatRupiah(settings.pricePerMatch)} / match`}
          icon={ListOrdered}
          tone="default"
        />
        <StatCard
          label="Total Sisa Pecahan"
          value={formatRupiah(totalRemainder)}
          helperText="Sisa nominal di bawah harga per match"
          icon={Calculator}
          tone="warning"
        />
      </div>

      <DataTable
        rows={filteredDonations}
        columns={columns}
        rowKey={(d) => d.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nickname penonton atau catatan..."
        filterControls={
          <FilterDropdown
            ariaLabel="Filter platform donasi"
            value={platformFilter}
            onChange={setPlatformFilter}
            options={[
              { value: 'ALL', label: 'Semua Platform' },
              { value: 'TikTok', label: 'TikTok' },
              { value: 'YouTube', label: 'YouTube' },
              { value: 'Lainnya', label: 'Lainnya' },
            ]}
          />
        }
        emptyMessage="Belum ada data donasi live streaming."
      />

      <FormModal
        open={modalOpen}
        title="Input Donasi Live Streaming"
        subtitle="Konversi otomatis FLOOR(nominal / harga per match) & masuk antrean FIFO"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Simpan & Masuk Antrean
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Nickname Penonton"
              placeholder="Contoh: BangAldo_99"
              error={form.formState.errors.nickname?.message}
              {...form.register('nickname')}
            />
            <Select
              label="Platform"
              options={[
                { value: 'TikTok', label: 'TikTok' },
                { value: 'YouTube', label: 'YouTube' },
                { value: 'Lainnya', label: 'Lainnya' },
              ]}
              {...form.register('platform')}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrencyInput
              label="Nominal Donasi"
              error={form.formState.errors.amount?.message}
              {...form.register('amount')}
            />
            <WalletSelector
              label="Dompet Penerima"
              error={form.formState.errors.walletId?.message}
              {...form.register('walletId')}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrencyInput
              label="Harga per Match"
              error={form.formState.errors.pricePerMatch?.message}
              {...form.register('pricePerMatch')}
            />
            <Input
              label="Tanggal"
              type="date"
              error={form.formState.errors.date?.message}
              {...form.register('date')}
            />
          </div>

          <div className="rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] p-3 dark:border-[#343434] dark:bg-[#191919]">
            <p className="text-[12px] font-medium text-[#787774] dark:text-[#9B9B9B]">
              Pratinjau Konversi Otomatis
            </p>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="font-mono text-[16px] font-semibold text-[#E87932]">
                {liveCalc.matchCount} Match Mabar
              </span>
              <span className="font-mono text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                Sisa: {formatRupiah(liveCalc.remainderRupiah)}
              </span>
            </div>
          </div>

          <Input label="Catatan" placeholder="Opsional" {...form.register('notes')} />
        </form>
      </FormModal>
    </div>
  );
}
