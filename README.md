# Proyeksi Laba

Aplikasi web untuk menghitung proyeksi laba proyek, membagi hasil (profit sharing), menyimpan laporan, dan mengarsipkan slip pembagian — dibangun dengan React, Vite, dan Tailwind CSS.

## Fitur

- **Kalkulator Proyeksi Laba** — menghitung omset, modal, cashback, komisi, biaya operasional, dan laba bersih akhir berdasarkan item proyek.
- **Riwayat Perhitungan** — simpan, muat, edit, dan hapus sesi perhitungan.
- **Laporan & Bagi Hasil** — laporan keuangan lengkap, pembagian laba antar anggota, dan kontribusi modal per anggota (modal = harga beli × qty item terpilih), termasuk ekspor CSV dan cetak slip.
- **Arsip Laporan Bagi Hasil** — simpan, edit, cetak, dan ekspor laporan bagi hasil, dikelompokkan berdasarkan proyek.
- Penyimpanan data di `localStorage` (histori, laporan tersimpan, dan sesi login).

## Teknologi

- React 19
- Vite
- Tailwind CSS v4
- TypeScript
- lucide-react (ikon)
- motion (animasi)
- Express (server opsional, lihat `.env.example`)

## Menjalankan di Lokal

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```

Type-check:

```bash
npm run lint
```

## Konfigurasi

Salin `.env.example` menjadi `.env` lalu isi sesuai kebutuhan (misalnya kunci API untuk integrasi server).

## Lisensi

[MIT](LICENSE) — Copyright (c) 2026 Nervouz18
