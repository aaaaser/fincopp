import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Eye, HandCoins, Plus } from 'lucide-react';
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
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { DebtKind, DebtRecord, DebtStatus } from '../../types/finance';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat } from '../../utils/date';

const debtSchema = z.object({
  kind: z.enum(['UTANG', 'PIUTANG']),
  partyName: z.string().min(2, 'Nama pihak minimal 2 karakter'),
  initialAmount: z.coerce.number().positive('Nominal awal harus lebih dari 0'),
  loanDate: z.string().min(1, 'Tanggal pinjaman wajib diisi'),
  dueDate: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  date: z.string().min(1, 'Tanggal pembayaran wajib diisi'),
  amount: z.coerce.number().positive('Nominal pembayaran harus lebih dari 0'),
  walletId: z.string().min(1, 'Pilih dompet'),
  notes: z.string().optional(),
});

type DebtFormValues = z.infer<typeof debtSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

export function DebtsPage() {
  const { debts, wallets, getWalletName, addDebt, addDebtPayment } = useFincopStore();
  const [activeTab, setActiveTab] = useState<DebtKind>('UTANG');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailDebtId, setDetailDebtId] = useState<string | null>(null);
  const [payDebt, setPayDebt] = useState<DebtRecord | null>(null);

  const defaultWalletId = wallets[0]?.id ?? '';

  const debtForm = useForm({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      kind: 'UTANG' as DebtKind,
      partyName: '',
      initialAmount: 0,
      loanDate: '2026-11-18',
      dueDate: '2026-11-30',
      notes: '',
    },
  });

  const payForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: '2026-11-18',
      amount: 0,
      walletId: defaultWalletId,
      notes: '',
    },
  });

  const detailDebt = useMemo(
    () => debts.find((d) => d.id === detailDebtId) ?? null,
    [debts, detailDebtId]
  );

  const openAddModal = () => {
    debtForm.reset({
      kind: activeTab,
      partyName: '',
      initialAmount: 0,
      loanDate: '2026-11-18',
      dueDate: '2026-11-30',
      notes: '',
    });
    setAddModalOpen(true);
  };

  const openPaymentModal = (debt: DebtRecord) => {
    setPayDebt(debt);
    payForm.reset({
      date: '2026-11-18',
      amount: debt.remainingAmount,
      walletId: defaultWalletId,
      notes: '',
    });
  };

  const handleAddDebt = debtForm.handleSubmit((raw) => {
    const data = raw as DebtFormValues;
    addDebt({
      kind: data.kind,
      partyName: data.partyName,
      initialAmount: Number(data.initialAmount),
      loanDate: data.loanDate,
      dueDate: data.dueDate,
      notes: data.notes,
    });
    setAddModalOpen(false);
  });

  const handleAddPayment = payForm.handleSubmit((raw) => {
    if (!payDebt) return;
    const data = raw as PaymentFormValues;
    const ok = addDebtPayment(payDebt.id, {
      date: data.date,
      amount: Number(data.amount),
      walletId: data.walletId,
      notes: data.notes,
    });
    if (ok) {
      setPayDebt(null);
    }
  });

  const filteredRows = useMemo(() => {
    return debts.filter((d) => {
      if (d.kind !== activeTab) return false;
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.partyName.toLowerCase().includes(q) ||
          (d.notes ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [debts, activeTab, statusFilter, search]);

  const totalUtangAktif = useMemo(
    () =>
      debts
        .filter((d) => d.kind === 'UTANG' && d.status !== 'LUNAS')
        .reduce((s, d) => s + d.remainingAmount, 0),
    [debts]
  );

  const totalPiutangAktif = useMemo(
    () =>
      debts
        .filter((d) => d.kind === 'PIUTANG' && d.status !== 'LUNAS')
        .reduce((s, d) => s + d.remainingAmount, 0),
    [debts]
  );

  const overdueCount = useMemo(
    () => debts.filter((d) => d.status === 'TERLAMBAT').length,
    [debts]
  );

  const renderStatus = (status: DebtStatus) => {
    if (status === 'LUNAS') return <StatusBadge tone="success">Lunas</StatusBadge>;
    if (status === 'SEBAGIAN') return <StatusBadge tone="accent">Sebagian</StatusBadge>;
    if (status === 'TERLAMBAT') return <StatusBadge tone="danger">Terlambat</StatusBadge>;
    return <StatusBadge tone="warning">Belum Lunas</StatusBadge>;
  };

  const columns: DataTableColumn<DebtRecord>[] = [
    {
      key: 'partyName',
      header: 'Nama Pihak',
      sortable: true,
      sortValue: (d) => d.partyName,
      render: (d) => (
        <div>
          <p className="font-medium text-[#252525] dark:text-[#E6E6E6]">{d.partyName}</p>
          {d.notes ? (
            <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">{d.notes}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'loanDate',
      header: 'Tanggal Pinjam',
      sortable: true,
      sortValue: (d) => d.loanDate,
      render: (d) => (
        <span className="text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatTanggalSingkat(d.loanDate)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Jatuh Tempo',
      sortable: true,
      sortValue: (d) => d.dueDate,
      render: (d) => (
        <span className="text-[#787774] tabular-nums dark:text-[#9B9B9B]">
          {formatTanggalSingkat(d.dueDate)}
        </span>
      ),
    },
    {
      key: 'initialAmount',
      header: 'Nominal Awal',
      align: 'right',
      sortable: true,
      sortValue: (d) => d.initialAmount,
      render: (d) => <span className="font-mono">{formatRupiah(d.initialAmount)}</span>,
    },
    {
      key: 'remainingAmount',
      header: 'Sisa Pembayaran',
      align: 'right',
      sortable: true,
      sortValue: (d) => d.remainingAmount,
      render: (d) => (
        <span
          className={`font-mono font-semibold ${
            d.remainingAmount === 0
              ? 'text-[#448361]'
              : d.kind === 'UTANG'
                ? 'text-[#D44C47]'
                : 'text-[#E87932]'
          }`}
        >
          {formatRupiah(d.remainingAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => renderStatus(d.status),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (d) => (
        <div className="inline-flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetailDebtId(d.id)}>
            <Eye className="h-3.5 w-3.5" />
            Detail
          </Button>
          {d.status !== 'LUNAS' ? (
            <Button variant="primary" size="sm" onClick={() => openPaymentModal(d)}>
              <CreditCard className="h-3.5 w-3.5" />
              {d.kind === 'UTANG' ? 'Bayar Cicilan' : 'Terima Bayar'}
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utang & Piutang"
        subtitle="Pantau kewajiban utang dan tagihan piutang beserta cicilan bertahap atau pelunasan dari dompet."
        actions={
          <Button variant="primary" size="sm" onClick={openAddModal}>
            <Plus className="h-3.5 w-3.5" />
            Catat {activeTab === 'UTANG' ? 'Utang' : 'Piutang'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Sisa Utang"
          value={formatRupiah(totalUtangAktif)}
          helperText="Kewajiban yang harus dibayar"
          icon={HandCoins}
          tone="danger"
        />
        <StatCard
          label="Total Sisa Piutang"
          value={formatRupiah(totalPiutangAktif)}
          helperText="Tagihan yang akan diterima"
          icon={HandCoins}
          tone="warning"
        />
        <StatCard
          label="Catatan Terlambat"
          value={`${overdueCount} Catatan`}
          helperText="Melewati tanggal jatuh tempo"
          icon={HandCoins}
          tone={overdueCount > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="flex items-center gap-1 border-b border-[#E9E9E7] dark:border-[#343434]">
        <button
          type="button"
          onClick={() => setActiveTab('UTANG')}
          className={`border-b-2 px-3.5 py-2 text-[13px] font-medium transition-colors ${
            activeTab === 'UTANG'
              ? 'border-[#E87932] text-[#E87932]'
              : 'border-transparent text-[#787774] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]'
          }`}
        >
          Daftar Utang
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PIUTANG')}
          className={`border-b-2 px-3.5 py-2 text-[13px] font-medium transition-colors ${
            activeTab === 'PIUTANG'
              ? 'border-[#E87932] text-[#E87932]'
              : 'border-transparent text-[#787774] hover:text-[#252525] dark:text-[#9B9B9B] dark:hover:text-[#E6E6E6]'
          }`}
        >
          Daftar Piutang
        </button>
      </div>

      <DataTable
        rows={filteredRows}
        columns={columns}
        rowKey={(d) => d.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama pihak atau keterangan..."
        filterControls={
          <FilterDropdown
            ariaLabel="Filter status utang piutang"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'ALL', label: 'Semua Status' },
              { value: 'BELUM_LUNAS', label: 'Belum Lunas' },
              { value: 'SEBAGIAN', label: 'Sebagian' },
              { value: 'TERLAMBAT', label: 'Terlambat' },
              { value: 'LUNAS', label: 'Lunas' },
            ]}
          />
        }
        emptyMessage="Belum ada data pada tab ini."
      />

      {/* Modal Catat Utang/Piutang */}
      <FormModal
        open={addModalOpen}
        title="Catat Utang / Piutang Baru"
        subtitle="Disimpan ke state lokal untuk simulasi cicilan"
        onClose={() => setAddModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleAddDebt}>
              Simpan
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleAddDebt}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Jenis"
              options={[
                { value: 'UTANG', label: 'Utang (Kewajiban Saya)' },
                { value: 'PIUTANG', label: 'Piutang (Tagihan ke Orang Lain)' },
              ]}
              {...debtForm.register('kind')}
            />
            <Input
              label="Nama Pihak"
              placeholder="Contoh: Rizky Pratama"
              error={debtForm.formState.errors.partyName?.message}
              {...debtForm.register('partyName')}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CurrencyInput
              label="Nominal Awal"
              error={debtForm.formState.errors.initialAmount?.message}
              {...debtForm.register('initialAmount')}
            />
            <Input label="Tanggal Pinjaman" type="date" {...debtForm.register('loanDate')} />
            <Input label="Jatuh Tempo" type="date" {...debtForm.register('dueDate')} />
          </div>
          <Input label="Keterangan" placeholder="Opsional" {...debtForm.register('notes')} />
        </form>
      </FormModal>

      {/* Modal Detail & Riwayat Pembayaran */}
      <Modal
        open={Boolean(detailDebt)}
        title={detailDebt ? `Detail ${detailDebt.kind === 'UTANG' ? 'Utang' : 'Piutang'}: ${detailDebt.partyName}` : ''}
        subtitle={detailDebt ? `Jatuh tempo ${formatTanggalSingkat(detailDebt.dueDate)}` : undefined}
        size="lg"
        onClose={() => setDetailDebtId(null)}
        footer={
          <div className="flex w-full items-center justify-between">
            <div>
              {detailDebt && detailDebt.status !== 'LUNAS' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const target = detailDebt;
                    setDetailDebtId(null);
                    openPaymentModal(target);
                  }}
                >
                  {detailDebt.kind === 'UTANG' ? 'Bayar Cicilan / Lunasi' : 'Catat Penerimaan'}
                </Button>
              ) : null}
            </div>
            <Button variant="secondary" onClick={() => setDetailDebtId(null)}>
              Tutup
            </Button>
          </div>
        }
      >
        {detailDebt ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] p-3 dark:border-[#343434] dark:bg-[#191919]">
              <div>
                <p className="text-[11px] text-[#787774] dark:text-[#9B9B9B]">Nominal Awal</p>
                <p className="font-mono text-[15px] font-semibold">
                  {formatRupiah(detailDebt.initialAmount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#787774] dark:text-[#9B9B9B]">Sudah Dibayar</p>
                <p className="font-mono text-[15px] font-semibold text-[#448361]">
                  {formatRupiah(detailDebt.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#787774] dark:text-[#9B9B9B]">Sisa Pembayaran</p>
                <p className="font-mono text-[15px] font-semibold text-[#E87932]">
                  {formatRupiah(detailDebt.remainingAmount)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-[13px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                Riwayat Pembayaran
              </h4>
              <div className="overflow-x-auto border border-[#E9E9E7] dark:border-[#343434]">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] text-[#787774] dark:border-[#343434] dark:bg-[#191919] dark:text-[#9B9B9B]">
                      <th className="px-3 py-2 font-medium">Tanggal</th>
                      <th className="px-3 py-2 font-medium">Dompet</th>
                      <th className="px-3 py-2 font-medium">Catatan</th>
                      <th className="px-3 py-2 text-right font-medium">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
                    {detailDebt.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2 tabular-nums">
                          {formatTanggalSingkat(p.date)}
                        </td>
                        <td className="px-3 py-2">{getWalletName(p.walletId)}</td>
                        <td className="px-3 py-2 text-[#787774] dark:text-[#9B9B9B]">
                          {p.notes || '-'}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium">
                          {formatRupiah(p.amount)}
                        </td>
                      </tr>
                    ))}
                    {detailDebt.payments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-5 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]"
                        >
                          Belum ada riwayat cicilan / pembayaran.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modal Bayar Cicilan / Pelunasan */}
      <FormModal
        open={Boolean(payDebt)}
        title={
          payDebt
            ? payDebt.kind === 'UTANG'
              ? `Bayar Cicilan Utang: ${payDebt.partyName}`
              : `Terima Pembayaran Piutang: ${payDebt.partyName}`
            : ''
        }
        subtitle={
          payDebt ? `Sisa saat ini: ${formatRupiah(payDebt.remainingAmount)}` : undefined
        }
        size="sm"
        onClose={() => setPayDebt(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayDebt(null)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleAddPayment}>
              Konfirmasi Pembayaran
            </Button>
          </>
        }
      >
        {payDebt ? (
          <form className="space-y-3" onSubmit={handleAddPayment}>
            <div className="flex items-center justify-between rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-2 text-[12px] dark:border-[#343434] dark:bg-[#191919]">
              <span className="text-[#787774] dark:text-[#9B9B9B]">Sisa tagihan</span>
              <button
                type="button"
                onClick={() => payForm.setValue('amount', payDebt.remainingAmount)}
                className="font-mono font-semibold text-[#E87932] hover:underline"
              >
                Isi Lunas ({formatRupiah(payDebt.remainingAmount)})
              </button>
            </div>
            <CurrencyInput
              label="Nominal Pembayaran"
              error={payForm.formState.errors.amount?.message}
              {...payForm.register('amount')}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <WalletSelector
                label={payDebt.kind === 'UTANG' ? 'Dompet Sumber' : 'Dompet Penerima'}
                {...payForm.register('walletId')}
              />
              <Input label="Tanggal" type="date" {...payForm.register('date')} />
            </div>
            <Input label="Catatan" placeholder="Contoh: Cicilan ke-2" {...payForm.register('notes')} />
          </form>
        ) : null}
      </FormModal>
    </div>
  );
}
