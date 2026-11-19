import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
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
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useFincopStore } from '../../hooks/useFincopStore';
import type {
  ExpenseRecord,
  NonRecurringCategory,
  RecurringCategory,
} from '../../types/finance';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat } from '../../utils/date';

const NON_RECURRING_CATEGORIES: NonRecurringCategory[] = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Kebutuhan pribadi',
  'Lainnya',
];

const RECURRING_CATEGORIES: RecurringCategory[] = [
  'WiFi',
  'Listrik',
  'BPJS',
  'Langganan aplikasi',
  'Hosting',
  'VPS',
  'Domain',
  'Lainnya',
];

const expenseSchema = z.object({
  kind: z.enum(['TIDAK_RUTIN', 'RUTIN']),
  title: z.string().min(2, 'Nama pengeluaran minimal 2 karakter'),
  category: z.string().min(1),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  dueDate: z.string().optional(),
  period: z.enum(['MINGGUAN', 'BULANAN', 'TAHUNAN']).optional(),
  walletId: z.string().min(1),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function ExpensesPage() {
  const {
    expenses,
    wallets,
    getWalletName,
    addExpense,
    updateExpense,
    deleteExpense,
    markRecurringPaid,
  } = useFincopStore();

  const [activeTab, setActiveTab] = useState<'TIDAK_RUTIN' | 'RUTIN'>('TIDAK_RUTIN');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRecord | null>(null);
  const [payTarget, setPayTarget] = useState<ExpenseRecord | null>(null);
  const [payWalletId, setPayWalletId] = useState<string>(wallets[0]?.id ?? '');

  const defaultWalletId = wallets[0]?.id ?? '';

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      kind: 'TIDAK_RUTIN' as 'TIDAK_RUTIN' | 'RUTIN',
      title: '',
      category: 'Makanan',
      amount: 0,
      date: '2026-11-18',
      dueDate: '2026-11-25',
      period: 'BULANAN' as const,
      walletId: defaultWalletId,
      notes: '',
    },
  });

  const watchKind = form.watch('kind');

  const openCreateModal = () => {
    setEditing(null);
    form.reset({
      kind: activeTab,
      title: '',
      category: activeTab === 'RUTIN' ? 'WiFi' : 'Makanan',
      amount: 0,
      date: '2026-11-18',
      dueDate: '2026-11-25',
      period: 'BULANAN',
      walletId: defaultWalletId,
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (row: ExpenseRecord) => {
    setEditing(row);
    form.reset({
      kind: row.kind,
      title: row.title,
      category: row.category,
      amount: row.amount,
      date: row.date,
      dueDate: row.dueDate ?? '2026-11-25',
      period: row.period ?? 'BULANAN',
      walletId: row.walletId,
      notes: row.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = form.handleSubmit((raw) => {
    const data = raw as ExpenseFormValues;
    const isRecurring = data.kind === 'RUTIN';
    const payload: Omit<ExpenseRecord, 'id'> = {
      title: data.title,
      kind: data.kind,
      category: data.category as RecurringCategory | NonRecurringCategory,
      amount: Number(data.amount),
      date: data.date,
      dueDate: isRecurring ? data.dueDate : undefined,
      period: isRecurring ? data.period : undefined,
      status: editing ? editing.status : isRecurring ? 'BELUM_DIBAYAR' : 'LUNAS',
      walletId: data.walletId,
      reminderDays: isRecurring ? [7, 3, 1] : undefined,
      notes: data.notes,
    };
    if (editing) {
      updateExpense(editing.id, payload);
    } else {
      addExpense(payload);
    }
    setModalOpen(false);
  });

  const filteredRows = useMemo(() => {
    return expenses.filter((item) => {
      if (item.kind !== activeTab) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.notes ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [expenses, activeTab, categoryFilter, statusFilter, search]);

  const nonRecurringTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.kind === 'TIDAK_RUTIN' && e.status === 'LUNAS')
        .reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const unpaidRecurringTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.kind === 'RUTIN' && e.status !== 'LUNAS')
        .reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const overdueCount = useMemo(
    () => expenses.filter((e) => e.kind === 'RUTIN' && e.status === 'TERLAMBAT').length,
    [expenses]
  );

  const renderStatusBadge = (row: ExpenseRecord) => {
    if (row.status === 'LUNAS') return <StatusBadge tone="success">Lunas</StatusBadge>;
    if (row.status === 'TERLAMBAT') return <StatusBadge tone="danger">Terlambat</StatusBadge>;
    return <StatusBadge tone="warning">Mendekati / Belum Bayar</StatusBadge>;
  };

  const columns: DataTableColumn<ExpenseRecord>[] = [
    {
      key: 'date',
      header: activeTab === 'RUTIN' ? 'Jatuh Tempo' : 'Tanggal',
      sortable: true,
      sortValue: (r) => (activeTab === 'RUTIN' ? r.dueDate ?? r.date : r.date),
      render: (r) => (
        <span className="whitespace-nowrap text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatTanggalSingkat(activeTab === 'RUTIN' ? r.dueDate ?? r.date : r.date)}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Nama Pengeluaran',
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
      render: (r) => <StatusBadge tone="neutral">{r.category}</StatusBadge>,
    },
    ...(activeTab === 'RUTIN'
      ? [
          {
            key: 'period',
            header: 'Periode',
            render: (r: ExpenseRecord) => (
              <span className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                {r.period ?? 'BULANAN'}
              </span>
            ),
          },
        ]
      : []),
    {
      key: 'walletId',
      header: 'Dompet',
      render: (r) => <span>{getWalletName(r.walletId)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => renderStatusBadge(r),
    },
    {
      key: 'amount',
      header: 'Nominal',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.amount,
      render: (r) => (
        <span className="font-mono font-medium text-[#D44C47]">-{formatRupiah(r.amount)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center justify-end gap-1">
          {r.kind === 'RUTIN' && r.status !== 'LUNAS' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPayTarget(r);
                setPayWalletId(r.walletId);
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tandai Sudah Dibayar
            </Button>
          ) : null}
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

  const categoryChoices =
    activeTab === 'RUTIN' ? RECURRING_CATEGORIES : NON_RECURRING_CATEGORIES;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengeluaran & Tagihan Rutin"
        subtitle="Pisahkan pengeluaran harian tidak rutin dengan jadwal tagihan rutin beserta pengingat jatuh tempo."
        actions={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" />
            {activeTab === 'RUTIN' ? 'Tambah Tagihan Rutin' : 'Tambah Pengeluaran'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Pengeluaran Tidak Rutin"
          value={formatRupiah(nonRecurringTotal)}
          helperText="Langsung memotong saldo saat dicatat"
          icon={ArrowUpRight}
          tone="danger"
        />
        <StatCard
          label="Tagihan Rutin Belum Dibayar"
          value={formatRupiah(unpaidRecurringTotal)}
          helperText="Saldo tidak berkurang sebelum dikonfirmasi bayar"
          icon={CalendarClock}
          tone="warning"
        />
        <StatCard
          label="Tagihan Terlambat"
          value={`${overdueCount} Tagihan`}
          helperText="Membutuhkan konfirmasi pembayaran segera"
          icon={AlertCircle}
          tone={overdueCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Tab Pengeluaran Tidak Rutin / Rutin */}
      <div className="flex items-center gap-1 border-b border-[#E9E9E7] dark:border-[#343434]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('TIDAK_RUTIN');
            setCategoryFilter('ALL');
            setStatusFilter('ALL');
          }}
          className={`border-b-2 px-3.5 py-2 text-[13px] font-medium transition-colors ${
            activeTab === 'TIDAK_RUTIN'
              ? 'border-[#E87932] text-[#E87932]'
              : 'border-transparent text-[#787774] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]'
          }`}
        >
          Pengeluaran Tidak Rutin
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('RUTIN');
            setCategoryFilter('ALL');
            setStatusFilter('ALL');
          }}
          className={`border-b-2 px-3.5 py-2 text-[13px] font-medium transition-colors ${
            activeTab === 'RUTIN'
              ? 'border-[#E87932] text-[#E87932]'
              : 'border-transparent text-[#787774] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]'
          }`}
        >
          Pengeluaran Rutin & Pengingat
        </button>
      </div>

      <DataTable
        rows={filteredRows}
        columns={columns}
        rowKey={(r) => r.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama pengeluaran atau kategori..."
        filterControls={
          <>
            <FilterDropdown
              ariaLabel="Filter kategori"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                ...categoryChoices.map((c) => ({ value: c, label: c })),
              ]}
            />
            {activeTab === 'RUTIN' ? (
              <FilterDropdown
                ariaLabel="Filter status tagihan"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: 'Semua Status' },
                  { value: 'TERLAMBAT', label: 'Terlambat' },
                  { value: 'BELUM_DIBAYAR', label: 'Belum Dibayar' },
                  { value: 'LUNAS', label: 'Lunas' },
                ]}
              />
            ) : null}
          </>
        }
        emptyMessage="Tidak ada data pengeluaran pada tab ini."
      />

      {/* Modal Tambah / Edit */}
      <FormModal
        open={modalOpen}
        title={
          editing
            ? 'Edit Pengeluaran'
            : watchKind === 'RUTIN'
              ? 'Tambah Jadwal Tagihan Rutin'
              : 'Tambah Pengeluaran Tidak Rutin'
        }
        subtitle={
          watchKind === 'RUTIN'
            ? 'Tagihan rutin tidak memotong saldo sampai Anda menekan "Tandai Sudah Dibayar".'
            : 'Pengeluaran tidak rutin langsung mengurangi saldo dompet terpilih.'
        }
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editing ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Jenis Pengeluaran"
              disabled={Boolean(editing)}
              options={[
                { value: 'TIDAK_RUTIN', label: 'Pengeluaran Tidak Rutin' },
                { value: 'RUTIN', label: 'Pengeluaran Rutin & Pengingat' },
              ]}
              {...form.register('kind')}
            />
            <Select
              label="Kategori"
              options={(watchKind === 'RUTIN'
                ? RECURRING_CATEGORIES
                : NON_RECURRING_CATEGORIES
              ).map((c) => ({ value: c, label: c }))}
              {...form.register('category')}
            />
          </div>

          <Input
            label="Nama Pengeluaran / Tagihan"
            placeholder={watchKind === 'RUTIN' ? 'Contoh: Internet Fiber Biznet' : 'Contoh: Makan Siang'}
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrencyInput
              label="Nominal"
              error={form.formState.errors.amount?.message}
              {...form.register('amount')}
            />
            <WalletSelector
              label={watchKind === 'RUTIN' ? 'Dompet Rencana Pembayaran' : 'Dompet Pembayaran'}
              {...form.register('walletId')}
            />
          </div>

          {watchKind === 'RUTIN' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Tanggal Catat" type="date" {...form.register('date')} />
              <Input label="Tanggal Jatuh Tempo" type="date" {...form.register('dueDate')} />
              <Select
                label="Periode"
                options={[
                  { value: 'MINGGUAN', label: 'Mingguan' },
                  { value: 'BULANAN', label: 'Bulanan' },
                  { value: 'TAHUNAN', label: 'Tahunan' },
                ]}
                {...form.register('period')}
              />
            </div>
          ) : (
            <Input
              label="Tanggal Pengeluaran"
              type="date"
              error={form.formState.errors.date?.message}
              {...form.register('date')}
            />
          )}

          <Input label="Catatan" placeholder="Opsional" {...form.register('notes')} />
        </form>
      </FormModal>

      {/* Modal Konfirmasi Pembayaran Tagihan Rutin */}
      <Modal
        open={Boolean(payTarget)}
        title="Konfirmasi Pembayaran Tagihan"
        subtitle={payTarget ? `Tagihan: ${payTarget.title}` : undefined}
        size="sm"
        onClose={() => setPayTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayTarget(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (payTarget) {
                  markRecurringPaid(payTarget.id, payWalletId);
                }
                setPayTarget(null);
              }}
            >
              Konfirmasi & Bayar
            </Button>
          </>
        }
      >
        {payTarget ? (
          <div className="space-y-3">
            <div className="rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] p-3 text-[13px] dark:border-[#343434] dark:bg-[#191919]">
              <p className="text-[#787774] dark:text-[#9B9B9B]">Nominal Tagihan</p>
              <p className="mt-0.5 font-mono text-[18px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                {formatRupiah(payTarget.amount)}
              </p>
            </div>
            <WalletSelector
              label="Pilih Dompet Pembayaran"
              value={payWalletId}
              onChange={(e) => setPayWalletId(e.target.value)}
            />
            <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
              Setelah dibayar, tagihan ini ditandai <strong>Lunas</strong>, saldo dompet berkurang, dan jadwal periode berikutnya dibuat otomatis.
            </p>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Data Pengeluaran?"
        message={
          deleteTarget
            ? `Catatan "${deleteTarget.title}" senilai ${formatRupiah(deleteTarget.amount)} akan dihapus dari daftar simulasi.`
            : ''
        }
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTarget) deleteExpense(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
