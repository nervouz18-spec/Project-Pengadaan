import React, { useState } from 'react';
import { Item } from '../types';
import { formatRupiah, parseNumberFromInput, computeItemMetrics } from '../utils/formatters';
import { Plus, X, Tag, Calculator, Percent, Sparkles } from 'lucide-react';

interface AddRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Item) => void;
}

export const AddRowModal: React.FC<AddRowModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [buyPriceStr, setBuyPriceStr] = useState('');
  const [sellPriceStr, setSellPriceStr] = useState('');
  const [qty, setQty] = useState(1);
  const [cashbackPercent, setCashbackPercent] = useState<number>(10);
  const [commissionPercent, setCommissionPercent] = useState<number>(3);

  if (!isOpen) return null;

  const buyPriceNum = parseNumberFromInput(buyPriceStr);
  const sellPriceNum = parseNumberFromInput(sellPriceStr);

  // Live calculations for preview inside modal using standard computeItemMetrics
  const metrics = computeItemMetrics({
    id: 'preview',
    name: name || 'Preview',
    buyPrice: buyPriceNum,
    sellPrice: sellPriceNum,
    qty: Math.max(1, qty),
    cashbackPercent,
    commissionPercent,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: Item = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      category: category || 'Umum',
      buyPrice: buyPriceNum,
      sellPrice: sellPriceNum,
      qty: Math.max(1, qty),
      cashbackPercent: cashbackPercent,
      commissionPercent: commissionPercent,
    };

    onAddItem(newItem);
    // Reset form
    setName('');
    setBuyPriceStr('');
    setSellPriceStr('');
    setQty(1);
    setCashbackPercent(10);
    setCommissionPercent(3);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00629b]/10 text-[#00629b] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Input Barang Baru</h3>
              <p className="text-xs text-slate-500">
                Lengkapi data belanja dan harga jual untuk menghitung proyeksi laba otomatis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Nama & Kategori */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Barang / Produk *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama barang..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00629b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Barang
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00629b]"
              >
                <option value="Elektronik">Elektronik</option>
                <option value="Komputer & IT">Komputer & IT</option>
                <option value="Office & ATK">Office & ATK</option>
                <option value="Audio Visual">Audio Visual</option>
                <option value="Umum">Umum</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah / Qty *
              </label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00629b]"
              />
            </div>
          </div>

          {/* Section 2: Harga Beli & Harga Jual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harga Beli Satuan (Rp) *
              </label>
              <input
                type="text"
                required
                value={buyPriceStr}
                onChange={(e) => {
                  const num = parseNumberFromInput(e.target.value);
                  setBuyPriceStr(num ? formatRupiah(num) : '');
                }}
                placeholder="Misal: 1.500.000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00629b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harga Jual Satuan (Rp) *
              </label>
              <input
                type="text"
                required
                value={sellPriceStr}
                onChange={(e) => {
                  const num = parseNumberFromInput(e.target.value);
                  setSellPriceStr(num ? formatRupiah(num) : '');
                }}
                placeholder="Misal: 2.200.000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00629b]"
              />
            </div>
          </div>

          {/* Section 3: Cashback (0-20%) & Komisi (0-10%) Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* Cashback (0-20%) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 text-[11px]">
                  Cashback (0% – 20%)
                </label>
                <span className="font-bold text-[#00629b] text-xs">{cashbackPercent}%</span>
              </div>
              <div className="flex gap-1 mb-1.5">
                {[0, 5, 10, 15, 20].map((cbVal) => (
                  <button
                    key={cbVal}
                    type="button"
                    onClick={() => setCashbackPercent(cbVal)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded border cursor-pointer ${
                      cashbackPercent === cbVal
                        ? 'bg-[#00629b] text-white border-[#00629b]'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {cbVal}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={cashbackPercent}
                onChange={(e) => setCashbackPercent(parseInt(e.target.value, 10))}
                className="w-full accent-[#00629b]"
              />
            </div>

            {/* Komisi (0-10%) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 text-[11px]">
                  Komisi (0% – 10%)
                </label>
                <span className="font-bold text-slate-900 text-xs">{commissionPercent}%</span>
              </div>
              <div className="flex gap-1 mb-1.5">
                {[0, 1, 2, 3, 5, 10].map((commVal) => (
                  <button
                    key={commVal}
                    type="button"
                    onClick={() => setCommissionPercent(commVal)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded border cursor-pointer ${
                      commissionPercent === commVal
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {commVal}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(parseInt(e.target.value, 10))}
                className="w-full accent-slate-900"
              />
            </div>
          </div>

          {/* Live Calculation Preview Banner */}
          {buyPriceNum > 0 && sellPriceNum > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-emerald-950 font-semibold pb-1 border-b border-emerald-200/60">
                <span>Laba Satuan (Per Unit):</span>
                <span className="font-bold text-emerald-800">
                  Rp {formatRupiah(metrics.labaPerUnit)} / unit
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-950 font-bold">
                <span>Proyeksi Laba Bersih Total ({qty} unit):</span>
                <span className="text-sm font-extrabold text-emerald-800">
                  Rp {formatRupiah(metrics.laba)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-slate-600 pt-1 border-t border-emerald-200/60">
                <div>Total Modal: <strong>Rp {formatRupiah(metrics.totalModal)}</strong></div>
                <div>Total Jual: <strong>Rp {formatRupiah(metrics.totalHargaJual)}</strong></div>
                <div>Total Harga Produk (Jual / 1.11): <strong>Rp {formatRupiah(metrics.totalHargaProduk)}</strong></div>
                <div>Pajak 12% + PPh: <strong>Rp {formatRupiah(metrics.totalPajak + metrics.totalPph)}</strong></div>
                <div>Cashback ({cashbackPercent}%): <strong>Rp {formatRupiah(metrics.cashbackNominal)}</strong></div>
                <div>Komisi ({commissionPercent}%): <strong>Rp {formatRupiah(metrics.komisiNominal)}</strong></div>
              </div>
              <div className="text-right text-[10px] text-emerald-700 font-bold">
                Estimasi Margin: {metrics.marginPercent.toFixed(1)}%
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00629b] hover:bg-[#005180] text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Simpan & Tambahkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
