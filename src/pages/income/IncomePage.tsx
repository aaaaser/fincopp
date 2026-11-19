import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownLeft, Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
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
import type { IncomeCategory, IncomeRecord } from '../../types/finance';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat } from '../../utils/date';

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Gaji',
  'Freelance',
  'Pekerjaan sampingan',
  'Live streaming',
  'Bonus',
  'Hadiah',
  'Lainnya',
];

const incomeSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  title: z.string().min(2, 'Nama pemasukan minimal 2 karakter'),
  category: z.enum([
    'Gaji',
    'Freelance',
    'Pekerjaan sampingan',
    'Live streaming',
    'Bonus',
    'Hadiah',
    'Lainnya',
  ]),
  source: z.string().min(2, 'Sumber pemasukan wajib diisi'),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  walletId: z.string().min(1, 'Pilih dompet tujuan'),
  notes: z.string().optional(),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

export function IncomePage() {
  const { incomes, wallets, getWalletName, addIncome, updateIncome, deleteIncome } =
    useFincopStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [walletFilter, setWalletFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeRecord | null>(null);

  const defaultWalletId = wallets[0]?.id ?? '';

  const form = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: '2026-11-18',
      title: '',
      category: 'Gaji' as IncomeCategory,
      source: '',
      amount: 0,
      walletId: defaultWalletId,
      notes: '',
    },
  });

  const openCreateModal = () => {
    setEditing(null);
    form.reset({
      date: '2026-11-18',
      title: '',
      category: 'Freelance',
      source: '',
      amount: 0,
      walletId: defaultWalletId,
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (row: IncomeRecord) => {
    setEditing(row);
    form.reset({
      date: row.date,
      title: row.title,
      category: row.category,
      source: row.source,
      amount: row.amount,
      walletId: row.walletId,
      notes: row.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = form.handleSubmit((raw) => {
    const data = raw as IncomeFormValues;
    const payload = {
      date: data.date,
      title: data.title,
      category: data.category,
      source: data.source,
      amount: Number(data.amount),
      walletId: data.walletId,
      notes: data.notes,
    };
    if (editing) {
      updateIncome(editing.id, payload);
    } else {
      addIncome(payload);
    }
    setModalOpen(false);
  });

  const filteredRows = useMemo(() => {
    return incomes.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (walletFilter !== 'ALL' && item.walletId !== walletFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          (item.notes ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incomes, categoryFilter, walletFilter, search]);

  const monthlyTotal = useMemo(
    () =>
      incomes
        .filter((i) => i.date.startsWith('2026-11'))
        .reduce((sum, i) => sum + i.amount, 0),
    [incomes]
  );

  const annualTotal = useMemo(
    () =>
      incomes
        .filter((i) => i.date.startsWith('2026'))
        .reduce((sum, i) => sum + i.amount, 0),
    [incomes]
  );

  const filteredTotal = useMemo(
    () => filteredRows.reduce((sum, i) => sum + i.amount, 0),
    [filteredRows]
  );

  const columns: DataTableColumn<IncomeRecord>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      sortable: true,
      sortValue: (r) => r.date,
      render: (r) => (
        <span className="whitespace-nowrap text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatTanggalSingkat(r.date)}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Nama Pemasukan',
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <p className="font-medium text-[#252525] dark:text-[#E6E6E6]">{r.title}</p>
          {r.notes ? (
            <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">{r.notes}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortable: true,
      sortValue: (r) => r.category,
      render: (r) => <StatusBadge tone="success">{r.category}</StatusBadge>,
    },
    {
      key: 'source',
      header: 'Sumber',
      sortable: true,
      sortValue: (r) => r.source,
      render: (r) => <span>{r.source}</span>,
    },
    {
      key: 'walletId',
      header: 'Dompet Tujuan',
      render: (r) => <StatusBadge tone="neutral">{getWalletName(r.walletId)}</StatusBadge>,
    },
    {
      key: 'amount',
      header: 'Nominal',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.amount,
      render: (r) => (
        <span className="font-mono font-medium text-[#448361]">+{formatRupiah(r.amount)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(r)} aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(r)}
            aria-label="Hapus"
            className="text-[#D44C47]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemasukan"
        subtitle="Catat gaji, freelance, pekerjaan sampingan, bonus, dan pemasukan lain langsung ke dompet tujuan."
        actions={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" />
            Tambah Pemasukan
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Pemasukan Bulan Ini"
          value={formatRupiah(monthlyTotal)}
          helperText="November 2026"
          icon={ArrowDownLeft}
          tone="success"
        />
        <StatCard
          label="Rekap Pemasukan Tahunan"
          value={formatRupiah(annualTotal)}
          helperText="Sepanjang tahun 2026"
          icon={Calendar}
          tone="default"
        />
        <StatCard
          label="Total Sesuai Filter"
          value={formatRupiah(filteredTotal)}
          helperText={`${filteredRows.length} transaksi ditampilkan`}
          icon={ArrowDownLeft}
          tone="success"
        />
      </div>

      <DataTable
        rows={filteredRows}
        columns={columns}
        rowKey={(r) => r.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, sumber, atau catatan..."
        filterControls={
          <>
            <FilterDropdown
              ariaLabel="Filter kategori pemasukan"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                ...INCOME_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
            <FilterDropdown
              ariaLabel="Filter dompet tujuan"
              value={walletFilter}
              onChange={setWalletFilter}
              options={[
                { value: 'ALL', label: 'Semua Dompet' },
                ...wallets.map((w) => ({ value: w.id, label: w.name })),
              ]}
            />
          </>
        }
        emptyMessage="Belum ada data pemasukan yang sesuai filter."
      />

      <FormModal
        open={modalOpen}
        title={editing ? 'Edit Pemasukan' : 'Tambah Pemasukan Baru'}
        subtitle="Saldo dompet tujuan akan menyesuaikan otomatis (simulasi state lokal)"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editing ? 'Simpan Perubahan' : 'Simpan Pemasukan'}
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Tanggal"
              type="date"
              error={form.formState.errors.date?.message}
              {...form.register('date')}
            />
            <Select
              label="Kategori"
              options={INCOME_CATEGORIES.map((c) => ({ value: c, label: c }))}
              {...form.register('category')}
            />
          </div>
          <Input
            label="Nama Pemasukan"
            placeholder="Contoh: Proyek Website Company Profile"
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <Input
            label="Sumber Pemasukan"
            placeholder="Contoh: PT Maju Bersama"
            error={form.formState.errors.source?.message}
            {...form.register('source')}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrencyInput
              label="Nominal"
              error={form.formState.errors.amount?.message}
              {...form.register('amount')}
            />
            <WalletSelector
              label="Dompet Tujuan"
              error={form.formState.errors.walletId?.message}
              {...form.register('walletId')}
            />
          </div>
          <Input label="Catatan" placeholder="Opsional" {...form.register('notes')} />
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Data Pemasukan?"
        message={
          deleteTarget
            ? `Catatan "${deleteTarget.title}" senilai ${formatRupiah(deleteTarget.amount)} akan dihapus dan saldo dompet ${getWalletName(deleteTarget.walletId)} disesuaikan.`
            : ''
        }
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTarget) deleteIncome(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
