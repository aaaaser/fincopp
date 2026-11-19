import {
  ArrowDownLeft,
  ArrowUpRight,
  BellRing,
  Gift,
  HandCoins,
  ListOrdered,
  Plus,
  Wallet,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CashFlowChart } from '../../components/charts/CashFlowChart';
import { CategoryExpenseChart } from '../../components/charts/CategoryExpenseChart';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useFincopStore } from '../../hooks/useFincopStore';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat } from '../../utils/date';

const CURRENT_MONTH_PREFIX = '2026-11';

export function DashboardPage() {
  const {
    wallets,
    incomes,
    expenses,
    debts,
    donations,
    sortedActiveQueue,
    getWalletName,
    setQuickAddType,
  } = useFincopStore();

  const totalBalance = useMemo(
    () => wallets.filter((w) => w.isActive).reduce((sum, w) => sum + w.currentBalance, 0),
    [wallets]
  );

  const monthlyIncome = useMemo(
    () =>
      incomes
        .filter((i) => i.date.startsWith(CURRENT_MONTH_PREFIX))
        .reduce((sum, i) => sum + i.amount, 0),
    [incomes]
  );

  const monthlyExpense = useMemo(
    () =>
      expenses
        .filter((e) => e.status === 'LUNAS' && e.date.startsWith(CURRENT_MONTH_PREFIX))
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const totalUtang = useMemo(
    () =>
      debts
        .filter((d) => d.kind === 'UTANG' && d.status !== 'LUNAS')
        .reduce((sum, d) => sum + d.remainingAmount, 0),
    [debts]
  );

  const totalPiutang = useMemo(
    () =>
      debts
        .filter((d) => d.kind === 'PIUTANG' && d.status !== 'LUNAS')
        .reduce((sum, d) => sum + d.remainingAmount, 0),
    [debts]
  );

  const totalDonationAmount = useMemo(
    () => donations.reduce((sum, d) => sum + d.amount, 0),
    [donations]
  );

  const remainingMatches = useMemo(
    () => sortedActiveQueue.reduce((sum, q) => sum + q.remainingMatches, 0),
    [sortedActiveQueue]
  );

  const cashFlowData = useMemo(
    () => [
      { label: 'Jul', pemasukan: 8200000, pengeluaran: 4900000 },
      { label: 'Agu', pemasukan: 9100000, pengeluaran: 5300000 },
      { label: 'Sep', pemasukan: 8750000, pengeluaran: 5150000 },
      { label: 'Okt', pemasukan: 9800000, pengeluaran: 5600000 },
      { label: 'Nov', pemasukan: monthlyIncome, pengeluaran: monthlyExpense },
    ],
    [monthlyIncome, monthlyExpense]
  );

  const categoryExpenseData = useMemo(() => {
    const map = new Map<string, number>();
    expenses
      .filter((e) => e.status === 'LUNAS')
      .forEach((e) => {
        map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
      });
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [expenses]);

  const recentTransactions = useMemo(() => {
    const incItems = incomes.map((i) => ({
      id: i.id,
      date: i.date,
      title: i.title,
      category: i.category,
      wallet: getWalletName(i.walletId),
      amount: i.amount,
      kind: 'MASUK' as const,
    }));
    const expItems = expenses
      .filter((e) => e.status === 'LUNAS')
      .map((e) => ({
        id: e.id,
        date: e.date,
        title: e.title,
        category: e.category,
        wallet: getWalletName(e.walletId),
        amount: e.amount,
        kind: 'KELUAR' as const,
      }));
    return [...incItems, ...expItems]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [incomes, expenses, getWalletName]);

  const upcomingBills = useMemo(
    () =>
      expenses
        .filter((e) => e.kind === 'RUTIN' && e.status !== 'LUNAS')
        .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')),
    [expenses]
  );

  const activeDebts = useMemo(
    () =>
      debts
        .filter((d) => d.status !== 'LUNAS')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [debts]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Keuangan"
        subtitle="Ringkasan saldo multi-dompet, arus kas, tagihan jatuh tempo, utang/piutang, dan antrean mabar (UI Prototype — state lokal)."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setQuickAddType('expense')}>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#D44C47]" />
              Catat Pengeluaran
            </Button>
            <Button variant="primary" size="sm" onClick={() => setQuickAddType('income')}>
              <Plus className="h-3.5 w-3.5" />
              Tambah Pemasukan
            </Button>
          </>
        }
      />

      {/* Baris KPI Keuangan */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Saldo Gabungan"
          value={formatRupiah(totalBalance)}
          helperText={`${wallets.filter((w) => w.isActive).length} dompet aktif`}
          icon={Wallet}
          tone="default"
        />
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatRupiah(monthlyIncome)}
          helperText="November 2026 (non-transfer)"
          icon={ArrowDownLeft}
          tone="success"
        />
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatRupiah(monthlyExpense)}
          helperText="Hanya transaksi berstatus Lunas"
          icon={ArrowUpRight}
          tone="danger"
        />
        <StatCard
          label="Arus Kas Bersih"
          value={formatRupiah(monthlyIncome - monthlyExpense)}
          helperText="Selisih pemasukan & pengeluaran"
          icon={Wallet}
          tone={monthlyIncome - monthlyExpense >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Baris KPI Utang, Piutang, Donasi, Mabar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Utang Berjalan"
          value={formatRupiah(totalUtang)}
          helperText={`${debts.filter((d) => d.kind === 'UTANG' && d.status !== 'LUNAS').length} kewajiban aktif`}
          icon={HandCoins}
          tone="danger"
        />
        <StatCard
          label="Total Piutang Berjalan"
          value={formatRupiah(totalPiutang)}
          helperText={`${debts.filter((d) => d.kind === 'PIUTANG' && d.status !== 'LUNAS').length} tagihan ke pihak lain`}
          icon={HandCoins}
          tone="warning"
        />
        <StatCard
          label="Total Donasi Live Stream"
          value={formatRupiah(totalDonationAmount)}
          helperText={`${donations.length} donasi tercatat`}
          icon={Gift}
          tone="default"
        />
        <StatCard
          label="Antrean & Sisa Match"
          value={`${sortedActiveQueue.length} Antrean · ${remainingMatches} Match`}
          helperText="Aturan FIFO + prioritas manual"
          icon={ListOrdered}
          tone="default"
        />
      </div>

      {/* Grafik Arus Kas & Kategori */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919] lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                Grafik Pemasukan vs Pengeluaran
              </h2>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                Perbandingan 5 bulan terakhir dalam Rupiah
              </p>
            </div>
            <Link
              to="/laporan"
              className="text-[12px] font-medium text-[#E87932] hover:underline"
            >
              Lihat Laporan →
            </Link>
          </div>
          <CashFlowChart data={cashFlowData} />
        </section>

        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919] lg:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                Pengeluaran per Kategori
              </h2>
              <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                Distribusi pengeluaran lunas terbesar
              </p>
            </div>
            <Link
              to="/pengeluaran"
              className="text-[12px] font-medium text-[#E87932] hover:underline"
            >
              Detail →
            </Link>
          </div>
          <CategoryExpenseChart data={categoryExpenseData} />
        </section>
      </div>

      {/* Ringkasan Saldo Dompet + Tagihan Jatuh Tempo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919] lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
            <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
              Saldo per Dompet
            </h2>
            <Link to="/dompet" className="text-[12px] font-medium text-[#E87932] hover:underline">
              Kelola Dompet →
            </Link>
          </div>
          <div className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between px-4 py-2.5 text-[13px]"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#252525] dark:text-[#E6E6E6]">{w.name}</p>
                  <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">{w.type}</p>
                </div>
                <p className="font-mono font-medium text-[#252525] tabular-nums dark:text-[#E6E6E6]">
                  {formatRupiah(w.currentBalance)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919] lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-[#E87932]" aria-hidden="true" />
              <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
                Tagihan Rutin & Jatuh Tempo
              </h2>
            </div>
            <Link
              to="/pengeluaran"
              className="text-[12px] font-medium text-[#E87932] hover:underline"
            >
              Buka Tagihan →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
                  <th className="px-4 py-2 font-medium">Tagihan</th>
                  <th className="px-4 py-2 font-medium">Jatuh Tempo</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
                {upcomingBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-[#252525] dark:text-[#E6E6E6]">
                        {bill.title}
                      </p>
                      <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                        {bill.category} · {getWalletName(bill.walletId)}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-[#787774] tabular-nums dark:text-[#9B9B9B]">
                      {bill.dueDate ? formatTanggalSingkat(bill.dueDate) : '-'}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge tone={bill.status === 'TERLAMBAT' ? 'danger' : 'warning'}>
                        {bill.status === 'TERLAMBAT' ? 'Terlambat' : 'Belum Dibayar'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatRupiah(bill.amount)}
                    </td>
                  </tr>
                ))}
                {upcomingBills.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]"
                    >
                      Semua tagihan rutin periode ini sudah lunas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Transaksi Terbaru, Pengingat Utang/Piutang, Antrean Mabar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919] lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
            <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
              Transaksi Terbaru
            </h2>
            <Link
              to="/pemasukan"
              className="text-[12px] font-medium text-[#E87932] hover:underline"
            >
              Semua →
            </Link>
          </div>
          <div className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                <div className="min-w-0 pr-3">
                  <p className="truncate font-medium text-[#252525] dark:text-[#E6E6E6]">
                    {tx.title}
                  </p>
                  <p className="truncate text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                    {formatTanggalSingkat(tx.date)} · {tx.category} · {tx.wallet}
                  </p>
                </div>
                <span
                  className={`font-mono font-medium tabular-nums shrink-0 ${
                    tx.kind === 'MASUK' ? 'text-[#448361]' : 'text-[#D44C47]'
                  }`}
                >
                  {tx.kind === 'MASUK' ? '+' : '-'}
                  {formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919] lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
            <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
              Pengingat Utang & Piutang
            </h2>
            <Link
              to="/utang-piutang"
              className="text-[12px] font-medium text-[#E87932] hover:underline"
            >
              Kelola →
            </Link>
          </div>
          <div className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
            {activeDebts.map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between px-4 py-2.5 text-[13px]"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge tone={debt.kind === 'UTANG' ? 'danger' : 'success'}>
                      {debt.kind === 'UTANG' ? 'Utang' : 'Piutang'}
                    </StatusBadge>
                    <p className="truncate font-medium text-[#252525] dark:text-[#E6E6E6]">
                      {debt.partyName}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                    Jatuh tempo {formatTanggalSingkat(debt.dueDate)}
                  </p>
                </div>
                <p className="font-mono font-medium text-[#252525] tabular-nums dark:text-[#E6E6E6]">
                  {formatRupiah(debt.remainingAmount)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
            <h2 className="text-[15px] font-semibold text-[#252525] dark:text-[#E6E6E6]">
              Antrean Mabar
            </h2>
            <Link
              to="/antrean-mabar"
              className="text-[12px] font-medium text-[#E87932] hover:underline"
            >
              Kelola →
            </Link>
          </div>
          <div className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
            {sortedActiveQueue.slice(0, 4).map((q, idx) => (
              <div key={q.id} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                <div className="min-w-0 pr-2">
                  <p className="truncate font-medium text-[#252525] dark:text-[#E6E6E6]">
                    #{idx + 1} {q.nickname}
                  </p>
                  <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
                    {q.platform} · {q.completedMatches}/{q.totalMatches} match
                  </p>
                </div>
                <StatusBadge tone={q.status === 'BERLANGSUNG' ? 'accent' : 'neutral'}>
                  {q.remainingMatches} sisa
                </StatusBadge>
              </div>
            ))}
            {sortedActiveQueue.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-[#787774] dark:text-[#9B9B9B]">
                Belum ada antrean aktif.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
