import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useFincopStore } from '../../hooks/useFincopStore';
import type {
  IncomeCategory,
  NonRecurringCategory,
  StreamPlatform,
} from '../../types/finance';
import { calculateMatchAllocation, formatRupiah } from '../../utils/currency';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CurrencyInput } from './CurrencyInput';
import { FormModal } from './FormModal';
import { WalletSelector } from './WalletSelector';

const quickIncomeSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  title: z.string().min(2, 'Nama pemasukan minimal 2 karakter'),
  category: z.string().min(1),
  source: z.string().min(2, 'Sumber pemasukan wajib diisi'),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  walletId: z.string().min(1),
  notes: z.string().optional(),
});

const quickExpenseSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  title: z.string().min(2, 'Nama pengeluaran minimal 2 karakter'),
  category: z.string().min(1),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  walletId: z.string().min(1),
  notes: z.string().optional(),
});

const quickTransferSchema = z
  .object({
    date: z.string().min(1, 'Tanggal wajib diisi'),
    fromWalletId: z.string().min(1),
    toWalletId: z.string().min(1),
    amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
    fee: z.coerce.number().min(0, 'Biaya transfer tidak boleh negatif'),
    notes: z.string().optional(),
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: 'Dompet asal dan tujuan tidak boleh sama',
    path: ['toWalletId'],
  });

const quickDonationSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  nickname: z.string().min(2, 'Nickname minimal 2 karakter'),
  platform: z.enum(['TikTok', 'YouTube', 'Lainnya']),
  amount: z.coerce.number().min(1000, 'Minimal donasi Rp1.000'),
  walletId: z.string().min(1),
  notes: z.string().optional(),
});

const quickDebtSchema = z.object({
  kind: z.enum(['UTANG', 'PIUTANG']),
  partyName: z.string().min(2, 'Nama pihak wajib diisi'),
  initialAmount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  loanDate: z.string().min(1),
  dueDate: z.string().min(1),
  notes: z.string().optional(),
});

export function QuickAddModal() {
  const {
    quickAddType,
    setQuickAddType,
    wallets,
    settings,
    addIncome,
    addExpense,
    addTransfer,
    addDonation,
    addDebt,
  } = useFincopStore();

  const defaultWalletId = wallets[0]?.id ?? '';
  const secondWalletId = wallets[1]?.id ?? defaultWalletId;
  const todayStr = '2026-11-18';

  const incomeForm = useForm({
    resolver: zodResolver(quickIncomeSchema),
    defaultValues: {
      date: todayStr,
      title: '',
      category: 'Freelance',
      source: '',
      amount: 0,
      walletId: defaultWalletId,
      notes: '',
    },
  });

  const expenseForm = useForm({
    resolver: zodResolver(quickExpenseSchema),
    defaultValues: {
      date: todayStr,
      title: '',
      category: 'Makanan',
      amount: 0,
      walletId: defaultWalletId,
      notes: '',
    },
  });

  const transferForm = useForm({
    resolver: zodResolver(quickTransferSchema),
    defaultValues: {
      date: todayStr,
      fromWalletId: defaultWalletId,
      toWalletId: secondWalletId,
      amount: 0,
      fee: 0,
      notes: '',
    },
  });

  const donationForm = useForm({
    resolver: zodResolver(quickDonationSchema),
    defaultValues: {
      date: todayStr,
      nickname: '',
      platform: 'TikTok' as StreamPlatform,
      amount: 5000,
      walletId: 'w-dana',
      notes: '',
    },
  });

  const debtForm = useForm({
    resolver: zodResolver(quickDebtSchema),
    defaultValues: {
      kind: 'UTANG' as const,
      partyName: '',
      initialAmount: 0,
      loanDate: todayStr,
      dueDate: '2026-11-30',
      notes: '',
    },
  });

  useEffect(() => {
    if (!quickAddType) return;
    incomeForm.reset();
    expenseForm.reset();
    transferForm.reset();
    donationForm.reset();
    debtForm.reset();
  }, [quickAddType]);

  const donationAmountWatch = Number(donationForm.watch('amount') || 0);
  const previewMatch =
    donationAmountWatch >= 0
      ? calculateMatchAllocation(donationAmountWatch, settings.pricePerMatch)
      : { matchCount: 0, remainderRupiah: 0 };

  const titleMap = {
    income: 'Quick Add: Pemasukan Baru',
    expense: 'Quick Add: Pengeluaran Tidak Rutin',
    transfer: 'Quick Add: Transfer Antar-Dompet',
    donation: 'Quick Add: Donasi Live Streaming',
    debt: 'Quick Add: Catat Utang / Piutang',
  };

  if (!quickAddType) return null;

  return (
    <FormModal
      open={Boolean(quickAddType)}
      title={titleMap[quickAddType]}
      subtitle="Aksi simulasi ke state lokal aplikasi"
      onClose={() => setQuickAddType(null)}
      footer={
        <>
          <Button variant="secondary" onClick={() => setQuickAddType(null)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (quickAddType === 'income') {
                void incomeForm.handleSubmit((data) => {
                  addIncome({
                    date: data.date,
                    title: data.title,
                    category: data.category as IncomeCategory,
                    source: data.source,
                    amount: Number(data.amount),
                    walletId: data.walletId,
                    notes: data.notes,
                  });
                  setQuickAddType(null);
                })();
              } else if (quickAddType === 'expense') {
                void expenseForm.handleSubmit((data) => {
                  addExpense({
                    date: data.date,
                    title: data.title,
                    kind: 'TIDAK_RUTIN',
                    category: data.category as NonRecurringCategory,
                    amount: Number(data.amount),
                    status: 'LUNAS',
                    walletId: data.walletId,
                    notes: data.notes,
                  });
                  setQuickAddType(null);
                })();
              } else if (quickAddType === 'transfer') {
                void transferForm.handleSubmit((data) => {
                  const ok = addTransfer({
                    date: data.date,
                    fromWalletId: data.fromWalletId,
                    toWalletId: data.toWalletId,
                    amount: Number(data.amount),
                    fee: Number(data.fee),
                    notes: data.notes,
                  });
                  if (ok) setQuickAddType(null);
                })();
              } else if (quickAddType === 'donation') {
                void donationForm.handleSubmit((data) => {
                  addDonation({
                    date: data.date,
                    nickname: data.nickname,
                    platform: data.platform,
                    amount: Number(data.amount),
                    walletId: data.walletId,
                    pricePerMatch: settings.pricePerMatch,
                    notes: data.notes,
                  });
                  setQuickAddType(null);
                })();
              } else if (quickAddType === 'debt') {
                void debtForm.handleSubmit((data) => {
                  addDebt({
                    kind: data.kind,
                    partyName: data.partyName,
                    initialAmount: Number(data.initialAmount),
                    loanDate: data.loanDate,
                    dueDate: data.dueDate,
                    notes: data.notes,
                  });
                  setQuickAddType(null);
                })();
              }
            }}
          >
            Simpan
          </Button>
        </>
      }
    >
      {quickAddType === 'income' ? (
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Tanggal"
              type="date"
              error={incomeForm.formState.errors.date?.message}
              {...incomeForm.register('date')}
            />
            <Select
              label="Kategori"
              options={[
                { value: 'Gaji', label: 'Gaji' },
                { value: 'Freelance', label: 'Freelance' },
                { value: 'Pekerjaan sampingan', label: 'Pekerjaan sampingan' },
                { value: 'Live streaming', label: 'Live streaming' },
                { value: 'Bonus', label: 'Bonus' },
                { value: 'Hadiah', label: 'Hadiah' },
                { value: 'Lainnya', label: 'Lainnya' },
              ]}
              {...incomeForm.register('category')}
            />
          </div>
          <Input
            label="Nama Pemasukan"
            placeholder="Contoh: Proyek Website Toko"
            error={incomeForm.formState.errors.title?.message}
            {...incomeForm.register('title')}
          />
          <Input
            label="Sumber Pemasukan"
            placeholder="Contoh: Klien Jakarta"
            error={incomeForm.formState.errors.source?.message}
            {...incomeForm.register('source')}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrencyInput
              label="Nominal"
              error={incomeForm.formState.errors.amount?.message}
              {...incomeForm.register('amount')}
            />
            <WalletSelector
              label="Dompet Tujuan"
              error={incomeForm.formState.errors.walletId?.message}
              {...incomeForm.register('walletId')}
            />
          </div>
        </form>
      ) : null}

      {quickAddType === 'expense' ? (
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Tanggal"
              type="date"
              error={expenseForm.formState.errors.date?.message}
              {...expenseForm.register('date')}
            />
            <Select
              label="Kategori"
              options={[
                { value: 'Makanan', label: 'Makanan' },
                { value: 'Transportasi', label: 'Transportasi' },
                { value: 'Belanja', label: 'Belanja' },
                { value: 'Hiburan', label: 'Hiburan' },
                { value: 'Kebutuhan pribadi', label: 'Kebutuhan pribadi' },
                { value: 'Lainnya', label: 'Lainnya' },
              ]}
              {...expenseForm.register('category')}
            />
          </div>
          <Input
            label="Nama Pengeluaran"
            placeholder="Contoh: Makan Siang"
            error={expenseForm.formState.errors.title?.message}
            {...expenseForm.register('title')}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrencyInput
              label="Nominal"
              error={expenseForm.formState.errors.amount?.message}
              {...expenseForm.register('amount')}
            />
            <WalletSelector
              label="Dompet Pembayaran"
              error={expenseForm.formState.errors.walletId?.message}
              {...expenseForm.register('walletId')}
            />
          </div>
        </form>
      ) : null}

      {quickAddType === 'transfer' ? (
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <WalletSelector
              label="Dompet Asal"
              error={transferForm.formState.errors.fromWalletId?.message}
              {...transferForm.register('fromWalletId')}
            />
            <WalletSelector
              label="Dompet Tujuan"
              error={transferForm.formState.errors.toWalletId?.message}
              {...transferForm.register('toWalletId')}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CurrencyInput
              label="Nominal Transfer"
              error={transferForm.formState.errors.amount?.message}
              {...transferForm.register('amount')}
            />
            <CurrencyInput
              label="Biaya Transfer"
              error={transferForm.formState.errors.fee?.message}
              {...transferForm.register('fee')}
            />
            <Input
              label="Tanggal"
              type="date"
              error={transferForm.formState.errors.date?.message}
              {...transferForm.register('date')}
            />
          </div>
          <Input label="Catatan" placeholder="Opsional" {...transferForm.register('notes')} />
        </form>
      ) : null}

      {quickAddType === 'donation' ? (
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Nickname Penonton"
              placeholder="Contoh: SultanMabar"
              error={donationForm.formState.errors.nickname?.message}
              {...donationForm.register('nickname')}
            />
            <Select
              label="Platform"
              options={[
                { value: 'TikTok', label: 'TikTok' },
                { value: 'YouTube', label: 'YouTube' },
                { value: 'Lainnya', label: 'Lainnya' },
              ]}
              {...donationForm.register('platform')}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CurrencyInput
              label="Nominal Donasi"
              error={donationForm.formState.errors.amount?.message}
              {...donationForm.register('amount')}
            />
            <WalletSelector
              label="Dompet Penerima"
              {...donationForm.register('walletId')}
            />
            <Input
              label="Tanggal"
              type="date"
              {...donationForm.register('date')}
            />
          </div>
          <div className="rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] px-3 py-2 text-[12px] text-[#787774] dark:border-[#343434] dark:bg-[#191919] dark:text-[#9B9B9B]">
            Kalkulasi otomatis ({formatRupiah(settings.pricePerMatch)}/match):{' '}
            <span className="font-semibold text-[#252525] dark:text-[#E6E6E6]">
              {previewMatch.matchCount} match
            </span>{' '}
            + sisa{' '}
            <span className="font-mono text-[#252525] dark:text-[#E6E6E6]">
              {formatRupiah(previewMatch.remainderRupiah)}
            </span>
          </div>
        </form>
      ) : null}

      {quickAddType === 'debt' ? (
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Jenis"
              options={[
                { value: 'UTANG', label: 'Utang (Kewajiban Saya)' },
                { value: 'PIUTANG', label: 'Piutang (Tagihan ke Pihak Lain)' },
              ]}
              {...debtForm.register('kind')}
            />
            <Input
              label="Nama Pihak"
              placeholder="Contoh: Budi Santoso"
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
            <Input label="Tanggal Pinjam" type="date" {...debtForm.register('loanDate')} />
            <Input label="Jatuh Tempo" type="date" {...debtForm.register('dueDate')} />
          </div>
          <Input label="Keterangan" placeholder="Opsional" {...debtForm.register('notes')} />
        </form>
      ) : null}
    </FormModal>
  );
}
