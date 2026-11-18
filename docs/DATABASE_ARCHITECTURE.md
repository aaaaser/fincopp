# Arsitektur Database & Sistem Ledger FINCOP (MySQL 8 + Prisma ORM)

Database `fincop_db` dirancang menggunakan MySQL 8 lokal (Laragon / XAMPP / MySQL Server) dengan tipe data `DECIMAL(18, 2)` untuk seluruh nominal uang Rupiah (IDR).

## Prinsip Utama Sistem Ledger (`cash_transactions`)

1. **Sumber Kebenaran Tunggal (Single Source of Truth)**:
   Seluruh saldo per dompet dan total saldo seluruh dompet bersumber dari tabel `cash_transactions`. Kolom `wallets.current_balance` berfungsi sebagai cache yang selalu diperbarui di dalam database transaction (`prisma.$transaction`) yang sama saat entri ledger dicatat atau di-void.
2. **Klasifikasi Transaksi Eksplisit (`LedgerClassification`)**:
   - `INITIAL_BALANCE` & `BALANCE_ADJUSTMENT`: Saldo awal saat dompet dibuat dan koreksi saldo teraudit.
   - `INCOME` & `DONATION`: Pemasukan dan donasi live streaming (donasi tercatat satu kali di pemasukan/kas).
   - `EXPENSE` & `RECURRING_PAYMENT`: Pengeluaran tidak rutin & konfirmasi bayar tagihan rutin.
   - `TRANSFER_IN` & `TRANSFER_OUT`: Transfer antar-dompet. Mengubah saldo masing-masing dompet, tetapi netral terhadap total saldo dan laporan pemasukan/pengeluaran.
   - `DEBT_DISBURSEMENT`, `DEBT_REPAYMENT`, `RECEIVABLE_DISBURSEMENT`, `RECEIVABLE_REPAYMENT`: Arus kas utang dan piutang aktual.
3. **Audit & Anti Hapus Sembarangan**:
   Pembatalan transaksi menggunakan mekanisme *soft void* (`is_voided = true`, `voided_at`) lalu menghitung ulang saldo dompet dari ledger yang masih aktif.
4. **Anti Pembayaran Ganda & Anti Match Ganda**:
   - `recurring_expense_payments`: unique key `(recurring_expense_id, period_key)`.
   - `match_history`: unique key `(queue_id, match_number)`.
   - `notifications`: unique key `(type, reference_type, reference_id, reminder_key)`.
