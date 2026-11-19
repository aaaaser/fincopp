import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Building2, Eye, Pencil, Plus, Smartphone, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { FormModal } from '../../components/forms/FormModal';
import { DataTable, type DataTableColumn } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useFincopStore } from '../../hooks/useFincopStore';
import type { Wallet, WalletType } from '../../types/finance';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat } from '../../utils/date';

const walletSchema = z.object({
  name: z.string().min(2, 'Nama dompet minimal 2 karakter'),
  type: z.enum(['BANK', 'CASH', 'EWALLET', 'OTHER']),
  initialBalance: z.coerce.number().min(0, 'Saldo awal tidak boleh negatif'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type WalletFormValues = z.infer<typeof walletSchema>;

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  BANK: 'Bank',
  CASH: 'Tunai',
  EWALLET: 'E-wallet',
  OTHER: 'Lainnya',
};

export function WalletsPage() {
  const {
    wallets,
    incomes,
    expenses,
    transfers,
    donations,
    debts,
    getWalletName,
    addWallet,
    updateWallet,
  } = useFincopStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [detailWallet, setDetailWallet] = useState<Wallet | null>(null);

  const form = useForm({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      type: 'BANK' as WalletType,
      initialBalance: 0,
      description: '',
      isActive: true,
    },
  });

  const openCreateModal = () => {
    setEditingWallet(null);
    form.reset({
      name: '',
      type: 'BANK',
      initialBalance: 0,
      description: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (wallet: Wallet) => {
    setEditingWallet(wallet);
    form.reset({
      name: wallet.name,
      type: wallet.type,
      initialBalance: wallet.initialBalance,
      description: wallet.description ?? '',
      isActive: wallet.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = form.handleSubmit((data) => {
    const parsed = data as WalletFormValues;
    if (editingWallet) {
      updateWallet(editingWallet.id, {
        name: parsed.name,
        type: parsed.type,
        description: parsed.description,
        isActive: parsed.isActive,
      });
    } else {
      addWallet({
        name: parsed.name,
        type: parsed.type,
        initialBalance: Number(parsed.initialBalance),
        description: parsed.description,
        isActive: parsed.isActive,
      });
    }
    setModalOpen(false);
  });

  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      if (typeFilter !== 'ALL' && w.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          w.name.toLowerCase().includes(q) ||
          (w.description ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [wallets, typeFilter, search]);

  const totalCombined = useMemo(
    () => wallets.filter((w) => w.isActive).reduce((s, w) => s + w.currentBalance, 0),
    [wallets]
  );

  const walletHistory = useMemo(() => {
    if (!detailWallet) return [];
    const wid = detailWallet.id;
    const rows: Array<{ id: string; date: string; kind: string; desc: string; amount: number; sign: '+' | '-' }> = [];

    incomes
      .filter((i) => i.walletId === wid)
      .forEach((i) =>
        rows.push({
          id: i.id,
          date: i.date,
          kind: 'Pemasukan',
          desc: `${i.title} (${i.category})`,
          amount: i.amount,
          sign: '+',
        })
      );

    expenses
      .filter((e) => e.walletId === wid && e.status === 'LUNAS')
      .forEach((e) =>
        rows.push({
          id: e.id,
          date: e.date,
          kind: 'Pengeluaran',
          desc: `${e.title} (${e.category})`,
          amount: e.amount,
          sign: '-',
        })
      );

    transfers.forEach((t) => {
      if (t.fromWalletId === wid) {
        rows.push({
          id: `${t.id}-out`,
          date: t.date,
          kind: 'Transfer Keluar',
          desc: `Ke ${getWalletName(t.toWalletId)}${t.fee > 0 ? ` (biaya ${formatRupiah(t.fee)})` : ''}`,
          amount: t.amount + t.fee,
          sign: '-',
        });
      }
      if (t.toWalletId === wid) {
        rows.push({
          id: `${t.id}-in`,
          date: t.date,
          kind: 'Transfer Masuk',
          desc: `Dari ${getWalletName(t.fromWalletId)}`,
          amount: t.amount,
          sign: '+',
        });
      }
    });

    donations
      .filter((d) => d.walletId === wid)
      .forEach((d) =>
        rows.push({
          id: d.id,
          date: d.date,
          kind: 'Donasi Live',
          desc: `${d.nickname} (${d.platform})`,
          amount: d.amount,
          sign: '+',
        })
      );

    debts.forEach((debt) => {
      debt.payments
        .filter((p) => p.walletId === wid)
        .forEach((p) =>
          rows.push({
            id: p.id,
            date: p.date,
            kind: debt.kind === 'UTANG' ? 'Bayar Utang' : 'Terima Piutang',
            desc: debt.partyName,
            amount: p.amount,
            sign: debt.kind === 'UTANG' ? '-' : '+',
          })
        );
    });

    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [detailWallet, incomes, expenses, transfers, donations, debts, getWalletName]);

  const columns: DataTableColumn<Wallet>[] = [
    {
      key: 'name',
      header: 'Nama Dompet',
      sortable: true,
      sortValue: (w) => w.name,
      render: (w) => (
        <div>
          <p className="font-medium text-[#252525] dark:text-[#E6E6E6]">{w.name}</p>
          {w.description ? (
            <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">{w.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Jenis',
      sortable: true,
      sortValue: (w) => WALLET_TYPE_LABELS[w.type],
      render: (w) => <StatusBadge tone="neutral">{WALLET_TYPE_LABELS[w.type]}</StatusBadge>,
    },
    {
      key: 'initialBalance',
      header: 'Saldo Awal',
      align: 'right',
      sortable: true,
      sortValue: (w) => w.initialBalance,
      render: (w) => <span className="font-mono">{formatRupiah(w.initialBalance)}</span>,
    },
    {
      key: 'currentBalance',
      header: 'Saldo Saat Ini',
      align: 'right',
      sortable: true,
      sortValue: (w) => w.currentBalance,
      render: (w) => (
        <span className="font-mono font-semibold text-[#252525] dark:text-[#E6E6E6]">
          {formatRupiah(w.currentBalance)}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (w) => (
        <StatusBadge tone={w.isActive ? 'success' : 'neutral'}>
          {w.isActive ? 'Aktif' : 'Nonaktif'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (w) => (
        <div className="inline-flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDetailWallet(w);
            }}
            title="Lihat histori transaksi dompet"
          >
            <Eye className="h-3.5 w-3.5" />
            Histori
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(w);
            }}
            title="Edit dompet"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dompet Keuangan"
        subtitle="Kelola multi-dompet Bank, Tunai, dan E-wallet beserta histori arus dana masing-masing."
        actions={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5" />
            Tambah Dompet
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Saldo Aktif"
          value={formatRupiah(totalCombined)}
          helperText={`${wallets.filter((w) => w.isActive).length} dompet aktif`}
          icon={WalletCards}
        />
        <StatCard
          label="Rekening Bank"
          value={formatRupiah(
            wallets.filter((w) => w.type === 'BANK').reduce((s, w) => s + w.currentBalance, 0)
          )}
          helperText={`${wallets.filter((w) => w.type === 'BANK').length} dompet`}
          icon={Building2}
        />
        <StatCard
          label="Saldo E-wallet"
          value={formatRupiah(
            wallets.filter((w) => w.type === 'EWALLET').reduce((s, w) => s + w.currentBalance, 0)
          )}
          helperText={`${wallets.filter((w) => w.type === 'EWALLET').length} dompet`}
          icon={Smartphone}
        />
        <StatCard
          label="Uang Tunai"
          value={formatRupiah(
            wallets.filter((w) => w.type === 'CASH').reduce((s, w) => s + w.currentBalance, 0)
          )}
          helperText={`${wallets.filter((w) => w.type === 'CASH').length} dompet`}
          icon={Banknote}
        />
      </div>

      {/* Ringkasan Kartu Dompet Minimalis */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {wallets.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setDetailWallet(w)}
            className="flex flex-col justify-between rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 text-left transition-colors hover:border-[#E87932] dark:border-[#343434] dark:bg-[#191919]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                {w.name}
              </span>
              <StatusBadge tone={w.isActive ? 'accent' : 'neutral'}>
                {WALLET_TYPE_LABELS[w.type]}
              </StatusBadge>
            </div>
            <p className="mt-3 font-mono text-[18px] font-semibold text-[#252525] tabular-nums dark:text-[#E6E6E6]">
              {formatRupiah(w.currentBalance)}
            </p>
            <p className="mt-1 truncate text-[12px] text-[#787774] dark:text-[#9B9B9B]">
              {w.description || 'Klik untuk melihat histori transaksi'}
            </p>
          </button>
        ))}
      </div>

      <DataTable
        rows={filteredWallets}
        columns={columns}
        rowKey={(w) => w.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama atau keterangan dompet..."
        filterControls={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Filter cepat..."
              className="hidden"
            />
            <FilterDropdown
              ariaLabel="Filter jenis dompet"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'ALL', label: 'Semua Jenis' },
                { value: 'BANK', label: 'Bank' },
                { value: 'EWALLET', label: 'E-wallet' },
                { value: 'CASH', label: 'Tunai' },
                { value: 'OTHER', label: 'Lainnya' },
              ]}
            />
          </>
        }
        emptyMessage="Tidak ada dompet yang cocok dengan filter."
        onRowClick={(w) => setDetailWallet(w)}
      />

      {/* Modal Tambah / Edit Dompet */}
      <FormModal
        open={modalOpen}
        title={editingWallet ? `Edit Dompet: ${editingWallet.name}` : 'Tambah Dompet Baru'}
        subtitle="Perubahan disimpan pada state lokal simulasi"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingWallet ? 'Simpan Perubahan' : 'Tambah Dompet'}
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Nama Dompet"
              placeholder="Contoh: SeaBank / OVO"
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
            <Select
              label="Jenis Dompet"
              options={[
                { value: 'BANK', label: 'Bank' },
                { value: 'EWALLET', label: 'E-wallet' },
                { value: 'CASH', label: 'Tunai' },
                { value: 'OTHER', label: 'Lainnya' },
              ]}
              {...form.register('type')}
            />
          </div>
          <CurrencyInput
            label="Saldo Awal"
            disabled={Boolean(editingWallet)}
            helperText={
              editingWallet
                ? 'Saldo awal dikunci setelah dompet dibuat.'
                : 'Menjadi saldo awal saat dompet dibuat.'
            }
            error={form.formState.errors.initialBalance?.message}
            {...form.register('initialBalance')}
          />
          <Input
            label="Keterangan"
            placeholder="Opsional, misal fungsi utama dompet"
            {...form.register('description')}
          />
          <label className="flex items-center gap-2 pt-1 text-[13px] text-[#252525] dark:text-[#E6E6E6]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#E87932]"
              {...form.register('isActive')}
            />
            Dompet aktif digunakan untuk transaksi
          </label>
        </form>
      </FormModal>

      {/* Modal Histori Transaksi per Dompet */}
      <Modal
        open={Boolean(detailWallet)}
        title={detailWallet ? `Histori Dompet: ${detailWallet.name}` : ''}
        subtitle={
          detailWallet
            ? `${WALLET_TYPE_LABELS[detailWallet.type]} · Saldo saat ini ${formatRupiah(detailWallet.currentBalance)}`
            : undefined
        }
        size="lg"
        onClose={() => setDetailWallet(null)}
        footer={
          <Button variant="secondary" onClick={() => setDetailWallet(null)}>
            Tutup
          </Button>
        }
      >
        <div className="overflow-x-auto border border-[#E9E9E7] dark:border-[#343434]">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] text-[#787774] dark:border-[#343434] dark:bg-[#191919] dark:text-[#9B9B9B]">
                <th className="px-3 py-2 font-medium">Tanggal</th>
                <th className="px-3 py-2 font-medium">Jenis</th>
                <th className="px-3 py-2 font-medium">Keterangan</th>
                <th className="px-3 py-2 text-right font-medium">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
              {walletHistory.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-[#787774] tabular-nums dark:text-[#9B9B9B]">
                    {formatTanggalSingkat(item.date)}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge tone={item.sign === '+' ? 'success' : 'danger'}>
                      {item.kind}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-2">{item.desc}</td>
                  <td
                    className={`px-3 py-2 text-right font-mono font-medium tabular-nums ${
                      item.sign === '+' ? 'text-[#448361]' : 'text-[#D44C47]'
                    }`}
                  >
                    {item.sign}
                    {formatRupiah(item.amount)}
                  </td>
                </tr>
              ))}
              {walletHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]"
                  >
                    Belum ada histori transaksi pada dompet ini.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
