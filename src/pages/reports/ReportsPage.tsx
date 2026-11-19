import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CategoryExpenseChart } from '../../components/charts/CategoryExpenseChart';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useFincopStore } from '../../hooks/useFincopStore';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalSingkat, isDateInRange, type ReportPeriodPreset } from '../../utils/date';

const PRESETS: Array<{ value: ReportPeriodPreset; label: string }> = [
  { value: 'TODAY', label: 'Hari Ini' },
  { value: 'WEEK', label: 'Minggu Ini' },
  { value: 'MONTH', label: 'Bulan Ini' },
  { value: 'YEAR', label: 'Tahun Ini' },
  { value: 'CUSTOM', label: 'Rentang Khusus' },
];

export function ReportsPage() {
  const {
    wallets,
    incomes,
    expenses,
    transfers,
    debts,
    donations,
    sortedActiveQueue,
    matchHistory,
    getWalletName,
    notify,
  } = useFincopStore();

  const [preset, setPreset] = useState<ReportPeriodPreset>('MONTH');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');

  const filteredIncomes = useMemo(
    () => incomes.filter((i) => isDateInRange(i.date, preset, startDate, endDate)),
    [incomes, preset, startDate, endDate]
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (e) => e.status === 'LUNAS' && isDateInRange(e.date, preset, startDate, endDate)
      ),
    [expenses, preset, startDate, endDate]
  );

  const filteredTransfers = useMemo(
    () => transfers.filter((t) => isDateInRange(t.date, preset, startDate, endDate)),
    [transfers, preset, startDate, endDate]
  );

  const filteredDonations = useMemo(
    () => donations.filter((d) => isDateInRange(d.date, preset, startDate, endDate)),
    [donations, preset, startDate, endDate]
  );

  const totalIncome = useMemo(
    () => filteredIncomes.reduce((s, i) => s + i.amount, 0),
    [filteredIncomes]
  );
  const totalExpense = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );
  const totalTransfer = useMemo(
    () => filteredTransfers.reduce((s, t) => s + t.amount, 0),
    [filteredTransfers]
  );
  const totalDonation = useMemo(
    () => filteredDonations.reduce((s, d) => s + d.amount, 0),
    [filteredDonations]
  );

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredIncomes.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + i.amount));
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredIncomes]);

  const totalCompletedMatches = useMemo(() => {
    const fromHistory = matchHistory.reduce((s, m) => s + m.completedMatches, 0);
    const fromActive = sortedActiveQueue.reduce((s, q) => s + q.completedMatches, 0);
    return fromHistory + fromActive;
  }, [matchHistory, sortedActiveQueue]);

  const totalRemainingMatches = useMemo(
    () => sortedActiveQueue.reduce((s, q) => s + q.remainingMatches, 0),
    [sortedActiveQueue]
  );

  const handleSimulatedExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    notify({
      type: 'info',
      title: `Simulasi Ekspor ${format}`,
      message: `Laporan periode terpilih (${format}) disimulasikan pada tahap UI Prototype.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Keuangan & Aktivitas"
        subtitle="Analisis pemasukan, pengeluaran, mutasi dompet, transfer internal, utang/piutang, donasi, dan performa match mabar."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => handleSimulatedExport('CSV')}>
              <Download className="h-3.5 w-3.5" />
              Ekspor CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleSimulatedExport('Excel')}>
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Ekspor Excel
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleSimulatedExport('PDF')}>
              <FileText className="h-3.5 w-3.5" />
              Ekspor PDF
            </Button>
          </>
        }
      />

      {/* Filter Periode */}
      <div className="flex flex-col justify-between gap-3 rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] p-3.5 dark:border-[#343434] dark:bg-[#202020] lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPreset(p.value)}
              className={`rounded-[2px] border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                preset === p.value
                  ? 'border-[#E87932] bg-[#E87932] text-white'
                  : 'border-[#E9E9E7] bg-[#FFFFFF] text-[#252525] hover:bg-[#F5F5F4] dark:border-[#343434] dark:bg-[#191919] dark:text-[#E6E6E6]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'CUSTOM' ? (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        ) : (
          <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">
            Referensi simulasi: 18 Nov 2026
          </p>
        )}
      </div>

      {/* Ringkasan KPI */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Pemasukan"
          value={formatRupiah(totalIncome)}
          helperText={`${filteredIncomes.length} transaksi masuk`}
          tone="success"
        />
        <StatCard
          label="Total Pengeluaran (Lunas)"
          value={formatRupiah(totalExpense)}
          helperText={`${filteredExpenses.length} transaksi keluar`}
          tone="danger"
        />
        <StatCard
          label="Total Donasi Live Stream"
          value={formatRupiah(totalDonation)}
          helperText={`${filteredDonations.length} donasi tercatat`}
        />
        <StatCard
          label="Volume Transfer Internal"
          value={formatRupiah(totalTransfer)}
          helperText="Tidak memengaruhi arus kas bersih"
        />
      </div>

      {/* Grafik per Kategori */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]">
          <h2 className="mb-1 text-[15px] font-semibold">Laporan Pengeluaran per Kategori</h2>
          <p className="mb-3 text-[12px] text-[#787774] dark:text-[#9B9B9B]">
            Akumulasi pengeluaran berstatus Lunas pada periode terpilih
          </p>
          {expenseByCategory.length > 0 ? (
            <CategoryExpenseChart data={expenseByCategory} barColor="#D44C47" />
          ) : (
            <p className="py-12 text-center text-[13px] text-[#787774]">
              Tidak ada data pengeluaran pada periode ini.
            </p>
          )}
        </section>

        <section className="rounded-[2px] border border-[#E9E9E7] bg-[#FFFFFF] p-4 dark:border-[#343434] dark:bg-[#191919]">
          <h2 className="mb-1 text-[15px] font-semibold">Laporan Pemasukan per Kategori</h2>
          <p className="mb-3 text-[12px] text-[#787774] dark:text-[#9B9B9B]">
            Distribusi sumber pemasukan pada periode terpilih
          </p>
          {incomeByCategory.length > 0 ? (
            <CategoryExpenseChart data={incomeByCategory} barColor="#448361" />
          ) : (
            <p className="py-12 text-center text-[13px] text-[#787774]">
              Tidak ada data pemasukan pada periode ini.
            </p>
          )}
        </section>
      </div>

      {/* Laporan Saldo per Dompet & Match Mabar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-none border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919] lg:col-span-6">
          <div className="border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
            <h2 className="text-[15px] font-semibold">Laporan Saldo per Dompet</h2>
          </div>
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
                <th className="px-4 py-2 font-medium">Dompet</th>
                <th className="px-4 py-2 font-medium">Jenis</th>
                <th className="px-4 py-2 text-right font-medium">Saldo Awal</th>
                <th className="px-4 py-2 text-right font-medium">Saldo Kini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
              {wallets.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-2.5 font-medium">{w.name}</td>
                  <td className="px-4 py-2.5 text-[#787774] dark:text-[#9B9B9B]">{w.type}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {formatRupiah(w.initialBalance)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">
                    {formatRupiah(w.currentBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-none border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919] lg:col-span-6">
          <div className="border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
            <h2 className="text-[15px] font-semibold">Laporan Utang, Piutang & Match Mabar</h2>
          </div>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] p-3 dark:border-[#343434] dark:bg-[#202020]">
                <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Match Selesai</p>
                <p className="mt-1 font-mono text-[18px] font-semibold text-[#448361]">
                  {totalCompletedMatches} Match
                </p>
              </div>
              <div className="rounded-[2px] border border-[#E9E9E7] bg-[#F7F7F5] p-3 dark:border-[#343434] dark:bg-[#202020]">
                <p className="text-[12px] text-[#787774] dark:text-[#9B9B9B]">Match Tersisa</p>
                <p className="mt-1 font-mono text-[18px] font-semibold text-[#E87932]">
                  {totalRemainingMatches} Match
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E9E9E7] dark:border-[#343434]">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
                    <th className="px-3 py-2 font-medium">Pihak</th>
                    <th className="px-3 py-2 font-medium">Jenis</th>
                    <th className="px-3 py-2 text-right font-medium">Sisa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
                  {debts.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2">{d.partyName}</td>
                      <td className="px-3 py-2">
                        <StatusBadge tone={d.kind === 'UTANG' ? 'danger' : 'warning'}>
                          {d.kind}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatRupiah(d.remainingAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Ringkasan Tabel Transfer */}
      <section className="rounded-none border border-[#E9E9E7] bg-[#FFFFFF] dark:border-[#343434] dark:bg-[#191919]">
        <div className="border-b border-[#E9E9E7] px-4 py-3 dark:border-[#343434]">
          <h2 className="text-[15px] font-semibold">Laporan Transfer Antar-Dompet</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E9E9E7] bg-[#F7F7F5] text-[12px] text-[#787774] dark:border-[#343434] dark:bg-[#202020] dark:text-[#9B9B9B]">
                <th className="px-4 py-2 font-medium">Tanggal</th>
                <th className="px-4 py-2 font-medium">Asal</th>
                <th className="px-4 py-2 font-medium">Tujuan</th>
                <th className="px-4 py-2 text-right font-medium">Nominal</th>
                <th className="px-4 py-2 text-right font-medium">Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E9E7] dark:divide-[#343434]">
              {filteredTransfers.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 text-[#787774] tabular-nums dark:text-[#9B9B9B]">
                    {formatTanggalSingkat(t.date)}
                  </td>
                  <td className="px-4 py-2">{getWalletName(t.fromWalletId)}</td>
                  <td className="px-4 py-2">{getWalletName(t.toWalletId)}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatRupiah(t.amount)}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatRupiah(t.fee)}</td>
                </tr>
              ))}
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#787774]">
                    Tidak ada transfer internal pada periode ini.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
