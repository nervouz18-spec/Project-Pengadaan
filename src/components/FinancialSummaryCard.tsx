import React from 'react';
import { formatRupiah } from '../utils/formatters';
import { BookmarkCheck, TrendingUp, DollarSign, Receipt, Sparkles, CheckCircle2, PencilLine } from 'lucide-react';

interface FinancialSummaryCardProps {
  totalHargaJual: number;
  totalModal: number;
  totalPajak: number;
  totalPph: number;
  totalCashback: number;
  totalKomisi: number;
  totalLaba: number;
  marginPercent: number;
  isEditingHistory?: boolean;
  onSaveToHistory: () => void;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  totalHargaJual,
  totalModal,
  totalPajak,
  totalPph,
  totalCashback,
  totalKomisi,
  totalLaba,
  marginPercent,
  isEditingHistory = false,
  onSaveToHistory,
}) => {
  return (
    <div className="bg-[#005988] text-white rounded-2xl p-6 shadow-md relative overflow-hidden transition-all">
      {/* Background ambient accent */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-widest text-cyan-200 uppercase">
            LAPORAN KEUANGAN
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-white/15 text-white rounded-full font-semibold">
            Formula Laba
          </span>
        </div>

        <h3 className="text-xs text-white/80 font-medium mb-1">
          Total Laba Bersih Proyeksi
        </h3>

        {/* Big Profit Number */}
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-5">
          Rp {formatRupiah(totalLaba)}
        </div>

        {/* Financial Metrics Breakdown */}
        <div className="space-y-2.5 pt-3 border-t border-white/15 text-xs">
          {/* Total Harga Jual */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-normal">Total Harga Jual (Omset)</span>
            <span className="font-semibold text-white tracking-wide">
              Rp {formatRupiah(totalHargaJual)}
            </span>
          </div>

          {/* Total Modal */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-normal">Total Modal Belanja</span>
            <span className="font-semibold text-red-200 tracking-wide">
              - Rp {formatRupiah(totalModal)}
            </span>
          </div>

          {/* Total Pajak 12% */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-normal">Total Pajak (12%)</span>
            <span className="font-semibold text-indigo-200 tracking-wide">
              - Rp {formatRupiah(totalPajak)}
            </span>
          </div>

          {/* Total PPh 1.5% */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-normal">Total PPh (1.5%)</span>
            <span className="font-semibold text-indigo-200 tracking-wide">
              - Rp {formatRupiah(totalPph)}
            </span>
          </div>

          {/* Total Cashback (0-20%) */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-normal">Total Cashback (0–20%)</span>
            <span className="font-semibold text-amber-200 tracking-wide">
              - Rp {formatRupiah(totalCashback)}
            </span>
          </div>

          {/* Total Komisi (0-10%) */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 font-normal">Total Komisi (0–10%)</span>
            <span className="font-semibold text-slate-200 tracking-wide">
              - Rp {formatRupiah(totalKomisi)}
            </span>
          </div>

          {/* Margin Keuntungan */}
          <div className="flex items-center justify-between pt-2 border-t border-white/15">
            <span className="text-white/90 font-medium">Margin Keuntungan</span>
            <span className="font-bold text-emerald-300 text-sm">
              {marginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Save to History Quick Action */}
        <div className="mt-5 pt-3 border-t border-white/15">
          {isEditingHistory && (
            <div className="flex items-center justify-center gap-1.5 mb-2 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              <PencilLine className="w-3 h-3" />
              Mengedit riwayat — simpan akan memperbarui record yang sama
            </div>
          )}
          <button
            type="button"
            id="btn-simpan-sesi-riwayat"
            onClick={onSaveToHistory}
            className="w-full py-2.5 px-3 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/20 shadow-2xs"
          >
            {isEditingHistory ? (
              <PencilLine className="w-3.5 h-3.5" />
            ) : (
              <BookmarkCheck className="w-3.5 h-3.5" />
            )}
            <span>{isEditingHistory ? 'Simpan Perubahan ke Riwayat' : 'Simpan Sesi ke Riwayat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
