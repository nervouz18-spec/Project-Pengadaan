import React from 'react';
import { Item } from '../types';
import { computeItemMetrics, formatRupiah } from '../utils/formatters';
import { FileSpreadsheet, X, Trash2, Check, ArrowUpRight, Calculator, Receipt } from 'lucide-react';

interface DetailTerpilihCardProps {
  selectedItem: Item | null;
  onClose: () => void;
  onUpdateItem: (updatedItem: Item) => void;
  onDeleteItem: (id: string) => void;
}

export const DetailTerpilihCard: React.FC<DetailTerpilihCardProps> = ({
  selectedItem,
  onClose,
  onUpdateItem,
  onDeleteItem,
}) => {
  if (!selectedItem) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center min-h-[220px]">
        <h3 className="font-bold text-slate-900 text-base mb-4 self-start">
          Rincian Baris Terpilih
        </h3>
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <FileSpreadsheet className="w-6 h-6 stroke-[1.5]" />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
          Klik baris barang pada tabel untuk melihat kalkulasi detail Budget Belanja, Harga Jual & Perpajakan, serta Laba Bersih.
        </p>
      </div>
    );
  }

  const metrics = computeItemMetrics(selectedItem);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      {/* Header with Title & Close button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base">Rincian Baris Terpilih</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tutup rincian"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Item info banner */}
      <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm leading-tight break-words">
              {selectedItem.name || 'Barang Tanpa Nama'}
            </h4>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">
              {selectedItem.category || 'Umum'} • {selectedItem.qty} Unit
            </span>
          </div>
          <button
            type="button"
            onClick={() => onDeleteItem(selectedItem.id)}
            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
            title="Hapus baris ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Rincian Budget Belanja */}
      <div className="space-y-1.5 text-xs">
        <div className="text-[10px] font-extrabold uppercase text-[#00629b] tracking-wider pb-0.5 border-b border-slate-100">
          1. Budget Belanja
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Harga Beli Satuan</span>
          <span className="font-medium text-slate-900">
            Rp {formatRupiah(selectedItem.buyPrice)}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Qty Barang</span>
          <span className="font-medium text-slate-900">
            {selectedItem.qty} pcs
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-700 font-semibold pt-0.5">
          <span>Total Modal (Beli × Qty)</span>
          <span className="text-slate-900">
            Rp {formatRupiah(metrics.totalModal)}
          </span>
        </div>
      </div>

      {/* 2. Rincian Harga Jual & Perpajakan */}
      <div className="space-y-1.5 text-xs pt-1">
        <div className="text-[10px] font-extrabold uppercase text-indigo-900 tracking-wider pb-0.5 border-b border-slate-100">
          2. Harga Jual & Perpajakan
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Harga Jual (Set)</span>
          <span className="font-medium text-slate-900">
            Rp {formatRupiah(selectedItem.sellPrice)}
          </span>
        </div>
        {/* Total Harga Produk (Harga Jual / (1 + 11%)) */}
        <div className="flex items-center justify-between bg-indigo-50/60 p-1.5 rounded-lg text-indigo-950 font-semibold">
          <span>Total Harga Produk (Jual / 1.11)</span>
          <div className="text-right">
            <span className="text-indigo-900 font-bold block">
              Rp {formatRupiah(metrics.totalHargaProduk)}
            </span>
            <span className="text-[10px] font-normal text-indigo-600">
              (Rp {formatRupiah(metrics.hargaProdukSatuan)} / unit)
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-slate-500 text-[11px]">
          <span>Pajak 12% ((11/12 × H.Produk) × 12%)</span>
          <span className="text-indigo-800 font-medium">
            Rp {formatRupiah(metrics.pajakSatuan)} / unit
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-500 text-[11px]">
          <span>PPh 1.5% (H.Produk × 1.5%)</span>
          <span className="text-indigo-800 font-medium">
            Rp {formatRupiah(metrics.pphSatuan)} / unit
          </span>
        </div>
        <div className="flex items-center justify-between text-indigo-950 font-semibold pt-1 border-t border-slate-100">
          <span>Total Pajak (Pajak × Qty)</span>
          <span>Rp {formatRupiah(metrics.totalPajak)}</span>
        </div>
        <div className="flex items-center justify-between text-indigo-950 font-semibold">
          <span>Total PPh (PPh × Qty)</span>
          <span>Rp {formatRupiah(metrics.totalPph)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-900 font-bold pt-0.5 border-t border-slate-100">
          <span>Total Harga Jual (Jual × Qty)</span>
          <span>Rp {formatRupiah(metrics.totalHargaJual)}</span>
        </div>
      </div>

      {/* 3. Rincian Pengurang & Laba Bersih */}
      <div className="space-y-2 text-xs pt-1">
        <div className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider pb-0.5 border-b border-slate-100">
          3. Pengurang & Laba Bersih
        </div>

        {/* Cashback Selector (0% - 20%) */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold text-xs">Cashback (0% – 20%):</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="20"
                value={metrics.cashbackPercent}
                onChange={(e) => {
                  const val = Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0));
                  onUpdateItem({ ...selectedItem, cashbackPercent: val, cashbackChoice: val });
                }}
                className="w-12 px-1 py-0.5 text-center text-xs font-bold bg-white border border-slate-300 rounded"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="flex gap-1">
            {[0, 5, 10, 15, 20].map((cbVal) => (
              <button
                key={cbVal}
                type="button"
                onClick={() => onUpdateItem({ ...selectedItem, cashbackPercent: cbVal, cashbackChoice: cbVal })}
                className={`flex-1 py-0.5 text-[11px] font-bold rounded cursor-pointer ${
                  metrics.cashbackPercent === cbVal
                    ? 'bg-[#00629b] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cbVal}%
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-800 pt-0.5">
            <div>
              <span>Nominal Cashback ({metrics.cashbackPercent}%)</span>
              <span className="block text-[9px] text-amber-600 font-normal">(Jual - Pajak - PPh) × {metrics.cashbackPercent}%</span>
            </div>
            <span className="font-semibold">- Rp {formatRupiah(metrics.cashbackNominal)}</span>
          </div>
        </div>

        {/* Komisi Selector (0% - 10%) */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold text-xs">Komisi (0% – 10%):</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="10"
                value={metrics.commissionPercent}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(0, parseInt(e.target.value, 10) || 0));
                  onUpdateItem({ ...selectedItem, commissionPercent: val, useCommission: val > 0 });
                }}
                className="w-12 px-1 py-0.5 text-center text-xs font-bold bg-white border border-slate-300 rounded"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 5, 10].map((commVal) => (
              <button
                key={commVal}
                type="button"
                onClick={() => onUpdateItem({ ...selectedItem, commissionPercent: commVal, useCommission: commVal > 0 })}
                className={`flex-1 py-0.5 text-[11px] font-bold rounded cursor-pointer ${
                  metrics.commissionPercent === commVal
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {commVal}%
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-700 pt-0.5">
            <span>Nominal Komisi ({metrics.commissionPercent}%)</span>
            <span className="font-semibold">- Rp {formatRupiah(metrics.komisiNominal)}</span>
          </div>
        </div>

        {/* Laba Bersih Box */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs text-emerald-950 pb-1.5 border-b border-emerald-200/70">
            <span className="font-bold">Laba Satuan (Per Unit):</span>
            <span className="text-sm font-extrabold text-emerald-800">
              Rp {formatRupiah(metrics.labaPerUnit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950">Laba Bersih Total ({selectedItem.qty} unit):</span>
            <span className="text-base font-extrabold text-emerald-800">
              Rp {formatRupiah(metrics.laba)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-800">
            <span>Margin Keuntungan:</span>
            <span className="font-bold">{metrics.marginPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
