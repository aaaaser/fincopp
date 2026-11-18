export interface DatabaseHealth {
  configured: boolean;
  connected: boolean;
  host: string | null;
  port: string | null;
  database: string | null;
  serverVersion: string | null;
  tableCount: number;
  latencyMs: number | null;
  message: string;
}

export interface PrismaTableSummary {
  tableName: string;
  modelName: string;
  module: string;
  description: string;
}

export interface SystemHealthData {
  application: {
    name: string;
    subtitle: string;
    version: string;
    stage: string;
    environment: string;
    nodeVersion: string;
    uptimeSeconds: number;
    timestamp: string;
  };
  database: DatabaseHealth;
  schema: {
    totalTables: number;
    tables: PrismaTableSummary[];
  };
}

export interface WalletConsistencyCheck {
  walletId: number;
  walletName: string;
  cachedBalance: string;
  ledgerComputedBalance: string;
  isConsistent: boolean;
}

export interface LedgerSummaryData {
  connected: boolean;
  allConsistent: boolean;
  totalCachedBalance: string;
  totalLedgerBalance: string;
  wallets: WalletConsistencyCheck[];
}

export type NavSectionId =
  | 'dashboard'
  | 'wallets'
  | 'incomes'
  | 'expenses'
  | 'recurring-expenses'
  | 'debts'
  | 'donations'
  | 'queue'
  | 'reports'
  | 'settings';
