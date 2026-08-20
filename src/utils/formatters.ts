import { Item, ComputedMetrics, GlobalSettings } from '../types';

export const formatRupiah = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0 : value || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(num));
};

export const formatCurrencyDisplay = (value: number): string => {
  return `Rp ${formatRupiah(value)}`;
};

export const parseNumberFromInput = (val: string): number => {
  const clean = val.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

/**
 * Formula Perhitungan Sesuai Spesifikasi Pengguna:
 * 1. Budget Belanja:
 *    - Total Modal = Harga Beli * Qty
 * 2. Harga Jual & Perpajakan:
 *    - Harga Jual = Inputan sendiri
 *    - Total Harga Jual = Harga Jual * Qty
 *    - Total Harga Produk = (Harga Jual / (1 + 11%)) * Qty  [DPP: Dasar Pengenaan Pajak]
 *    - Harga Produk Satuan = Harga Jual / (1 + 11%) = Harga Jual / 1.11
 *    - Pajak 12% Satuan = ((11 / 12 * Harga Produk) * 12%) = 11% dari Harga Produk (DPP)
 *    - Total Pajak = Pajak 12% Satuan * Qty
 *    - PPh 1.5% Satuan = Harga Produk Satuan * 1.5%
 *    - Total PPh = ((Harga Produk Satuan * 1.5%) * Qty) = Total Harga Produk * 0.015
 * 3. Harga Laba & Pengurang:
 *    - Cashback (0% - 20%) = ((Total Harga Jual - Total PPh - Total Pajak) * (Cashback % / 100))
 *    - Komisi (0% - 10%) = Total Harga Jual * (Komisi % / 100)
 *    - Laba = Total Harga Jual - Total Pajak - Total Modal - Cashback - Total PPh - Komisi
 */
export const computeItemMetrics = (item: Item): ComputedMetrics => {
  const qty = Math.max(1, item.qty || 1);
  const buyPrice = item.buyPrice || 0;
  const sellPrice = item.sellPrice || 0;

  // 1. Budget Belanja
  const totalModal = buyPrice * qty;

  // 2. Harga Jual & Perpajakan
  const totalHargaJual = sellPrice * qty;

  // Total Harga Produk (Harga Jual / (1 + 11%)) & Satuan DPP
  const hargaProdukSatuan = sellPrice / (1 + 0.11);
  const totalHargaProduk = (sellPrice * qty) / (1 + 0.11);

  // Pajak 12%: ((11 / 12 * Harga Produk) * 12%) = 11% dari Harga Produk (DPP)
  const pajakSatuan = ((11 / 12) * hargaProdukSatuan) * 0.12;
  const totalPajak = pajakSatuan * qty;

  // PPh: ((Harga Produk * 1.5%) * Qty)
  const pphSatuan = hargaProdukSatuan * 0.015;
  const totalPph = pphSatuan * qty;

  // 3. Harga Laba
  // Cashback 0 - 20%: ((Total Harga Jual - Total PPh - Total Pajak) * (Cashback % / 100))
  let cbPercent = 10;
  if (typeof item.cashbackPercent === 'number') {
    cbPercent = Math.min(20, Math.max(0, item.cashbackPercent));
  }

  const basisCashback = Math.max(0, totalHargaJual - totalPph - totalPajak);
  const cashbackNominal = basisCashback * (cbPercent / 100);

  // Komisi 0 - 10%
  let commPercent = 0;
  if (typeof item.commissionPercent === 'number') {
    commPercent = Math.min(10, Math.max(0, item.commissionPercent));
  }

  const komisiNominal = totalHargaJual * (commPercent / 100);

  // Laba = Total Harga Jual - Total Pajak - Total Modal - Cashback - Total PPh - Komisi
  const laba = totalHargaJual - totalPajak - totalModal - cashbackNominal - totalPph - komisiNominal;
  const labaPerUnit = qty > 0 ? laba / qty : 0;
  const marginPercent = totalHargaJual > 0 ? (laba / totalHargaJual) * 100 : 0;

  return {
    totalModal,
    hargaProduk: hargaProdukSatuan,
    hargaProdukSatuan,
    totalHargaProduk,
    hargaProdukNettoSatuan: hargaProdukSatuan,
    totalHargaProdukNetto: totalHargaProduk,
    pajakSatuan,
    pphSatuan,
    totalPajak,
    totalPph,
    totalHargaJual,
    cashbackPercent: cbPercent,
    cashbackNominal,
    commissionPercent: commPercent,
    komisiNominal,
    laba,
    labaPerUnit,
    marginPercent,
  };
};

export const exportToCSV = (items: Item[], filename = 'proyeksi-laba-lengkap.csv') => {
  const headers = [
    'No',
    'Nama Barang',
    'Harga Beli (Rp)',
    'Qty',
    'Total Modal (Rp)',
    'Harga Jual Satuan (Rp)',
    'Total Harga Produk (Jual / 1.11) (Rp)',
    'Pajak 12% Satuan (Rp)',
    'PPh 1.5% Satuan (Rp)',
    'Total Pajak (Rp)',
    'Total PPh (Rp)',
    'Total Harga Jual (Rp)',
    'Cashback (%)',
    'Nominal Cashback (Rp)',
    'Komisi (%)',
    'Nominal Komisi (Rp)',
    'Laba Satuan (Rp)',
    'Laba Bersih (Rp)',
    'Margin (%)'
  ];

  const rows = items.map((item, index) => {
    const m = computeItemMetrics(item);
    return [
      index + 1,
      `"${item.name.replace(/"/g, '""')}"`,
      item.buyPrice,
      item.qty,
      Math.round(m.totalModal),
      item.sellPrice,
      Math.round(m.totalHargaProduk),
      Math.round(m.pajakSatuan),
      Math.round(m.pphSatuan),
      Math.round(m.totalPajak),
      Math.round(m.totalPph),
      Math.round(m.totalHargaJual),
      `${m.cashbackPercent}%`,
      Math.round(m.cashbackNominal),
      `${m.commissionPercent}%`,
      Math.round(m.komisiNominal),
      Math.round(m.labaPerUnit),
      Math.round(m.laba),
      `${m.marginPercent.toFixed(1)}%`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
