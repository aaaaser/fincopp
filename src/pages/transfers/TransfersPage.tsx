import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftRight, ArrowRight, Info, Plus } from 'lucide-react';
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
import { useFincopStore } from '../../hooks/useFincopStore';
import type { WalletTransfer } from '../../types/finance';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat } from '../../utils/date';

const transferSchema = z
  .object({
    fromWalletId: z.string().min(1, 'Pilih dompet asal'),
    toWalletId: z.string().min(1, 'Pilih dompet tujuan'),
    amount: z.coerce.number().positive('Nominal transfer harus lebih dari 0'),
    fee: z.coerce.number().min(0, 'Biaya transfer tidak boleh negatif'),
    date: z.string().min(1, 'Tanggal wajib diisi'),
    notes: z.string().optional(),
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: 'Dompet asal dan tujuan harus berbeda',
    path: ['toWalletId'],
  });

type TransferFormValues = z.infer<typeof transferSchema>;

export function TransfersPage() {
  const { transfers, wallets, getWalletName, addTransfer } = useFincopStore();
  const [search, setSearch] = useState('');
  const [walletFilter, setWalletFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const firstWalletId = wallets[0]?.id ?? '';
  const secondWalletId = wallets[1]?.id ?? firstWalletId;

  const form = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWalletId: firstWalletId,
      toWalletId: secondWalletId,
      amount: 0,
      fee: 0,
      date: '2026-11-18',
      notes: '',
    },
  });

  const openModal = () => {
    form.reset({
      fromWalletId: firstWalletId,
      toWalletId: secondWalletId,
      amount: 0,
      fee: 0,
      date: '2026-11-18',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = form.handleSubmit((raw) => {
    const data = raw as TransferFormValues;
    const ok = addTransfer({
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      amount: Number(data.amount),
      fee: Number(data.fee),
      date: data.date,
      notes: data.notes,
    });
    if (ok) {
      setModalOpen(false);
    }
  });

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      if (
        walletFilter !== 'ALL' &&
        t.fromWalletId !== walletFilter &&
        t.toWalletId !== walletFilter
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          getWalletName(t.fromWalletId).toLowerCase().includes(q) ||
          getWalletName(t.toWalletId).toLowerCase().includes(q) ||
          (t.notes ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transfers, walletFilter, search, getWalletName]);

  const totalVolume = useMemo(
    () => transfers.reduce((sum, t) => sum + t.amount, 0),
    [transfers]
  );

  const totalFee = useMemo(() => transfers.reduce((sum, t) => sum + t.fee, 0), [transfers]);

  const columns: DataTableColumn<WalletTransfer>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      sortable: true,
      sortValue: (t) => t.date,
      render: (t) => (
        <span className="whitespace-nowrap text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatTanggalSingkat(t.date)}
        </span>
      ),
    },
    {
      key: 'route',
      header: 'Alur Dompet',
      render: (t) => (
        <div className="flex items-center gap-2 font-medium">
          <span>{getWalletName(t.fromWalletId)}</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#E87932]" aria-hidden="true" />
          <span>{getWalletName(t.toWalletId)}</span>
        </div>
      ),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (t) => (
        <span className="text-[#787774] dark:text-[#9B9B9B]">{t.notes || '-'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Nominal Transfer',
      align: 'right',
      sortable: true,
      sortValue: (t) => t.amount,
      render: (t) => <span className="font-mono font-medium">{formatRupiah(t.amount)}</span>,
    },
    {
      key: 'fee',
      header: 'Biaya Admin',
      align: 'right',
      sortable: true,
      sortValue: (t) => t.fee,
      render: (t) => (
        <span className="font-mono text-[#787774] dark:text-[#9B9B9B]">
          {formatRupiah(t.fee)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge tone="success">Selesai</StatusBadge>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfer Antar-Dompet"
        subtitle="Pindahkan saldo antar dompet (misal BCA → DANA atau BCA → Tunai) tanpa memengaruhi total pemasukan atau pengeluaran."
        actions={
          <Button variant="primary" size="sm" onClick={openModal}>
            <Plus className="h-3.5 w-3.5" />
            Transfer Saldo
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-4 py-3 text-[13px] text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#E87932]" aria-hidden="true" />
        <p>
          Transfer internal hanya memindahkan saldo antar dompet dan <strong className="text-[#252525] dark:text-[#E6E6E6]">tidak dihitung sebagai Pemasukan maupun Pengeluaran</strong> pada laporan arus kas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Volume Transfer"
          value={formatRupiah(totalVolume)}
          helperText={`${transfers.length} kali transfer tercatat`}
          icon={ArrowLeftRight}
        />
        <StatCard
          label="Total Biaya Transfer"
          value={formatRupiah(totalFee)}
          helperText="Akumulasi biaya admin bank / top-up"
          icon={ArrowLeftRight}
          tone="warning"
        />
        <StatCard
          label="Dompet Aktif Tersedia"
          value={`${wallets.filter((w) => w.isActive).length} Dompet`}
          helperText="Siap untuk perpindahan saldo"
          icon={ArrowLeftRight}
        />
      </div>

      <DataTable
        rows={filteredTransfers}
        columns={columns}
        rowKey={(t) => t.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari dompet atau catatan transfer..."
        filterControls={
          <FilterDropdown
            ariaLabel="Filter dompet transfer"
            value={walletFilter}
            onChange={setWalletFilter}
            options={[
              { value: 'ALL', label: 'Semua Dompet' },
              ...wallets.map((w) => ({ value: w.id, label: w.name })),
            ]}
          />
        }
        emptyMessage="Belum ada riwayat transfer antar-dompet."
      />

      <FormModal
        open={modalOpen}
        title="Transfer Antar-Dompet"
        subtitle="Saldo dompet asal berkurang (nominal + biaya), dompet tujuan bertambah (nominal)"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Proses Transfer
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <WalletSelector
              label="Dompet Asal"
              error={form.formState.errors.fromWalletId?.message}
              {...form.register('fromWalletId')}
            />
            <WalletSelector
              label="Dompet Tujuan"
              error={form.formState.errors.toWalletId?.message}
              {...form.register('toWalletId')}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CurrencyInput
              label="Nominal"
              error={form.formState.errors.amount?.message}
              {...form.register('amount')}
            />
            <CurrencyInput
              label="Biaya Transfer"
              error={form.formState.errors.fee?.message}
              {...form.register('fee')}
            />
            <Input
              label="Tanggal"
              type="date"
              error={form.formState.errors.date?.message}
              {...form.register('date')}
            />
          </div>
          <Input label="Catatan" placeholder="Contoh: Top up e-wallet" {...form.register('notes')} />
        </form>
      </FormModal>
    </div>
  );
}
