import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  INITIAL_BACKUP_LOGS,
  INITIAL_DEBTS,
  INITIAL_DONATIONS,
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
  INITIAL_MATCH_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_QUEUE,
  INITIAL_SETTINGS,
  INITIAL_TRANSFERS,
  INITIAL_WALLETS,
} from '../mock/seedData';
import type {
  AppSettingsState,
  BackupRecord,
  DebtKind,
  DebtRecord,
  DonationRecord,
  ExpenseRecord,
  IncomeRecord,
  MatchHistoryRecord,
  MatchQueueItem,
  NotificationItem,
  Wallet,
  WalletTransfer,
} from '../types/finance';
import { calculateMatchAllocation } from '../utils/currency';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export type QuickAddAction = 'income' | 'expense' | 'transfer' | 'donation' | 'debt';

interface FincopContextValue {
  wallets: Wallet[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  transfers: WalletTransfer[];
  debts: DebtRecord[];
  donations: DonationRecord[];
  queue: MatchQueueItem[];
  sortedActiveQueue: MatchQueueItem[];
  matchHistory: MatchHistoryRecord[];
  notifications: NotificationItem[];
  backupLogs: BackupRecord[];
  settings: AppSettingsState;
  toasts: ToastMessage[];
  quickAddType: QuickAddAction | null;
  setQuickAddType: (action: QuickAddAction | null) => void;
  notify: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  getWalletName: (walletId: string) => string;

  // Wallets
  addWallet: (payload: Omit<Wallet, 'id' | 'currentBalance'>) => void;
  updateWallet: (id: string, payload: Partial<Omit<Wallet, 'id' | 'initialBalance'>>) => void;

  // Incomes
  addIncome: (payload: Omit<IncomeRecord, 'id'>) => void;
  updateIncome: (id: string, payload: Omit<IncomeRecord, 'id'>) => void;
  deleteIncome: (id: string) => void;

  // Expenses
  addExpense: (payload: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (id: string, payload: Omit<ExpenseRecord, 'id'>) => void;
  deleteExpense: (id: string) => void;
  markRecurringPaid: (expenseId: string, walletId: string) => void;

  // Transfers
  addTransfer: (payload: Omit<WalletTransfer, 'id' | 'status'>) => boolean;

  // Debts & Receivables
  addDebt: (payload: {
    kind: DebtKind;
    partyName: string;
    initialAmount: number;
    loanDate: string;
    dueDate: string;
    notes?: string;
  }) => void;
  addDebtPayment: (
    debtId: string,
    payment: { date: string; amount: number; walletId: string; notes?: string }
  ) => boolean;

  // Donations & Queue
  addDonation: (payload: {
    nickname: string;
    platform: DonationRecord['platform'];
    date: string;
    amount: number;
    walletId: string;
    pricePerMatch: number;
    notes?: string;
  }) => void;
  startQueueMatch: (queueId: string) => void;
  completeOneMatch: (queueId: string) => void;
  cancelQueueItem: (queueId: string) => void;
  toggleQueuePriority: (queueId: string, makePriority: boolean) => void;
  moveQueueOrder: (queueId: string, direction: 'up' | 'down') => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Backup & Settings
  runManualBackup: (folderPath?: string) => void;
  runSimulatedRestore: (fileName: string) => void;
  updateSettings: (next: Partial<AppSettingsState>) => void;
  resetPrototypeData: () => void;
}

const FincopContext = createContext<FincopContextValue | null>(null);

function sortFifoQueue(items: MatchQueueItem[]): MatchQueueItem[] {
  const active = items.filter((q) => q.status === 'MENUNGGU' || q.status === 'BERLANGSUNG');
  return [...active].sort((a, b) => {
    if (a.isPriority !== b.isPriority) {
      return a.isPriority ? -1 : 1;
    }
    if (a.priorityOrder !== b.priorityOrder) {
      return a.priorityOrder - b.priorityOrder;
    }
    return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
  });
}

function advanceDueDate(dateStr: string, period?: 'MINGGUAN' | 'BULANAN' | 'TAHUNAN'): string {
  const base = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(base.getTime())) return dateStr;
  if (period === 'MINGGUAN') base.setDate(base.getDate() + 7);
  else if (period === 'TAHUNAN') base.setFullYear(base.getFullYear() + 1);
  else base.setMonth(base.getMonth() + 1);
  return base.toISOString().slice(0, 10);
}

export function FincopStoreProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [incomes, setIncomes] = useState<IncomeRecord[]>(INITIAL_INCOMES);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [transfers, setTransfers] = useState<WalletTransfer[]>(INITIAL_TRANSFERS);
  const [debts, setDebts] = useState<DebtRecord[]>(INITIAL_DEBTS);
  const [donations, setDonations] = useState<DonationRecord[]>(INITIAL_DONATIONS);
  const [queue, setQueue] = useState<MatchQueueItem[]>(INITIAL_QUEUE);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryRecord[]>(INITIAL_MATCH_HISTORY);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [backupLogs, setBackupLogs] = useState<BackupRecord[]>(INITIAL_BACKUP_LOGS);
  const [settings, setSettings] = useState<AppSettingsState>(INITIAL_SETTINGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickAddType, setQuickAddType] = useState<QuickAddAction | null>(null);

  const notify = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getWalletName = useCallback(
    (walletId: string) => wallets.find((w) => w.id === walletId)?.name ?? 'Dompet Tidak Dikenal',
    [wallets]
  );

  // --- Wallets ---
  const addWallet = useCallback(
    (payload: Omit<Wallet, 'id' | 'currentBalance'>) => {
      const id = `w-${Date.now()}`;
      setWallets((prev) => [
        ...prev,
        {
          ...payload,
          id,
          currentBalance: payload.initialBalance,
        },
      ]);
      notify({
        type: 'success',
        title: 'Dompet Ditambahkan (Simulasi)',
        message: `Dompet ${payload.name} berhasil ditambahkan ke state lokal.`,
      });
    },
    [notify]
  );

  const updateWallet = useCallback(
    (id: string, payload: Partial<Omit<Wallet, 'id' | 'initialBalance'>>) => {
      setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...payload } : w)));
      notify({
        type: 'success',
        title: 'Dompet Diperbarui',
        message: 'Perubahan data dompet diterapkan ke state lokal.',
      });
    },
    [notify]
  );

  // --- Incomes ---
  const addIncome = useCallback(
    (payload: Omit<IncomeRecord, 'id'>) => {
      const id = `inc-${Date.now()}`;
      setIncomes((prev) => [{ ...payload, id }, ...prev]);
      setWallets((prev) =>
        prev.map((w) =>
          w.id === payload.walletId
            ? { ...w, currentBalance: w.currentBalance + payload.amount }
            : w
        )
      );
      notify({
        type: 'success',
        title: 'Pemasukan Dicatat (Simulasi)',
        message: `${payload.title} masuk ke dompet terpilih.`,
      });
    },
    [notify]
  );

  const updateIncome = useCallback(
    (id: string, payload: Omit<IncomeRecord, 'id'>) => {
      const existing = incomes.find((i) => i.id === id);
      if (!existing) return;
      setIncomes((prev) => prev.map((i) => (i.id === id ? { ...payload, id } : i)));
      setWallets((prev) =>
        prev.map((w) => {
          let bal = w.currentBalance;
          if (w.id === existing.walletId) bal -= existing.amount;
          if (w.id === payload.walletId) bal += payload.amount;
          return { ...w, currentBalance: bal };
        })
      );
      notify({
        type: 'success',
        title: 'Pemasukan Diperbarui',
        message: `Perubahan pada "${payload.title}" disimpan di state lokal.`,
      });
    },
    [incomes, notify]
  );

  const deleteIncome = useCallback(
    (id: string) => {
      const existing = incomes.find((i) => i.id === id);
      if (!existing) return;
      setIncomes((prev) => prev.filter((i) => i.id !== id));
      setWallets((prev) =>
        prev.map((w) =>
          w.id === existing.walletId
            ? { ...w, currentBalance: Math.max(0, w.currentBalance - existing.amount) }
            : w
        )
      );
      notify({
        type: 'info',
        title: 'Pemasukan Dibatalkan',
        message: `Catatan "${existing.title}" dihapus dari daftar simulasi.`,
      });
    },
    [incomes, notify]
  );

  // --- Expenses ---
  const addExpense = useCallback(
    (payload: Omit<ExpenseRecord, 'id'>) => {
      const id = `exp-${Date.now()}`;
      setExpenses((prev) => [{ ...payload, id }, ...prev]);
      if (payload.status === 'LUNAS') {
        setWallets((prev) =>
          prev.map((w) =>
            w.id === payload.walletId
              ? { ...w, currentBalance: w.currentBalance - payload.amount }
              : w
          )
        );
      }
      notify({
        type: 'success',
        title:
          payload.kind === 'RUTIN'
            ? 'Jadwal Tagihan Rutin Ditambahkan'
            : 'Pengeluaran Dicatat (Simulasi)',
        message:
          payload.kind === 'RUTIN' && payload.status !== 'LUNAS'
            ? 'Saldo belum berkurang sampai pembayaran dikonfirmasi.'
            : `${payload.title} dicatat ke state lokal.`,
      });
    },
    [notify]
  );

  const updateExpense = useCallback(
    (id: string, payload: Omit<ExpenseRecord, 'id'>) => {
      const existing = expenses.find((e) => e.id === id);
      if (!existing) return;
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...payload, id } : e)));
      setWallets((prev) =>
        prev.map((w) => {
          let bal = w.currentBalance;
          if (existing.status === 'LUNAS' && w.id === existing.walletId) bal += existing.amount;
          if (payload.status === 'LUNAS' && w.id === payload.walletId) bal -= payload.amount;
          return { ...w, currentBalance: bal };
        })
      );
      notify({
        type: 'success',
        title: 'Pengeluaran Diperbarui',
        message: `Data "${payload.title}" diperbarui di state lokal.`,
      });
    },
    [expenses, notify]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      const existing = expenses.find((e) => e.id === id);
      if (!existing) return;
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      if (existing.status === 'LUNAS') {
        setWallets((prev) =>
          prev.map((w) =>
            w.id === existing.walletId
              ? { ...w, currentBalance: w.currentBalance + existing.amount }
              : w
          )
        );
      }
      notify({
        type: 'info',
        title: 'Pengeluaran Dihapus',
        message: `Catatan "${existing.title}" dibatalkan dari simulasi.`,
      });
    },
    [expenses, notify]
  );

  const markRecurringPaid = useCallback(
    (expenseId: string, walletId: string) => {
      const target = expenses.find((e) => e.id === expenseId);
      if (!target) return;
      if (target.status === 'LUNAS') {
        notify({
          type: 'error',
          title: 'Pembayaran Ganda Dicegah',
          message: 'Tagihan periode ini sudah berstatus Lunas.',
        });
        return;
      }

      const sourceWallet = wallets.find((w) => w.id === walletId);
      if (!sourceWallet || sourceWallet.currentBalance < target.amount) {
        notify({
          type: 'error',
          title: 'Saldo Dompet Tidak Mencukupi',
          message: 'Pilih dompet lain atau periksa saldo tersedia.',
        });
        return;
      }

      setWallets((prev) =>
        prev.map((w) =>
          w.id === walletId ? { ...w, currentBalance: w.currentBalance - target.amount } : w
        )
      );

      const nextDue = target.dueDate ? advanceDueDate(target.dueDate, target.period) : undefined;
      setExpenses((prev) => [
        ...prev.map((e) =>
          e.id === expenseId ? { ...e, status: 'LUNAS' as const, walletId } : e
        ),
        ...(nextDue
          ? [
              {
                ...target,
                id: `exp-${Date.now()}`,
                date: target.dueDate ?? target.date,
                dueDate: nextDue,
                status: 'BELUM_DIBAYAR' as const,
                notes: `Jadwal otomatis periode berikutnya (${target.period ?? 'BULANAN'})`,
              },
            ]
          : []),
      ]);

      notify({
        type: 'success',
        title: 'Tagihan Dibayar & Jadwal Baru Dibuat',
        message: `${target.title} dibayar dari ${sourceWallet.name}.`,
      });
    },
    [expenses, wallets, notify]
  );

  // --- Transfers ---
  const addTransfer = useCallback(
    (payload: Omit<WalletTransfer, 'id' | 'status'>): boolean => {
      if (payload.fromWalletId === payload.toWalletId) {
        notify({
          type: 'error',
          title: 'Transfer Ditolak',
          message: 'Dompet asal dan dompet tujuan tidak boleh sama.',
        });
        return false;
      }

      const origin = wallets.find((w) => w.id === payload.fromWalletId);
      const totalDebit = payload.amount + payload.fee;
      if (!origin || origin.currentBalance < totalDebit) {
        notify({
          type: 'error',
          title: 'Saldo Tidak Mencukupi',
          message: `Saldo ${origin?.name ?? 'asal'} kurang dari nominal + biaya transfer.`,
        });
        return false;
      }

      const id = `trf-${Date.now()}`;
      setTransfers((prev) => [{ ...payload, id, status: 'SELESAI' }, ...prev]);
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === payload.fromWalletId) {
            return { ...w, currentBalance: w.currentBalance - totalDebit };
          }
          if (w.id === payload.toWalletId) {
            return { ...w, currentBalance: w.currentBalance + payload.amount };
          }
          return w;
        })
      );
      notify({
        type: 'success',
        title: 'Transfer Antar-Dompet Berhasil',
        message: 'Saldo kedua dompet diperbarui tanpa memengaruhi pemasukan/pengeluaran.',
      });
      return true;
    },
    [wallets, notify]
  );

  // --- Debts ---
  const addDebt = useCallback(
    (payload: {
      kind: DebtKind;
      partyName: string;
      initialAmount: number;
      loanDate: string;
      dueDate: string;
      notes?: string;
    }) => {
      const id = `dbt-${Date.now()}`;
      setDebts((prev) => [
        {
          id,
          kind: payload.kind,
          partyName: payload.partyName,
          initialAmount: payload.initialAmount,
          paidAmount: 0,
          remainingAmount: payload.initialAmount,
          loanDate: payload.loanDate,
          dueDate: payload.dueDate,
          status: 'BELUM_LUNAS',
          notes: payload.notes,
          payments: [],
        },
        ...prev,
      ]);
      notify({
        type: 'success',
        title: payload.kind === 'UTANG' ? 'Utang Dicatat' : 'Piutang Dicatat',
        message: `${payload.partyName} ditambahkan ke daftar simulasi.`,
      });
    },
    [notify]
  );

  const addDebtPayment = useCallback(
    (
      debtId: string,
      payment: { date: string; amount: number; walletId: string; notes?: string }
    ): boolean => {
      const target = debts.find((d) => d.id === debtId);
      if (!target) return false;
      if (payment.amount <= 0 || payment.amount > target.remainingAmount) {
        notify({
          type: 'error',
          title: 'Nominal Cicilan Tidak Valid',
          message: 'Nominal cicilan tidak boleh melebihi sisa pembayaran.',
        });
        return false;
      }

      if (target.kind === 'UTANG') {
        const wallet = wallets.find((w) => w.id === payment.walletId);
        if (!wallet || wallet.currentBalance < payment.amount) {
          notify({
            type: 'error',
            title: 'Saldo Dompet Tidak Cukup',
            message: 'Saldo dompet untuk membayar cicilan utang tidak mencukupi.',
          });
          return false;
        }
      }

      setWallets((prev) =>
        prev.map((w) => {
          if (w.id !== payment.walletId) return w;
          return {
            ...w,
            currentBalance:
              target.kind === 'UTANG'
                ? w.currentBalance - payment.amount
                : w.currentBalance + payment.amount,
          };
        })
      );

      setDebts((prev) =>
        prev.map((d) => {
          if (d.id !== debtId) return d;
          const nextPaid = d.paidAmount + payment.amount;
          const nextRemaining = d.initialAmount - nextPaid;
          const nextStatus =
            nextRemaining === 0 ? 'LUNAS' : nextPaid > 0 ? 'SEBAGIAN' : d.status;
          return {
            ...d,
            paidAmount: nextPaid,
            remainingAmount: nextRemaining,
            status: nextStatus,
            payments: [
              {
                id: `dp-${Date.now()}`,
                ...payment,
              },
              ...d.payments,
            ],
          };
        })
      );

      notify({
        type: 'success',
        title:
          target.kind === 'UTANG'
            ? 'Cicilan Utang Dibayar'
            : 'Pembayaran Piutang Diterima',
        message: 'Saldo dompet dan sisa tagihan diperbarui.',
      });
      return true;
    },
    [debts, wallets, notify]
  );

  // --- Donations & Queue ---
  const addDonation = useCallback(
    (payload: {
      nickname: string;
      platform: DonationRecord['platform'];
      date: string;
      amount: number;
      walletId: string;
      pricePerMatch: number;
      notes?: string;
    }) => {
      const { matchCount, remainderRupiah } = calculateMatchAllocation(
        payload.amount,
        payload.pricePerMatch
      );
      const donationId = `don-${Date.now()}`;
      const newDonation: DonationRecord = {
        id: donationId,
        nickname: payload.nickname,
        platform: payload.platform,
        date: payload.date,
        amount: payload.amount,
        walletId: payload.walletId,
        pricePerMatch: payload.pricePerMatch,
        matchCount,
        remainderAmount: remainderRupiah,
        notes: payload.notes,
      };

      setDonations((prev) => [newDonation, ...prev]);
      setWallets((prev) =>
        prev.map((w) =>
          w.id === payload.walletId
            ? { ...w, currentBalance: w.currentBalance + payload.amount }
            : w
        )
      );

      if (matchCount > 0 && settings.autoQueueFromDonation) {
        const newQueueItem: MatchQueueItem = {
          id: `q-${Date.now()}`,
          donationId,
          nickname: payload.nickname,
          platform: payload.platform,
          totalMatches: matchCount,
          completedMatches: 0,
          remainingMatches: matchCount,
          status: 'MENUNGGU',
          queuedAt: new Date().toISOString(),
          isPriority: false,
          priorityOrder: 0,
        };
        setQueue((prev) => [...prev, newQueueItem]);
      }

      notify({
        type: 'success',
        title: 'Donasi Dicatat & Antrean Dibuat',
        message: `${payload.nickname}: ${matchCount} match ditambahkan ke antrean FIFO.`,
      });
    },
    [settings.autoQueueFromDonation, notify]
  );

  const startQueueMatch = useCallback(
    (queueId: string) => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId && item.status === 'MENUNGGU'
            ? { ...item, status: 'BERLANGSUNG' }
            : item
        )
      );
      notify({
        type: 'info',
        title: 'Match Dimulai',
        message: 'Status antrean diubah menjadi Berlangsung.',
      });
    },
    [notify]
  );

  const completeOneMatch = useCallback(
    (queueId: string) => {
      const target = queue.find((q) => q.id === queueId);
      if (!target || target.remainingMatches <= 0 || target.status === 'SELESAI') {
        notify({
          type: 'error',
          title: 'Tidak Dapat Menyelesaikan Match',
          message: 'Tidak ada sisa match pada antrean ini.',
        });
        return;
      }

      const nextCompleted = target.completedMatches + 1;
      const nextRemaining = target.totalMatches - nextCompleted;
      const isDone = nextRemaining === 0;

      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId
            ? {
                ...item,
                completedMatches: nextCompleted,
                remainingMatches: nextRemaining,
                status: isDone ? 'SELESAI' : 'BERLANGSUNG',
              }
            : item
        )
      );

      if (isDone) {
        setMatchHistory((prev) => [
          {
            id: `mh-${Date.now()}`,
            queueId,
            nickname: target.nickname,
            platform: target.platform,
            totalMatches: target.totalMatches,
            completedMatches: nextCompleted,
            completedAt: new Date().toISOString(),
            status: 'SELESAI',
          },
          ...prev,
        ]);
      }

      notify({
        type: 'success',
        title: isDone ? 'Seluruh Match Selesai' : '1 Match Diselesaikan',
        message: `${target.nickname}: ${nextCompleted}/${target.totalMatches} match selesai.`,
      });
    },
    [queue, notify]
  );

  const cancelQueueItem = useCallback(
    (queueId: string) => {
      const target = queue.find((q) => q.id === queueId);
      if (!target) return;

      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: 'DIBATALKAN' } : item
        )
      );
      setMatchHistory((prev) => [
        {
          id: `mh-${Date.now()}`,
          queueId,
          nickname: target.nickname,
          platform: target.platform,
          totalMatches: target.totalMatches,
          completedMatches: target.completedMatches,
          completedAt: new Date().toISOString(),
          status: 'DIBATALKAN',
        },
        ...prev,
      ]);
      notify({
        type: 'info',
        title: 'Antrean Dibatalkan',
        message: `Antrean milik ${target.nickname} dipindahkan ke riwayat mabar.`,
      });
    },
    [queue, notify]
  );

  const toggleQueuePriority = useCallback(
    (queueId: string, makePriority: boolean) => {
      setQueue((prev) => {
        const maxOrder = prev
          .filter((q) => q.isPriority)
          .reduce((acc, q) => Math.max(acc, q.priorityOrder), 0);
        return prev.map((item) =>
          item.id === queueId
            ? {
                ...item,
                isPriority: makePriority,
                priorityOrder: makePriority ? maxOrder + 1 : 0,
              }
            : item
        );
      });
      notify({
        type: 'info',
        title: makePriority ? 'Prioritas Diaktifkan' : 'Prioritas Dinonaktifkan',
        message: 'Urutan antrean mabar diperbarui.',
      });
    },
    [notify]
  );

  const moveQueueOrder = useCallback(
    (queueId: string, direction: 'up' | 'down') => {
      setQueue((prev) => {
        const sorted = sortFifoQueue(prev);
        const index = sorted.findIndex((q) => q.id === queueId);
        if (index === -1) return prev;
        const swapIdx = direction === 'up' ? index - 1 : index + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return prev;

        const current = sorted[index];
        const neighbor = sorted[swapIdx];
        if (current.isPriority !== neighbor.isPriority) {
          return prev;
        }

        // Tukar priorityOrder dan/atau queuedAt agar urutan manual stabil dalam kelompoknya
        return prev.map((item) => {
          if (item.id === current.id) {
            return {
              ...item,
              priorityOrder: neighbor.priorityOrder,
              queuedAt: neighbor.queuedAt,
            };
          }
          if (item.id === neighbor.id) {
            return {
              ...item,
              priorityOrder: current.priorityOrder,
              queuedAt: current.queuedAt,
            };
          }
          return item;
        });
      });
    },
    []
  );

  // --- Notifications ---
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notify({
      type: 'info',
      title: 'Semua Notifikasi Ditandai Dibaca',
    });
  }, [notify]);

  // --- Backup & Settings ---
  const runManualBackup = useCallback(
    (folderPath?: string) => {
      const now = new Date();
      const stamp = now.toISOString().slice(0, 16).replace(/[-:T]/g, '');
      const log: BackupRecord = {
        id: `bkp-${Date.now()}`,
        fileName: `fincop_manual_${stamp}.sql`,
        type: 'MANUAL',
        folderPath: folderPath || settings.autoBackupFolder,
        sizeLabel: '1,48 MB',
        createdAt: now.toISOString(),
        status: 'BERHASIL',
      };
      setBackupLogs((prev) => [log, ...prev]);
      notify({
        type: 'success',
        title: 'Simulasi Backup Berhasil',
        message: `File ${log.fileName} dibuat (simulasi UI).`,
      });
    },
    [settings.autoBackupFolder, notify]
  );

  const runSimulatedRestore = useCallback(
    (fileName: string) => {
      notify({
        type: 'success',
        title: 'Simulasi Restore Selesai',
        message: `Backup pengaman dibuat dan data dipulihkan dari ${fileName} (simulasi UI).`,
      });
    },
    [notify]
  );

  const updateSettings = useCallback(
    (next: Partial<AppSettingsState>) => {
      setSettings((prev) => ({ ...prev, ...next }));
      notify({
        type: 'success',
        title: 'Pengaturan Disimpan (Simulasi)',
        message: 'Preferensi aplikasi diperbarui pada state lokal.',
      });
    },
    [notify]
  );

  const resetPrototypeData = useCallback(() => {
    setWallets(INITIAL_WALLETS);
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setTransfers(INITIAL_TRANSFERS);
    setDebts(INITIAL_DEBTS);
    setDonations(INITIAL_DONATIONS);
    setQueue(INITIAL_QUEUE);
    setMatchHistory(INITIAL_MATCH_HISTORY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setBackupLogs(INITIAL_BACKUP_LOGS);
    setSettings(INITIAL_SETTINGS);
    notify({
      type: 'info',
      title: 'Data Dummy Direset',
      message: 'Seluruh data simulasi dikembalikan ke kondisi awal.',
    });
  }, [notify]);

  const sortedActiveQueue = useMemo(() => sortFifoQueue(queue), [queue]);

  const value: FincopContextValue = {
    wallets,
    incomes,
    expenses,
    transfers,
    debts,
    donations,
    queue,
    sortedActiveQueue,
    matchHistory,
    notifications,
    backupLogs,
    settings,
    toasts,
    quickAddType,
    setQuickAddType,
    notify,
    dismissToast,
    getWalletName,
    addWallet,
    updateWallet,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    markRecurringPaid,
    addTransfer,
    addDebt,
    addDebtPayment,
    addDonation,
    startQueueMatch,
    completeOneMatch,
    cancelQueueItem,
    toggleQueuePriority,
    moveQueueOrder,
    markNotificationRead,
    markAllNotificationsRead,
    runManualBackup,
    runSimulatedRestore,
    updateSettings,
    resetPrototypeData,
  };

  return <FincopContext.Provider value={value}>{children}</FincopContext.Provider>;
}

export function useFincopStore(): FincopContextValue {
  const ctx = useContext(FincopContext);
  if (!ctx) {
    throw new Error('useFincopStore harus dipanggil di dalam FincopStoreProvider');
  }
  return ctx;
}
