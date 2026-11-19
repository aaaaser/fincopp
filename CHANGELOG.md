# Changelog

Semua perubahan penting pada proyek **FINCOP (Finansial Ucopp)** dicatat menggunakan format Conventional Commits.

## [0.3.0] - 2026-11-18 (Tahap 1 — UI Prototype)

### Added
- Implementasi penuh UI Prototype **FINCOP (Finansial Ucopp)** dengan 13 halaman lengkap berbasis `HashRouter` dan Notion-inspired design system (`2px` radius komponen, `0px` radius sidebar & tabel).
- State lokal interaktif (`FincopStoreProvider`) dengan data dummy Rupiah realistis, validasi formulir **React Hook Form + Zod**, pencarian cepat **`Ctrl + K`**, Quick Add di header, serta aksi simulasi CRUD untuk Dompet, Pemasukan, Pengeluaran Rutin/Tidak Rutin, Transfer, Utang & Piutang, Donasi Live Stream, Antrean Mabar FIFO & Prioritas, Riwayat Mabar, Laporan, Notifikasi, Backup & Restore, dan Pengaturan.

## [0.2.1] - 2026-11-18 (Design System)

### Changed
- Menerapkan FINCOP Design System terinspirasi Notion (`Inter`, radius `2px` untuk card/button/input/select/modal/dropdown/badge, `0px` untuk sidebar/table, serta palet warna Light/Dark Notion dengan aksen `#E87932`).
- Menambahkan komponen UI reusable standar di `src/components/ui/` (`Button`, `Input`, `Select`, `Modal`, `DataTable`, `Badge`, `Dropdown`, `Tooltip`).
- Memperbarui sidebar permanen yang dapat diciutkan dan header workspace dengan breadcrumb, pencarian, notifikasi, dan profil pengguna.

## [0.2.0] - 2026-11-18 (Fase 2)

### Added
- Skema final 17 tabel MySQL 8 dengan tipe `Decimal(18,2)`, mendukung `wallets`, `wallet_transfers`, dan `backup_logs`.
- File migrasi awal SQL Prisma (`prisma/migrations/20261118000000_init_fincop_schema/migration.sql`) beserta `migration_lock.toml`.
- Utilitas aritmatika uang berbasis `BigInt` (`server/utils/decimal.ts`) bebas error *floating-point*.
- Layanan ledger atomik (`server/services/ledger.service.ts`) untuk pencatatan `cash_transactions`, sinkronisasi `wallets.current_balance`, rekonsiliasi saldo, dan *soft void*.
- Endpoint `GET /api/ledger/summary` dan `GET /api/ledger/entries` beserta validator Zod.
- Seed dompet default (`Kas Tunai Utama`) pada `prisma/seed.ts`.
- Pengujian Fase 2 (`tests/fase2-ledger.test.ts`) untuk validasi aritmatika `Decimal(18,2)`, transaksi ledger atomik, dan konsistensi saldo.

## [0.1.0] - 2026-11-18 (Fase 1)

### Added
- Struktur proyek modular (`electron/`, `server/`, `src/`, `prisma/`, `scripts/`, `tests/`, `docs/`).
- Konfigurasi Electron (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`) dan Electron Builder (`electron-builder.yml`).
- Backend Express + Vite middleware pada port 3000 dan endpoint `GET /api/health`.
- Antarmuka React + TypeScript + Tailwind CSS (mode terang/gelap, aksen orange, layout sidebar desktop).
