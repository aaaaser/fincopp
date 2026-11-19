export type WalletType = 'BANK' | 'CASH' | 'EWALLET' | 'OTHER';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  description?: string;
}

export type IncomeCategory =
  | 'Gaji'
  | 'Freelance'
  | 'Pekerjaan sampingan'
  | 'Live streaming'
  | 'Bonus'
  | 'Hadiah'
  | 'Lainnya';

export interface IncomeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: IncomeCategory;
  source: string;
  amount: number;
  walletId: string;
  notes?: string;
}

export type RecurringCategory =
  | 'WiFi'
  | 'Listrik'
  | 'BPJS'
  | 'Langganan aplikasi'
  | 'Hosting'
  | 'VPS'
  | 'Domain'
  | 'Lainnya';

export type NonRecurringCategory =
  | 'Makanan'
  | 'Transportasi'
  | 'Belanja'
  | 'Hiburan'
  | 'Kebutuhan pribadi'
  | 'Lainnya';

export type ExpensePaymentStatus = 'LUNAS' | 'BELUM_DIBAYAR' | 'TERLAMBAT';

export interface ExpenseRecord {
  id: string;
  title: string;
  kind: 'RUTIN' | 'TIDAK_RUTIN';
  category: RecurringCategory | NonRecurringCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  period?: 'MINGGUAN' | 'BULANAN' | 'TAHUNAN';
  status: ExpensePaymentStatus;
  walletId: string;
  reminderDays?: number[];
  notes?: string;
}

export interface WalletTransfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  fee: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  status: 'SELESAI';
}

export type DebtKind = 'UTANG' | 'PIUTANG';
export type DebtStatus = 'BELUM_LUNAS' | 'SEBAGIAN' | 'LUNAS' | 'TERLAMBAT';

export interface DebtPaymentItem {
  id: string;
  date: string;
  amount: number;
  walletId: string;
  notes?: string;
}

export interface DebtRecord {
  id: string;
  kind: DebtKind;
  partyName: string;
  initialAmount: number;
  paidAmount: number;
  remainingAmount: number;
  loanDate: string;
  dueDate: string;
  status: DebtStatus;
  notes?: string;
  payments: DebtPaymentItem[];
}

export type StreamPlatform = 'TikTok' | 'YouTube' | 'Lainnya';

export interface DonationRecord {
  id: string;
  nickname: string;
  platform: StreamPlatform;
  date: string; // YYYY-MM-DD
  amount: number;
  walletId: string;
  pricePerMatch: number;
  matchCount: number;
  remainderAmount: number;
  notes?: string;
}

export type QueueStatus = 'MENUNGGU' | 'BERLANGSUNG' | 'SELESAI' | 'DIBATALKAN';

export interface MatchQueueItem {
  id: string;
  donationId: string;
  nickname: string;
  platform: StreamPlatform;
  totalMatches: number;
  completedMatches: number;
  remainingMatches: number;
  status: QueueStatus;
  queuedAt: string; // ISO datetime
  isPriority: boolean;
  priorityOrder: number;
}

export interface MatchHistoryRecord {
  id: string;
  queueId: string;
  nickname: string;
  platform: StreamPlatform;
  totalMatches: number;
  completedMatches: number;
  completedAt: string; // ISO datetime
  status: 'SELESAI' | 'DIBATALKAN';
}

export type NotificationCategory =
  | 'TAGIHAN_MENDEKATI'
  | 'TAGIHAN_TERLAMBAT'
  | 'UTANG_MENDEKATI'
  | 'PIUTANG_MENDEKATI';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  type: 'MANUAL' | 'OTOMATIS';
  folderPath: string;
  sizeLabel: string;
  createdAt: string;
  status: 'BERHASIL' | 'GAGAL';
}

export interface AppSettingsState {
  appName: string;
  subtitle: string;
  currency: 'IDR';
  notifyDueReminders: boolean;
  notifyDesktopPopup: boolean;
  reminderDaysBefore: number[];
  pricePerMatch: number;
  autoQueueFromDonation: boolean;
  fifoStrictMode: boolean;
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'HARIAN' | 'MINGGUAN' | 'BULANAN';
  autoBackupTime: string;
  autoBackupFolder: string;
  backupRetentionDays: number;
}
