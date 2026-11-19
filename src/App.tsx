import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { FincopStoreProvider } from './hooks/useFincopStore';
import { useTheme } from './hooks/useTheme';
import { BackupPage } from './pages/backup/BackupPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DebtsPage } from './pages/debts/DebtsPage';
import { DonationsPage } from './pages/donations/DonationsPage';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { IncomePage } from './pages/income/IncomePage';
import { MatchHistoryPage } from './pages/match-history/MatchHistoryPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { QueuePage } from './pages/queue/QueuePage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { TransfersPage } from './pages/transfers/TransfersPage';
import { WalletsPage } from './pages/wallets/WalletsPage';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <FincopStoreProvider>
      <HashRouter>
        <MainLayout theme={theme} onToggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dompet" element={<WalletsPage />} />
            <Route path="/pemasukan" element={<IncomePage />} />
            <Route path="/pengeluaran" element={<ExpensesPage />} />
            <Route path="/transfer" element={<TransfersPage />} />
            <Route path="/utang-piutang" element={<DebtsPage />} />
            <Route path="/donasi" element={<DonationsPage />} />
            <Route path="/antrean-mabar" element={<QueuePage />} />
            <Route path="/riwayat-mabar" element={<MatchHistoryPage />} />
            <Route path="/laporan" element={<ReportsPage />} />
            <Route path="/notifikasi" element={<NotificationsPage />} />
            <Route path="/backup-restore" element={<BackupPage />} />
            <Route
              path="/pengaturan"
              element={<SettingsPage theme={theme} onToggleTheme={toggleTheme} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </HashRouter>
    </FincopStoreProvider>
  );
}
