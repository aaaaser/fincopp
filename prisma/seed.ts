import 'dotenv/config';
import { PrismaClient, ThemeMode, WalletType } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Memulai proses seed database FINCOP...');

  // 1. Pengaturan default aplikasi
  await prisma.appSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      appName: 'FINCOP',
      appSubtitle: 'FINANSIAL UCOPP',
      currencyCode: 'IDR',
      theme: ThemeMode.LIGHT,
      matchPrice: '1000.00',
      reminderDaysJson: '[7,3,1,0]',
      desktopNotifyEnabled: true,
      autoBackupEnabled: false,
      backupRetentionCount: 14,
    },
  });

  // 2. Dompet bawaan awal (saldo awal 0; pengguna dapat mengedit/menambah di Modul Dompet)
  const defaultWallet = await prisma.wallet.upsert({
    where: { name: 'Kas Tunai Utama' },
    update: {},
    create: {
      name: 'Kas Tunai Utama',
      type: WalletType.CASH,
      initialBalance: '0.00',
      currentBalance: '0.00',
      description: 'Dompet uang tunai pribadi bawaan sistem.',
      isActive: true,
    },
  });

  console.log(`Dompet default siap: ${defaultWallet.name}`);

  // 3. Kategori Pemasukan Default
  const incomeCategories = [
    { name: 'Gaji', slug: 'gaji' },
    { name: 'Pekerjaan sampingan', slug: 'pekerjaan-sampingan' },
    { name: 'Freelance', slug: 'freelance' },
    { name: 'Pendapatan live streaming', slug: 'pendapatan-live-streaming' },
    { name: 'Bonus', slug: 'bonus' },
    { name: 'Hadiah', slug: 'hadiah' },
    { name: 'Lainnya', slug: 'pemasukan-lainnya' },
  ];

  for (const cat of incomeCategories) {
    await prisma.incomeCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, isSystem: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        isSystem: true,
      },
    });
  }

  // 4. Kategori Pengeluaran Rutin Default
  const recurringExpenseCategories = [
    { name: 'WiFi', slug: 'wifi' },
    { name: 'Listrik', slug: 'listrik' },
    { name: 'BPJS', slug: 'bpjs' },
    { name: 'Langganan aplikasi', slug: 'langganan-aplikasi' },
    { name: 'Hosting', slug: 'hosting' },
    { name: 'VPS', slug: 'vps' },
    { name: 'Domain', slug: 'domain' },
    { name: 'Lainnya', slug: 'rutin-lainnya' },
  ];

  for (const cat of recurringExpenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, isRecurringType: true, isSystem: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        isRecurringType: true,
        isSystem: true,
      },
    });
  }

  // 5. Kategori Pengeluaran Tidak Rutin Default
  const nonRecurringExpenseCategories = [
    { name: 'Makan', slug: 'makan' },
    { name: 'Transportasi', slug: 'transportasi' },
    { name: 'Belanja', slug: 'belanja' },
    { name: 'Hiburan', slug: 'hiburan' },
    { name: 'Kebutuhan pribadi', slug: 'kebutuhan-pribadi' },
    { name: 'Lainnya', slug: 'pengeluaran-lainnya' },
  ];

  for (const cat of nonRecurringExpenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, isRecurringType: false, isSystem: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        isRecurringType: false,
        isSystem: true,
      },
    });
  }

  console.log('Seed dompet default, kategori & pengaturan FINCOP selesai.');
}

main()
  .catch((error) => {
    console.error('Gagal menjalankan seed database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
