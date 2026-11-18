import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createExpressApp } from '../server/app';
import { parseMysqlConnectionInfo } from '../server/config/env';
import { moneyDecimalSchema } from '../server/validators/common.validator';
import {
  calculateMatchAllocation,
  centsToDecimalString,
  formatRupiah,
  parseDecimalToCents,
} from '../src/utils/currency';

test('Utilitas Rupiah: konversi desimal ke sen tanpa error floating-point', () => {
  assert.equal(parseDecimalToCents('10000.50'), 1000050);
  assert.equal(centsToDecimalString(1000050), '10000.50');
  assert.equal(formatRupiah(1500000), 'Rp1.500.000');
  assert.equal(formatRupiah('10500.50'), 'Rp10.500,50');
});

test('Utilitas Donasi & Match: 1 match = Rp1.000 dengan pembulatan ke bawah & sisa nominal', () => {
  assert.deepEqual(calculateMatchAllocation(1000), { matchCount: 1, remainderRupiah: 0 });
  assert.deepEqual(calculateMatchAllocation(5000), { matchCount: 5, remainderRupiah: 0 });
  assert.deepEqual(calculateMatchAllocation(10500), { matchCount: 10, remainderRupiah: 500 });
  assert.throws(() => calculateMatchAllocation(-1000), /tidak boleh negatif/);
});

test('Validator Zod: menolak nominal negatif, nol, dan format desimal berlebih', () => {
  assert.equal(moneyDecimalSchema.safeParse('150000').success, true);
  assert.equal(moneyDecimalSchema.safeParse('150000.75').success, true);
  assert.equal(moneyDecimalSchema.safeParse('0').success, false);
  assert.equal(moneyDecimalSchema.safeParse('-5000').success, false);
  assert.equal(moneyDecimalSchema.safeParse('100.123').success, false);
});

test('Konfigurasi Env: parsing URL MySQL tanpa membocorkan kredensial', () => {
  const parsed = parseMysqlConnectionInfo('mysql://ucopp:rahasia@127.0.0.1:3306/fincop_db');
  assert.equal(parsed.configured, true);
  assert.equal(parsed.host, '127.0.0.1');
  assert.equal(parsed.port, '3306');
  assert.equal(parsed.database, 'fincop_db');
  assert.equal(parsed.user, 'ucopp');
});

test('Prisma Schema: seluruh 17 tabel wajib FINCOP dan Decimal(18,2) terdefinisi', () => {
  const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const expectedTables = [
    'app_settings',
    'wallets',
    'wallet_transfers',
    'income_categories',
    'incomes',
    'expense_categories',
    'expenses',
    'recurring_expenses',
    'recurring_expense_payments',
    'debts',
    'debt_payments',
    'donations',
    'match_queues',
    'match_history',
    'cash_transactions',
    'notifications',
    'backup_logs',
  ];

  for (const table of expectedTables) {
    assert.ok(
      schemaContent.includes(`@@map("${table}")`),
      `Tabel ${table} harus ada di schema.prisma`
    );
  }
  assert.ok(schemaContent.includes('@db.Decimal(18, 2)'));
});

test('Keamanan Electron: contextIsolation aktif dan nodeIntegration nonaktif', () => {
  const mainTs = fs.readFileSync(path.resolve(process.cwd(), 'electron/main.ts'), 'utf8');
  assert.ok(mainTs.includes('contextIsolation: true'));
  assert.ok(mainTs.includes('nodeIntegration: false'));
  assert.ok(mainTs.includes('sandbox: true'));
});

test('API Express /api/health merespons 17 tabel skema & status FINCOP', async () => {
  const app = createExpressApp();
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });
  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      success: boolean;
      data: {
        application: { name: string; subtitle: string };
        schema: { totalTables: number };
      };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.application.name, 'FINCOP');
    assert.equal(body.data.application.subtitle, 'FINANSIAL UCOPP');
    assert.equal(body.data.schema.totalTables, 17);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('Prisma CLI: validasi schema.prisma berhasil', () => {
  const output = execSync('npx prisma validate', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@127.0.0.1:3306/fincop_db',
    },
    encoding: 'utf8',
  });
  assert.ok(output.includes('is valid'));
});
