import {
  CashFlowDirection,
  CashReferenceType,
  LedgerClassification,
  Prisma,
} from '@prisma/client';
import { getPrismaClient } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { centsToDecimalString, decimalToCents } from '../utils/decimal';

export interface RecordLedgerEntryInput {
  walletId: number;
  transactionDate: Date;
  direction: CashFlowDirection;
  classification: LedgerClassification;
  amount: string | number;
  referenceType: CashReferenceType;
  referenceId: number;
  description: string;
  allowNegativeBalance?: boolean;
}

/**
 * Mencatat 1 entri buku kas (cash_transactions) dan memperbarui saldo dompet
 * secara atomik di dalam satu Prisma database transaction.
 */
export async function recordLedgerEntryTx(
  tx: Prisma.TransactionClient,
  input: RecordLedgerEntryInput
) {
  const amountCents = decimalToCents(input.amount);
  if (amountCents <= 0n) {
    throw new AppError('Nominal transaksi ledger harus lebih besar dari Rp0.', 400, 'INVALID_AMOUNT');
  }

  const wallet = await tx.wallet.findUnique({
    where: { id: input.walletId },
  });

  if (!wallet) {
    throw new AppError(`Dompet dengan ID ${input.walletId} tidak ditemukan.`, 404, 'WALLET_NOT_FOUND');
  }

  if (!wallet.isActive) {
    throw new AppError(
      `Dompet "${wallet.name}" berstatus nonaktif dan tidak dapat menerima transaksi.`,
      400,
      'WALLET_INACTIVE'
    );
  }

  const currentCents = decimalToCents(wallet.currentBalance);
  const nextCents =
    input.direction === CashFlowDirection.INFLOW
      ? currentCents + amountCents
      : currentCents - amountCents;

  if (!input.allowNegativeBalance && nextCents < 0n) {
    throw new AppError(
      `Saldo dompet "${wallet.name}" tidak mencukupi untuk transaksi keluar sebesar Rp${centsToDecimalString(amountCents)}.`,
      400,
      'INSUFFICIENT_WALLET_BALANCE'
    );
  }

  const balanceAfterStr = centsToDecimalString(nextCents);
  const amountStr = centsToDecimalString(amountCents);

  const ledgerEntry = await tx.cashTransaction.create({
    data: {
      walletId: input.walletId,
      transactionDate: input.transactionDate,
      direction: input.direction,
      classification: input.classification,
      amount: amountStr,
      balanceAfter: balanceAfterStr,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      description: input.description.trim().slice(0, 255),
    },
  });

  await tx.wallet.update({
    where: { id: input.walletId },
    data: { currentBalance: balanceAfterStr },
  });

  return ledgerEntry;
}

/**
 * Menghitung ulang saldo dompet langsung dari seluruh cash_transactions aktif (isVoided = false)
 * dan menyelaraskan cache wallets.current_balance di dalam transaction.
 */
export async function reconcileWalletBalanceTx(
  tx: Prisma.TransactionClient,
  walletId: number
): Promise<string> {
  const entries = await tx.cashTransaction.findMany({
    where: { walletId, isVoided: false },
    select: { direction: true, amount: true },
  });

  let netCents = 0n;
  for (const entry of entries) {
    const amt = decimalToCents(entry.amount);
    if (entry.direction === CashFlowDirection.INFLOW) {
      netCents += amt;
    } else {
      netCents -= amt;
    }
  }

  const reconciled = centsToDecimalString(netCents);
  await tx.wallet.update({
    where: { id: walletId },
    data: { currentBalance: reconciled },
  });

  return reconciled;
}

/**
 * Membatalkan (soft void) entri ledger tanpa menghapus histori,
 * lalu menghitung ulang saldo dompet dari ledger yang tersisa.
 */
export async function voidLedgerEntriesByReferenceTx(
  tx: Prisma.TransactionClient,
  referenceType: CashReferenceType,
  referenceId: number
): Promise<number> {
  const existing = await tx.cashTransaction.findMany({
    where: { referenceType, referenceId, isVoided: false },
    select: { id: true, walletId: true },
  });

  if (existing.length === 0) {
    return 0;
  }

  await tx.cashTransaction.updateMany({
    where: { referenceType, referenceId, isVoided: false },
    data: {
      isVoided: true,
      voidedAt: new Date(),
    },
  });

  const affectedWalletIds = Array.from(new Set(existing.map((item) => item.walletId)));
  for (const walletId of affectedWalletIds) {
    await reconcileWalletBalanceTx(tx, walletId);
  }

  return existing.length;
}

export interface WalletConsistencyCheck {
  walletId: number;
  walletName: string;
  cachedBalance: string;
  ledgerComputedBalance: string;
  isConsistent: boolean;
}

export async function verifyLedgerConsistency(): Promise<{
  connected: boolean;
  allConsistent: boolean;
  totalCachedBalance: string;
  totalLedgerBalance: string;
  wallets: WalletConsistencyCheck[];
}> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return {
      connected: false,
      allConsistent: true,
      totalCachedBalance: '0.00',
      totalLedgerBalance: '0.00',
      wallets: [],
    };
  }

  const wallets = await prisma.wallet.findMany({
    orderBy: { id: 'asc' },
  });

  const grouped = await prisma.cashTransaction.groupBy({
    by: ['walletId', 'direction'],
    where: { isVoided: false },
    _sum: { amount: true },
  });

  const walletLedgerMap = new Map<number, bigint>();
  for (const row of grouped) {
    const prev = walletLedgerMap.get(row.walletId) ?? 0n;
    const sumCents = row._sum.amount ? decimalToCents(row._sum.amount) : 0n;
    walletLedgerMap.set(
      row.walletId,
      row.direction === CashFlowDirection.INFLOW ? prev + sumCents : prev - sumCents
    );
  }

  let totalCachedCents = 0n;
  let totalLedgerCents = 0n;
  let allConsistent = true;

  const checks: WalletConsistencyCheck[] = wallets.map((wallet) => {
    const cachedCents = decimalToCents(wallet.currentBalance);
    const ledgerCents = walletLedgerMap.get(wallet.id) ?? 0n;
    const isConsistent = cachedCents === ledgerCents;
    if (!isConsistent) allConsistent = false;

    totalCachedCents += cachedCents;
    totalLedgerCents += ledgerCents;

    return {
      walletId: wallet.id,
      walletName: wallet.name,
      cachedBalance: centsToDecimalString(cachedCents),
      ledgerComputedBalance: centsToDecimalString(ledgerCents),
      isConsistent,
    };
  });

  return {
    connected: true,
    allConsistent,
    totalCachedBalance: centsToDecimalString(totalCachedCents),
    totalLedgerBalance: centsToDecimalString(totalLedgerCents),
    wallets: checks,
  };
}

export async function getLedgerEntries(filters: {
  walletId?: number;
  classification?: LedgerClassification;
  direction?: CashFlowDirection;
  includeVoided?: boolean;
  limit?: number;
}) {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new AppError(
      'Database MySQL belum terhubung. Pastikan DATABASE_URL pada .env sudah aktif.',
      503,
      'DATABASE_UNAVAILABLE'
    );
  }

  return prisma.cashTransaction.findMany({
    where: {
      walletId: filters.walletId,
      classification: filters.classification,
      direction: filters.direction,
      isVoided: filters.includeVoided ? undefined : false,
    },
    include: {
      wallet: {
        select: { id: true, name: true, type: true },
      },
    },
    orderBy: [{ transactionDate: 'desc' }, { id: 'desc' }],
    take: filters.limit ?? 50,
  });
}
