import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  CashFlowDirection,
  CashReferenceType,
  LedgerClassification,
  type Prisma,
} from '@prisma/client';
import { createExpressApp } from '../server/app';
import {
  reconcileWalletBalanceTx,
  recordLedgerEntryTx,
  voidLedgerEntriesByReferenceTx,
} from '../server/services/ledger.service';
import {
  addDecimals,
  centsToDecimalString,
  compareDecimals,
  decimalToCents,
  subtractDecimals,
} from '../server/utils/decimal';

function createMockLedgerTx(initialWallets: Array<{ id: number; name: string; currentBalance: string; isActive: boolean }>) {
  const wallets = initialWallets.map((w) => ({ ...w }));
  const cashTransactions: Array<{
    id: number;
    walletId: number;
    transactionDate: Date;
    direction: CashFlowDirection;
    classification: LedgerClassification;
    amount: string;
    balanceAfter: string;
    referenceType: CashReferenceType;
    referenceId: number;
    description: string;
    isVoided: boolean;
    voidedAt: Date | null;
  }> = [];

  const tx = {
    wallet: {
      findUnique: async ({ where }: { where: { id: number } }) =>
        wallets.find((w) => w.id === where.id) ?? null,
      update: async ({
        where,
        data,
      }: {
        where: { id: number };
        data: { currentBalance: string };
      }) => {
        const target = wallets.find((w) => w.id === where.id);
        if (!target) throw new Error('Wallet not found');
        target.currentBalance = data.currentBalance;
        return target;
      },
    },
    cashTransaction: {
      create: async ({
        data,
      }: {
        data: Omit<(typeof cashTransactions)[number], 'id' | 'isVoided' | 'voidedAt'>;
      }) => {
        const entry = {
          id: cashTransactions.length + 1,
          ...data,
          isVoided: false,
          voidedAt: null,
        };
        cashTransactions.push(entry);
        return entry;
      },
      findMany: async ({
        where,
      }: {
        where: {
          walletId?: number;
          isVoided?: boolean;
          referenceType?: CashReferenceType;
          referenceId?: number;
        };
      }) => {
        return cashTransactions.filter((row) => {
          if (where.walletId !== undefined && row.walletId !== where.walletId) return false;
          if (where.isVoided !== undefined && row.isVoided !== where.isVoided) return false;
          if (where.referenceType !== undefined && row.referenceType !== where.referenceType) return false;
          if (where.referenceId !== undefined && row.referenceId !== where.referenceId) return false;
          return true;
        });
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { referenceType: CashReferenceType; referenceId: number; isVoided: boolean };
        data: { isVoided: boolean; voidedAt: Date };
      }) => {
        let count = 0;
        for (const row of cashTransactions) {
          if (
            row.referenceType === where.referenceType &&
            row.referenceId === where.referenceId &&
            row.isVoided === where.isVoided
          ) {
            row.isVoided = data.isVoided;
            row.voidedAt = data.voidedAt;
            count += 1;
          }
        }
        return { count };
      },
    },
  } as unknown as Prisma.TransactionClient;

  return { tx, wallets, cashTransactions };
}

test('Aritmatika BigInt Decimal(18,2): bebas floating point hingga triliunan rupiah', () => {
  assert.equal(decimalToCents('999999999999.99'), 99999999999999n);
  assert.equal(addDecimals('100000.15', '250000.85'), '350001.00');
  assert.equal(subtractDecimals('500000.00', '125000.50'), '374999.50');
  assert.equal(compareDecimals('100.00', '99.99'), 1);
  assert.equal(centsToDecimalString(0n), '0.00');
});

test('Migrasi Prisma: file migration.sql dan migration_lock.toml tersedia dan valid untuk MySQL', () => {
  const lockPath = path.resolve(process.cwd(), 'prisma/migrations/migration_lock.toml');
  const sqlPath = path.resolve(
    process.cwd(),
    'prisma/migrations/20261118000000_init_fincop_schema/migration.sql'
  );
  assert.ok(fs.existsSync(lockPath));
  assert.ok(fs.existsSync(sqlPath));

  const lockContent = fs.readFileSync(lockPath, 'utf8');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  assert.ok(lockContent.includes('provider = "mysql"'));
  assert.ok(sqlContent.includes('CREATE TABLE `wallets`'));
  assert.ok(sqlContent.includes('CREATE TABLE `cash_transactions`'));
  assert.ok(sqlContent.includes('DECIMAL(18, 2)'));
});

test('Sistem Ledger: mencatat inflow, outflow, menolak saldo minus, serta mendukung soft void & rekonsiliasi', async () => {
  const { tx, wallets, cashTransactions } = createMockLedgerTx([
    { id: 1, name: 'BCA', currentBalance: '0.00', isActive: true },
    { id: 2, name: 'Dompet Nonaktif', currentBalance: '50000.00', isActive: false },
  ]);

  // 1. Saldo awal Rp1.000.000
  const initEntry = await recordLedgerEntryTx(tx, {
    walletId: 1,
    transactionDate: new Date('2026-11-18'),
    direction: CashFlowDirection.INFLOW,
    classification: LedgerClassification.INITIAL_BALANCE,
    amount: '1000000.00',
    referenceType: CashReferenceType.WALLET,
    referenceId: 1,
    description: 'Saldo awal dompet BCA',
  });
  assert.equal(initEntry.balanceAfter, '1000000.00');
  assert.equal(wallets[0].currentBalance, '1000000.00');

  // 2. Pengeluaran Rp250.500,50
  const expEntry = await recordLedgerEntryTx(tx, {
    walletId: 1,
    transactionDate: new Date('2026-11-18'),
    direction: CashFlowDirection.OUTFLOW,
    classification: LedgerClassification.EXPENSE,
    amount: '250500.50',
    referenceType: CashReferenceType.EXPENSE,
    referenceId: 10,
    description: 'Bayar WiFi bulanan',
  });
  assert.equal(expEntry.balanceAfter, '749499.50');
  assert.equal(wallets[0].currentBalance, '749499.50');

  // 3. Tolak pengeluaran melebihi saldo
  await assert.rejects(
    () =>
      recordLedgerEntryTx(tx, {
        walletId: 1,
        transactionDate: new Date('2026-11-18'),
        direction: CashFlowDirection.OUTFLOW,
        classification: LedgerClassification.EXPENSE,
        amount: '900000.00',
        referenceType: CashReferenceType.EXPENSE,
        referenceId: 11,
        description: 'Transaksi melebihi saldo',
      }),
    /tidak mencukupi/
  );

  // 4. Tolak transaksi pada dompet nonaktif
  await assert.rejects(
    () =>
      recordLedgerEntryTx(tx, {
        walletId: 2,
        transactionDate: new Date('2026-11-18'),
        direction: CashFlowDirection.INFLOW,
        classification: LedgerClassification.INCOME,
        amount: '10000.00',
        referenceType: CashReferenceType.INCOME,
        referenceId: 99,
        description: 'Masuk ke dompet nonaktif',
      }),
    /nonaktif/
  );

  // 5. Soft void pengeluaran #10 -> saldo kembali ke Rp1.000.000,00 tanpa menghapus histori
  const voidedCount = await voidLedgerEntriesByReferenceTx(tx, CashReferenceType.EXPENSE, 10);
  assert.equal(voidedCount, 1);
  assert.equal(cashTransactions.length, 2);
  assert.equal(cashTransactions[1].isVoided, true);
  assert.equal(wallets[0].currentBalance, '1000000.00');

  // 6. Rekonsiliasi ulang konsisten
  const reconciled = await reconcileWalletBalanceTx(tx, 1);
  assert.equal(reconciled, '1000000.00');
});

test('API Express /api/ledger/summary merespons struktur audit konsistensi saldo', async () => {
  const app = createExpressApp();
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });
  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const response = await fetch(`http://127.0.0.1:${address.port}/api/ledger/summary`);
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      data: {
        allConsistent: boolean;
        totalCachedBalance: string;
        totalLedgerBalance: string;
        wallets: unknown[];
      };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.allConsistent, true);
    assert.ok(Array.isArray(body.data.wallets));
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
