import { testDatabaseConnection } from '../config/database';
import { env } from '../config/env';

export interface PrismaTableSummary {
  tableName: string;
  modelName: string;
  module: string;
  description: string;
}

export const FINCOP_SCHEMA_TABLES: PrismaTableSummary[] = [
  {
    tableName: 'app_settings',
    modelName: 'AppSetting',
    module: 'Sistem',
    description: 'Pengaturan tema, tarif match, pengingat jatuh tempo, dan jadwal backup otomatis.',
  },
  {
    tableName: 'wallets',
    modelName: 'Wallet',
    module: 'Multi-Dompet',
    description: 'Master dompet (Bank, Cash, E-wallet, Lainnya) beserta saldo awal & saldo konsisten.',
  },
  {
    tableName: 'wallet_transfers',
    modelName: 'WalletTransfer',
    module: 'Multi-Dompet',
    description: 'Riwayat transfer antar-dompet yang netral terhadap pemasukan/pengeluaran.',
  },
  {
    tableName: 'income_categories',
    modelName: 'IncomeCategory',
    module: 'Pemasukan',
    description: 'Master kategori pemasukan (Gaji, Freelance, Live streaming, dll).',
  },
  {
    tableName: 'incomes',
    modelName: 'Income',
    module: 'Pemasukan',
    description: 'Pencatatan pemasukan ke dompet tujuan dengan nominal Decimal(18,2).',
  },
  {
    tableName: 'expense_categories',
    modelName: 'ExpenseCategory',
    module: 'Pengeluaran',
    description: 'Kategori pengeluaran rutin & tidak rutin.',
  },
  {
    tableName: 'expenses',
    modelName: 'Expense',
    module: 'Pengeluaran',
    description: 'Pencatatan pengeluaran dengan dompet sumber pembayaran.',
  },
  {
    tableName: 'recurring_expenses',
    modelName: 'RecurringExpense',
    module: 'Tagihan Rutin',
    description: 'Jadwal tagihan berkala (mingguan/bulanan/tahunan) & opsi pengingat.',
  },
  {
    tableName: 'recurring_expense_payments',
    modelName: 'RecurringExpensePayment',
    module: 'Tagihan Rutin',
    description: 'Histori pembayaran tagihan dengan unique key anti bayar ganda.',
  },
  {
    tableName: 'debts',
    modelName: 'Debt',
    module: 'Utang & Piutang',
    description: 'Catatan utang dan piutang beserta pelacakan sisa pembayaran.',
  },
  {
    tableName: 'debt_payments',
    modelName: 'DebtPayment',
    module: 'Utang & Piutang',
    description: 'Riwayat cicilan/pelunasan per dompet yang memperbarui buku kas.',
  },
  {
    tableName: 'donations',
    modelName: 'Donation',
    module: 'Donasi Stream',
    description: 'Donasi manual TikTok/YouTube, dompet penerimaan, match & sisa nominal.',
  },
  {
    tableName: 'match_queues',
    modelName: 'MatchQueue',
    module: 'Antrean Mabar',
    description: 'Antrean mabar FIFO dengan prioritas manual & sisa match.',
  },
  {
    tableName: 'match_history',
    modelName: 'MatchHistory',
    module: 'Antrean Mabar',
    description: 'Rekaman penyelesaian tiap match dengan identitas unik anti duplikasi.',
  },
  {
    tableName: 'cash_transactions',
    modelName: 'CashTransaction',
    module: 'Buku Kas',
    description: 'Ledger utama arus kas per dompet sebagai sumber kebenaran seluruh saldo.',
  },
  {
    tableName: 'notifications',
    modelName: 'Notification',
    module: 'Notifikasi',
    description: 'Histori notifikasi desktop jatuh tempo dengan deduplikasi periode.',
  },
  {
    tableName: 'backup_logs',
    modelName: 'BackupLog',
    module: 'Backup & Restore',
    description: 'Catatan histori backup manual, otomatis, dan pre-restore.',
  },
];

export async function getSystemHealthStatus() {
  const database = await testDatabaseConnection();

  return {
    application: {
      name: 'FINCOP',
      subtitle: 'FINANSIAL UCOPP',
      version: '0.2.0',
      stage: 'Fase 1 & Fase 2 — Fondasi, Skema 17 Tabel, Migrasi & Sistem Ledger',
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    database,
    schema: {
      totalTables: FINCOP_SCHEMA_TABLES.length,
      tables: FINCOP_SCHEMA_TABLES,
    },
  };
}
