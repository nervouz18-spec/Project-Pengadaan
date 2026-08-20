import React, { useState, useMemo } from 'react';
import { CalculationHistory } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  History, 
  ArrowRight, 
  Trash2, 
  Calendar, 
  Search, 
  X, 
  FolderOpen, 
  Layers, 
  FileSpreadsheet,
  Tag,
  CheckCircle2,
  FileText,
  Eye,
} from 'lucide-react';

interface HistoryViewProps {
  histories: CalculationHistory[];
  onLoadHistory: (history: CalculationHistory) => void;
  onDeleteHistory: (id: string) => void;
  onBackToDashboard: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  histories,
  onLoadHistory,
  onDeleteHistory,
  onBackToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewHist, setPreviewHist] = useState<CalculationHistory | null>(null);

  // Filter histories based on search query
  const filteredHistories = useMemo(() => {
    if (!searchQuery.trim()) return histories;
    const q = searchQuery.toLowerCase().trim();
    return histories.filter((hist) => {
      const matchTitle = hist.title.toLowerCase().includes(q);
      const matchNotes = hist.notes ? hist.notes.toLowerCase().includes(q) : false;
      const matchDate = hist.timestamp.toLowerCase().includes(q);
      const matchItemName = hist.items.some((item) => item.name.toLowerCase().includes(q));
      return matchTitle || matchNotes || matchDate || matchItemName;
    });
  }, [histories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#00629b] uppercase block mb-1">
            ARSIP PROYEKSI KEUANGAN
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Riwayat Perhitungan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh sesi perhitungan proyeksi laba & budget belanja yang telah disimpan dengan nama kustom
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer self-start"
        >
          <span>Kembali ke Kalkulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-cari-riwayat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama sesi/proyek, catatan, atau nama barang..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00629b] focus:ring-1 focus:ring-[#00629b]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-600 self-end sm:self-auto">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredHistories.length}</strong> dari{' '}
            <strong className="text-slate-900">{histories.length}</strong> riwayat tersimpan
          </span>
        </div>
      </div>

      {/* History List */}
      {histories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <History className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">
            Belum Ada Riwayat Perhitungan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            Klik tombol "Simpan Sesi ke Riwayat" pada kartu Laporan Keuangan di Dashboard untuk menyimpan snapshot kalkulasi dengan nama kustom Anda.
          </p>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Buka Kalkulator Utama
          </button>
        </div>
      ) : filteredHistories.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Search className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">
            Tidak Ditemukan Riwayat yang Cocok
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mb-4">
            Tidak ada riwayat tersimpan dengan kata kunci "<strong>{searchQuery}</strong>".
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistories.map((hist) => (
            <div
              key={hist.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#00629b]/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Title & Delete Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-base leading-snug break-words">
                      {hist.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {hist.timestamp}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {hist.totalItems} Barang
                      </span>
                    </div>
                    {hist.notes && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1.5 mt-2">
                        "{hist.notes}"
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteHistory(hist.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Hapus riwayat ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Metrics Box */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">Laba Bersih Total</span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      Rp {formatRupiah(hist.totalLaba)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Total Harga Jual (Omset)</span>
                    <span className="font-medium text-slate-800">
                      Rp {formatRupiah(hist.totalHargaJual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Total Modal Belanja</span>
                    <span className="font-medium text-slate-800">
                      Rp {formatRupiah(hist.totalModal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Pajak 12% & PPh 1.5%</span>
                    <span className="font-medium text-indigo-700">
                      Rp {formatRupiah(hist.totalPajak + hist.totalPph)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Cashback & Komisi</span>
                    <span className="font-medium text-amber-700">
                      Rp {formatRupiah(hist.totalCashback + hist.totalKomisi)}
                    </span>
                  </div>
                </div>

                {/* Item Preview Chips */}
                <div className="mb-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Daftar Barang ({hist.items.length}):
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {hist.items.slice(0, 5).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium truncate max-w-[150px]"
                      >
                        {item.name || 'Barang tanpa nama'}
                      </span>
                    ))}
                    {hist.items.length > 5 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-md font-bold">
                        +{hist.items.length - 5} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewHist(hist)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLoadHistory(hist)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Edit & Muat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewHist && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{previewHist.title}</h3>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {previewHist.timestamp} · {previewHist.totalItems} barang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewHist(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Summary */}
            <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100/60 grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Total Modal</div>
                <div className="text-sm font-extrabold text-slate-900">Rp {formatRupiah(previewHist.totalModal)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Total Harga Jual</div>
                <div className="text-sm font-extrabold text-slate-900">Rp {formatRupiah(previewHist.totalHargaJual)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Laba Bersih</div>
                <div className="text-sm font-extrabold text-emerald-700">Rp {formatRupiah(previewHist.totalLaba)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Pajak 12%</div>
                <div className="text-xs font-bold text-indigo-700">Rp {formatRupiah(previewHist.totalPajak)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">PPh 1.5%</div>
                <div className="text-xs font-bold text-indigo-700">Rp {formatRupiah(previewHist.totalPph)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Cashback + Komisi</div>
                <div className="text-xs font-bold text-amber-700">Rp {formatRupiah(previewHist.totalCashback + previewHist.totalKomisi)}</div>
              </div>
            </div>

            {previewHist.notes && (
              <div className="px-6 py-2.5 bg-amber-50/60 border-b border-amber-100 text-xs text-amber-800 italic shrink-0">
                "{previewHist.notes}"
              </div>
            )}

            {/* Items Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-2.5">#</th>
                    <th className="px-3 py-2.5">Nama Barang</th>
                    <th className="px-3 py-2.5 text-right">Harga Beli</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Harga Jual</th>
                    <th className="px-5 py-2.5 text-right">Subtotal Beli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewHist.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-2.5 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900 truncate max-w-[200px]">
                        {item.name || 'Barang tanpa nama'}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-700 tabular-nums">Rp {formatRupiah(item.buyPrice)}</td>
                      <td className="px-3 py-2.5 text-center text-slate-700">{item.qty || 1}</td>
                      <td className="px-3 py-2.5 text-right text-slate-700 tabular-nums">Rp {formatRupiah(item.sellPrice)}</td>
                      <td className="px-5 py-2.5 text-right font-bold text-slate-800 tabular-nums">
                        Rp {formatRupiah((item.buyPrice || 0) * (item.qty || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setPreviewHist(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
