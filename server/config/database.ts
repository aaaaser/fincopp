import { PrismaClient } from '@prisma/client';
import { env, parseMysqlConnectionInfo } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrismaClient(): PrismaClient | null {
  if (!env.DATABASE_URL) {
    return null;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  return globalForPrisma.prisma;
}

export interface DatabaseHealthResult {
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

export async function testDatabaseConnection(): Promise<DatabaseHealthResult> {
  const info = parseMysqlConnectionInfo(env.DATABASE_URL);

  if (!info.configured || !env.DATABASE_URL) {
    return {
      configured: false,
      connected: false,
      host: null,
      port: null,
      database: null,
      serverVersion: null,
      tableCount: 0,
      latencyMs: null,
      message:
        'DATABASE_URL belum dikonfigurasi pada file .env. Salin .env.example menjadi .env dan isi koneksi MySQL 8 Anda.',
    };
  }

  const client = getPrismaClient();
  if (!client) {
    return {
      configured: true,
      connected: false,
      host: info.host,
      port: info.port,
      database: info.database,
      serverVersion: null,
      tableCount: 0,
      latencyMs: null,
      message: 'Prisma Client gagal diinisialisasi.',
    };
  }

  const startedAt = Date.now();
  try {
    const versionRows = await client.$queryRaw<Array<{ version: string }>>`SELECT VERSION() AS version`;
    const tableRows = await client.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `;
    const latencyMs = Date.now() - startedAt;
    const serverVersion = versionRows[0]?.version ?? null;
    const tableCount = Number(tableRows[0]?.total ?? 0);

    return {
      configured: true,
      connected: true,
      host: info.host,
      port: info.port,
      database: info.database,
      serverVersion,
      tableCount,
      latencyMs,
      message:
        tableCount > 0
          ? `Terhubung ke MySQL (${serverVersion ?? 'MySQL 8'}) dengan ${tableCount} tabel aktif.`
          : 'Terhubung ke MySQL, namun tabel belum dibuat. Jalankan npm run prisma:migrate.',
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Gagal menghubungi server MySQL.';
    return {
      configured: true,
      connected: false,
      host: info.host,
      port: info.port,
      database: info.database,
      serverVersion: null,
      tableCount: 0,
      latencyMs: Date.now() - startedAt,
      message: `Koneksi MySQL gagal: ${errMessage}`,
    };
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
}
