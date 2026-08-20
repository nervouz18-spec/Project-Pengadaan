export interface Item {
  id: string;
  name: string;
  buyPrice: number; // Harga Beli
  qty: number; // Qty
  sellPrice: number; // Harga Jual (inputan sendiri)
  cashbackPercent?: number; // Nilai Cashback % (0 - 20%)
  commissionPercent?: number; // Nilai Komisi % (0 - 10%)
  category?: string;
  notes?: string;
}

export interface ProjectMeta {
  name: string;
  description: string;
  createdAt?: string;
}

export interface ComputedMetrics {
  // 1. Budget Belanja
  totalModal: number; // Harga Beli * Qty

  // 2. Harga Jual & Perpajakan
  totalHargaJual: number; // Harga Jual * Qty
  hargaProdukSatuan: number; // Harga Jual / (1 + 11%)
  totalHargaProduk: number; // (Harga Jual / (1 + 11%)) * Qty
  pajakSatuan: number; // Pajak 12% = ((11/12 * Harga Jual) * 12%)
  pphSatuan: number; // PPh 1.5% = Harga Produk * 1.5%
  totalPajak: number; // Pajak Satuan * Qty
  totalPph: number; // (Harga Produk * 1.5%) * Qty
  
  // Backward compatibility aliases
  hargaProduk?: number;
  hargaProdukNettoSatuan?: number;
  totalHargaProdukNetto?: number;

  // 3. Harga Laba & Pengurang
  cashbackPercent: number; // 0 - 20%
  cashbackNominal: number; // (Total Harga Jual - Total PPh - Total Pajak) * (cashbackPercent / 100)
  commissionPercent: number; // 0 - 10%
  komisiNominal: number; // Total Harga Jual * (commissionPercent / 100)
  laba: number; // totalHargaJual - totalPajak - totalModal - cashbackNominal - totalPph - komisiNominal
  labaPerUnit: number;
  marginPercent: number;
}

export interface GlobalSettings {
  defaultCashback: number; // 0 - 20%
  defaultCommission: number; // 0 - 10%
}

export interface CalculationHistory {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  timestamp: string;
  totalItems: number;
  totalModal: number;
  totalHargaJual: number;
  totalHargaProdukNetto: number;
  totalPajak: number;
  totalPph: number;
  totalCashback: number;
  totalKomisi: number;
  totalLaba: number;
  items: Item[];
  settings: GlobalSettings;
}

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
}

// Interfaces for Laporan Keuangan & Pembagian Hasil
export interface CapitalItemAllocation {
  itemId: string;
  percentage: number; // 0-100, persentase modal yang dialokasikan ke anggota ini
}

export interface ProfitShareMember {
  id: string;
  name: string;
  role?: string;
  percentage: number; // % dari Laba Bersih Akhir
  notes?: string;
  capitalItemIds?: string[]; // DEPRECATED - backward compat untuk laporan lama (100% per item)
  capitalNominal?: number; // manual override / fallback
  capitalItems?: CapitalItemAllocation[]; // NEW: alokasi modal per item dengan persentase
}

export interface OperationalExpenseItem {
  id: string;
  name: string;
  amount: number;
  category?: string;
}

export interface SavedFinancialReport {
  id: string;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  timestamp: string;
  uangMasukOmset: number;
  totalModal: number;
  cashbackProject: number;
  cashbackPercent?: number;
  komisiProject?: number;
  commissionPercent?: number;
  commissionRecipientName?: string;
  totalPajakPph: number;
  labaProject: number;
  biayaMaterai: number;
  biayaOperasional: number;
  operationalExpensesList: OperationalExpenseItem[];
  tabunganPajakPercent?: number;
  tabunganPajakNominal?: number;
  labaBersihAkhir: number;
  members: ProfitShareMember[];
  customNotes?: string;
}
