import React from 'react';
import { CalculationHistory, ProjectMeta } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Receipt, 
  Calendar, 
  FolderPlus, 
  ArrowRight, 
  History, 
  Sparkles, 
  Percent, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  FileSpreadsheet,
  Users
} from 'lucide-react';

interface DashboardOverviewProps {
  histories: CalculationHistory[];
  onStartNewProject: () => void;
  onGoToCalculator: () => void;
  onGoToHistory: () => void;
  onGoToFinancialReport?: () => void;
  onLoadHistoryToCalculator: (history: CalculationHistory) => void;
  activeProjectMeta?: ProjectMeta;
  activeItemCount: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  histories,
  onStartNewProject,
  onGoToCalculator,
  onGoToHistory,
  onGoToFinancialReport,
  onLoadHistoryToCalculator,
  activeProjectMeta,
  activeItemCount,
}) => {
  // Aggregate all-time metrics across all calculation histories
  const allTimeStats = React.useMemo(() => {
    let totalOmset = 0;
    let totalModal = 0;
    let totalPajak = 0;
    let totalPph = 0;
    let totalCashback = 0;
    let totalKomisi = 0;
    let totalLaba = 0;
    let totalItemsCount = 0;

    histories.forEach((h) => {
      totalOmset += h.totalHargaJual || 0;
      totalModal += h.totalModal || 0;
      totalPajak += h.totalPajak || 0;
      totalPph += h.totalPph || 0;
      totalCashback += h.totalCashback || 0;
      totalKomisi += h.totalKomisi || 0;
      totalLaba += h.totalLaba || 0;
      totalItemsCount += h.totalItems || (h.items ? h.items.length : 0);
    });

    const averageMargin = totalOmset > 0 ? (totalLaba / totalOmset) * 100 : 0;

    return {
      totalOmset,
      totalModal,
      totalPajak,
      totalPph,
      totalCashback,
      totalKomisi,
      totalLaba,
      totalItemsCount,
      totalProjects: histories.length,
      averageMargin,
    };
  }, [histories]);

  // Recent 4 calculation projects
  const recentHistories = histories.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & New Project Hero Banner */}
      <div className="bg-linear-to-br from-[#004f7c] to-[#006ea8] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Background ambient decorative shapes */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-bold text-cyan-200 uppercase tracking-wider border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Manajemen Proyek & Keuangan</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Ringkasan Keuangan & Proyeksi Belanja
          </h1>

          <p className="text-xs sm:text-sm text-cyan-50/90 leading-relaxed max-w-2xl">
            Pantau akumulasi seluruh omset penjualan, modal belanja, pajak 12%, PPh 1.5%, serta laba bersih yang telah tersimpan dari seluruh riwayat perhitungan proyek Anda.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              id="btn-dashboard-mulai-proyek"
              onClick={onStartNewProject}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#4eedaa] hover:bg-[#3ddc9a] text-slate-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-slate-950" />
              <span>+ Mulai Proyek / Perhitungan Baru</span>
            </button>

            {onGoToFinancialReport && (
              <button
                type="button"
                id="btn-dashboard-laporan-keuangan"
                onClick={onGoToFinancialReport}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/25 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Laporan & Bagi Hasil</span>
              </button>
            )}

            {activeItemCount > 0 && (
              <button
                type="button"
                id="btn-dashboard-buka-kalkulator"
                onClick={onGoToCalculator}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <span>Buka Kalkulator Aktif ({activeItemCount} barang)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Aggregated Financial Cards (Dari Riwayat Perhitungan) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-[#00629b] uppercase">
              AKUMULASI SELURUH RIWAYAT
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-[#00629b] font-bold rounded-md">
              {allTimeStats.totalProjects} Sesi Tersimpan
            </span>
          </div>
          <button
            type="button"
            onClick={onGoToHistory}
            className="text-xs font-bold text-[#00629b] hover:text-[#004f7c] flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Semua Riwayat</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Omset Penjualan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#00629b]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                Total Omset Penjualan
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00629b] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Rp {formatRupiah(allTimeStats.totalOmset)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Dari {allTimeStats.totalItemsCount} total unit barang
            </div>
          </div>

          {/* 2. Total Modal Belanja */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#00629b]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                Total Modal Belanja
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-red-600 tracking-tight">
              Rp {formatRupiah(allTimeStats.totalModal)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Budget belanja akumulasi
            </div>
          </div>

          {/* 3. Total Pajak 12% & PPh 1.5% */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#00629b]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                Total Pajak & PPh
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Rp {formatRupiah(allTimeStats.totalPajak + allTimeStats.totalPph)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Pajak Rp {formatRupiah(allTimeStats.totalPajak)} • PPh Rp {formatRupiah(allTimeStats.totalPph)}
            </div>
          </div>

          {/* 4. Total Laba Bersih Akumulasi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#00629b]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                Total Laba Bersih
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 tracking-tight">
              Rp {formatRupiah(allTimeStats.totalLaba)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>Rata-rata Margin:</span>
              <strong className="font-extrabold">{allTimeStats.averageMargin.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Project Status & Recent Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Session Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00629b]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Proyek Perhitungan Aktif
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                Sesi Terbuka
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {activeProjectMeta?.name || 'Proyek Perhitungan Baru'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {activeProjectMeta?.description || 'Perhitungan budget belanja, harga jual, perpajakan, dan proyeksi laba.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/40 flex items-center justify-between text-xs text-slate-600">
                <span>Barang di Tabel:</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {activeItemCount} Barang
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onGoToCalculator}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Buka Kalkulator Proyek Aktif</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onStartNewProject}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-slate-600" />
                <span>+ Buat Proyek / Reset Hitungan Baru</span>
              </button>
            </div>
          </div>

          {/* Quick System Rules Notice */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-[#00629b]" />
              <span>Standar Formula Perhitungan</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-500 pl-5 list-disc leading-relaxed">
              <li>
                <strong>Pajak (12%):</strong> Dihitung dari 11% Harga Jual satuan.
              </li>
              <li>
                <strong>PPh (1.5%):</strong> Dihitung dari 1.5% Harga Produk satuan.
              </li>
              <li>
                <strong>Cashback (0–20%):</strong> Dipotong dari Total Harga Jual.
              </li>
              <li>
                <strong>Komisi (0–10%):</strong> Opsional per baris barang.
              </li>
              <li>
                <strong>Laba Bersih & Bagi Hasil:</strong> Uang Masuk - Modal - Pajak/PPh - Materai - Operasional.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Recent Histories List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Riwayat Perhitungan Terkini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesi perhitungan yang baru saja disimpan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onGoToHistory}
                  className="text-xs font-bold text-[#00629b] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua ({histories.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentHistories.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                    <History className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Belum Ada Riwayat Tersimpan
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Setelah Anda melakukan perhitungan di tab Kalkulator, simpan sesi untuk melihat riwayat akumulasi di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentHistories.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3.5 rounded-xl border border-slate-200/70 hover:border-[#00629b]/40 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {hist.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 font-medium rounded">
                            {hist.totalItems} barang
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {hist.timestamp}
                          </span>
                          <span>•</span>
                          <span className="text-slate-600">
                            Omset: <strong className="text-slate-800">Rp {formatRupiah(hist.totalHargaJual)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] text-slate-400">Laba Bersih:</div>
                          <div className="text-xs font-extrabold text-emerald-700">
                            Rp {formatRupiah(hist.totalLaba)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onLoadHistoryToCalculator(hist)}
                          className="p-2 bg-slate-100 hover:bg-[#00629b] hover:text-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Buka sesi ini di kalkulator"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {histories.length > 0 && (
              <div className="pt-3 border-t border-slate-100 text-right mt-3">
                <button
                  type="button"
                  onClick={onGoToHistory}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka tab Riwayat Perhitungan lengkap</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
