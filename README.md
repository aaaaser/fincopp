# FINCOP — Finansial Ucopp

## 1. Deskripsi Aplikasi

**FINCOP (Finansial Ucopp)** adalah aplikasi desktop manajemen keuangan pribadi (*personal finance*) untuk Windows yang berjalan secara **100% lokal dan offline** dengan database **MySQL 8**. Aplikasi ini dirancang untuk mencatat dan mengaudit arus kas lintas banyak dompet (*multi-wallet*), pemasukan, pengeluaran rutin dan tidak rutin, utang-piutang beserta cicilan, donasi live streaming, antrean mabar FIFO, laporan keuangan, notifikasi desktop, serta backup & restore database.

---

## 2. Daftar Fitur

- **Multi-Dompet & Transfer Antar-Dompet**: Kelola dompet Bank, Cash/Tunai, E-wallet, dan Lainnya dengan saldo konsisten berbasis ledger (`cash_transactions`) serta transfer antar-dompet yang netral terhadap pemasukan/pengeluaran.
- **Dashboard Keuangan**: Total seluruh saldo dompet, pemasukan/pengeluaran bulanan, total utang & piutang, total donasi live stream, total match tersisa, grafik arus kas & kategori, tagihan jatuh tempo, dan ringkasan antrean mabar.
- **Manajemen Pemasukan & Pengeluaran**: CRUD lengkap dengan pembatalan historis (*soft cancel*), pemisahan pengeluaran rutin (WiFi, Listrik, BPJS, Langganan aplikasi, Hosting, VPS, Domain) dan tidak rutin, jadwal otomatis periode berikutnya, serta proteksi anti pembayaran ganda.
- **Utang & Piutang + Cicilan**: Pencatatan kewajiban & tagihan pihak lain dengan pembayaran bertahap per dompet yang memperbarui buku kas secara atomik.
- **Donasi Live Streaming & Antrean Mabar FIFO**: Input manual donasi TikTok/YouTube (`1 match = Rp1.000`, `FLOOR(Nominal / 1.000)` + sisa nominal), antrean mabar FIFO otomatis, prioritas manual, serta penyelesaian match berbasis database transaction.
- **Laporan & Ekspor**: Filter periode, dompet, dan kategori dengan ekspor ke **CSV**, **Excel**, dan **PDF**.
- **Notifikasi Desktop**: Pengingat tagihan rutin, utang, dan piutang via **Electron Notification API** tanpa duplikasi.
- **Backup & Restore Database**: Backup manual, backup terjadwal otomatis dengan retensi, dan restore aman menggunakan backup pengaman.

---

## 3. Teknologi

- **Desktop Framework**: Electron + Electron Builder (Windows NSIS `.exe`)
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Recharts + Lucide React
- **Backend**: Node.js + Express.js + Zod
- **Database & ORM**: MySQL 8 Lokal + Prisma ORM (`DECIMAL(18,2)`)

---

## 4. Persyaratan Sistem

- Sistem Operasi: **Windows 10 / Windows 11 (64-bit)**
- **Node.js** versi `20.19+` atau `22.x LTS`
- **MySQL Server 8.0+** (via **Laragon**, **XAMPP**, atau **MySQL Community Server**)
- Minimal RAM 4 GB dan ruang penyimpanan kosong 500 MB

---

## 5. Instalasi Node.js

1. Unduh installer **Node.js LTS (v22.x)** dari [https://nodejs.org](https://nodejs.org).
2. Jalankan installer `.msi` dan pastikan opsi **Add to PATH** aktif.
3. Verifikasi melalui Command Prompt / PowerShell:
   ```bash
   node -v
   npm -v
   ```

---

## 6. Instalasi MySQL melalui Laragon / XAMPP atau MySQL Server

- **Menggunakan Laragon (Direkomendasikan di Windows)**:
  1. Unduh dan instal Laragon dari [https://laragon.org](https://laragon.org) (pastikan memilih/mengaktifkan MySQL 8).
  2. Klik **Start All** pada Laragon hingga layanan **MySQL** aktif di port `3306`.
- **Menggunakan XAMPP**:
  1. Unduh dan instal XAMPP.
  2. Buka XAMPP Control Panel lalu klik **Start** pada modul **MySQL** (port `3306`).
- **Menggunakan MySQL Community Server 8.0+**:
  1. Unduh dari [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/), instal, atur port `3306`, dan pastikan service Windows `MySQL80` berjalan.

---

## 7. Cara Membuat Database `fincop_db`

Buka terminal MySQL / HeidiSQL / phpMyAdmin, lalu jalankan perintah berikut:

```sql
CREATE DATABASE IF NOT EXISTS fincop_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## 8. Konfigurasi `.env`

1. Salin file `.env.example` menjadi `.env`:
   ```bash
   copy .env.example .env
   ```
   *(Di Linux/macOS: `cp .env.example .env`)*
2. Buka `.env` lalu isi `DATABASE_URL` sesuai kredensial MySQL lokal Anda (contoh default Laragon/XAMPP tanpa password: `mysql://root:@127.0.0.1:3306/fincop_db`):
   ```env
   DATABASE_URL="mysql://root:password_mysql_anda@127.0.0.1:3306/fincop_db"
   PORT=3000
   NODE_ENV="development"
   APP_URL="http://127.0.0.1:3000"
   ```

---

## 9. Instalasi Dependency

Jalankan perintah berikut pada root folder proyek:

```bash
npm install
```

---

## 10. Prisma Migration

Setelah `fincop_db` dibuat dan `.env` dikonfigurasi, generate Prisma Client lalu terapkan migrasi awal ke MySQL:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

*(Untuk pengembangan skema lanjutan, gunakan `npm run prisma:migrate`.)*

---

## 11. Seed Database

Isi pengaturan awal, dompet bawaan (`Kas Tunai Utama`), serta kategori pemasukan dan pengeluaran:

```bash
npm run prisma:seed
```

Periksa koneksi database lewat terminal:

```bash
npm run db:check
```

---

## 12. Menjalankan Development

- **Mode Web + Backend Express (port 3000)**:
  ```bash
  npm run dev
  ```
- **Mode Aplikasi Desktop Electron**:
  ```bash
  npm run dev:electron
  ```
- **Menjalankan Pengujian Otomatis**:
  ```bash
  npm test
  ```

---

## 13. Build Installer Windows

1. Pastikan pengecekan tipe TypeScript bersih:
   ```bash
   npm run lint
   ```
2. Bangun frontend, proses Electron, dan installer `.exe` Windows:
   ```bash
   npm run build:win
   ```
   File installer akan dihasilkan pada folder `release/FINCOP-Setup-<versi>.exe`.

---

## 14. Status Tahap Saat Ini — UI Prototype (Tahap 1)

Saat ini antarmuka **FINCOP (Finansial Ucopp)** berjalan sebagai **UI Prototype interaktif lengkap (13 halaman)** dengan data dummy Rupiah (`IDR`) yang dikelola pada *local state* (`FincopStoreProvider`) tanpa koneksi langsung ke MySQL 8:

1. **Dashboard (`/`)**: Total saldo gabungan, pemasukan & pengeluaran bulanan, total utang/piutang, total donasi live stream, antrean & sisa match, grafik arus kas vs kategori, saldo dompet, tagihan jatuh tempo, transaksi terbaru, pengingat utang/piutang, dan antrean mabar.
2. **Dompet (`/dompet`)**: Multi-dompet (`Bank`, `Tunai`, `E-wallet`, `Lainnya`), tambah/edit dompet, filter jenis, dan modal histori transaksi per dompet.
3. **Pemasukan (`/pemasukan`)**: CRUD pemasukan, filter kategori/dompet/pencarian, dan rekap bulanan serta tahunan.
4. **Pengeluaran (`/pengeluaran`)**: Tab *Pengeluaran Tidak Rutin* & *Pengeluaran Rutin & Pengingat*, badge `Terlambat` / `Mendekati` / `Lunas`, serta tombol `Tandai Sudah Dibayar` yang memperbarui saldo dan menjadwalkan periode berikutnya.
5. **Transfer Dompet (`/transfer`)**: Transfer saldo antar-dompet dengan validasi saldo dan dompet asal/tujuan berbeda tanpa memengaruhi total pemasukan/pengeluaran.
6. **Utang & Piutang (`/utang-piutang`)**: Tab Utang & Piutang, modal detail riwayat cicilan, dan modal bayar cicilan/pelunasan.
7. **Donasi Live Stream (`/donasi`)**: Input manual TikTok/YouTube, pratinjau konversi otomatis (`1 match = Rp1.000` + sisa nominal), dan sinkronisasi saldo dompet penerima tanpa pencatatan ganda ke Pemasukan.
8. **Antrean Mabar (`/antrean-mabar`)**: Antrean FIFO + prioritas manual, `Mulai Match`, `Selesaikan Match` manual tanpa timer, geser urutan, dan `Batalkan Antrean`.
9. **Riwayat Mabar (`/riwayat-mabar`)**: Arsip match selesai & dibatalkan beserta filter tanggal dan platform.
10. **Laporan (`/laporan`)**: Filter preset (`Hari Ini`, `Minggu Ini`, `Bulan Ini`, `Tahun Ini`, `Rentang Khusus`), grafik kategori, ringkasan saldo/utang/match, dan simulasi ekspor CSV/Excel/PDF.
11. **Notifikasi (`/notifikasi`)**: Pengelompokan tagihan terlambat, tagihan mendekati jatuh tempo, utang/piutang jatuh tempo, dan tandai dibaca.
12. **Backup & Restore (`/backup-restore`)**: Simulasi backup manual, pengaturan jadwal backup otomatis, riwayat backup, dan simulasi restore dengan konfirmasi pengaman.
13. **Pengaturan (`/pengaturan`)**: Profil aplikasi, tema Light/Dark, mata uang IDR, preferensi notifikasi, harga per match, pengaturan FIFO, serta tombol **Reset Data Dummy**.

*Pintasan Keyboard*: Tekan **`Ctrl + K`** (atau **`Cmd + K`**) untuk membuka pencarian cepat lintas halaman dan transaksi, atau gunakan tombol **`+ Tambah`** di header untuk Quick Add.

---

## 18. Cara Backup Manual

*(Antarmuka satu klik tersedia pada Fase 11)* — Via CLI lokal saat ini:

```bash
mysqldump -u root -p fincop_db > backups/fincop_manual_YYYYMMDD.sql
```

---

## 19. Cara Backup Otomatis

*(Tersedia pada Fase 11)* — Pengaturan jadwal harian, mingguan, atau bulanan, pilihan folder penyimpanan, jam eksekusi, serta penghapusan file lama sesuai batas retensi dikelola langsung dari menu **Backup & Restore**.

---

## 20. Cara Restore Database

*(Antarmuka restore tervalidasi tersedia pada Fase 11)* — Via CLI lokal:

```bash
mysql -u root -p fincop_db < backups/fincop_manual_YYYYMMDD.sql
```

Selalu pastikan membuat backup pengaman sebelum menimpa database aktif.

---

## 21. Troubleshooting

- **`ECONNREFUSED 127.0.0.1:3306`**: Pastikan layanan MySQL di Laragon/XAMPP/Services Windows sudah menyala pada port `3306`.
- **`Access denied for user`**: Periksa kembali username dan password pada `DATABASE_URL` di `.env`. Jika password mengandung karakter khusus (`@`, `#`, `:`), lakukan URL-encode.
- **`Database 'fincop_db' does not exist`**: Buat database `fincop_db` terlebih dahulu di MySQL sebelum menjalankan `npx prisma migrate deploy`.
- **`Prisma Client not generated`**: Jalankan `npm run prisma:generate`.
