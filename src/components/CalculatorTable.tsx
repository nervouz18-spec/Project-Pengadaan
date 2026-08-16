import React, { useState, useMemo } from 'react';
import { Item } from '../types';
import { formatRupiah, parseNumberFromInput, computeItemMetrics } from '../utils/formatters';
import { 
  Download, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Trash2, 
  Eye, 
  Sparkles,
  Layers,
  PlusCircle,
  FilePlus,
  Percent
} from 'lucide-react';

interface CalculatorTableProps {
  items: Item[];
  selectedItemId: string | null;
  onSelectItem: (item: Item) => void;
  onUpdateItem: (updatedItem: Item) => void;
  onDeleteItem: (id: string) => void;
  onClearAllItems?: () => void;
  onAddQuickRow?: () => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
}

export const CalculatorTable: React.FC<CalculatorTableProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onUpdateItem,
  onDeleteItem,
  onClearAllItems,
  onAddQuickRow,
  onOpenAddModal,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'all' | 'essential' | 'tax' | 'profit'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
    return ['all', ...cats] as string[];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [items, searchQuery, selectedCategory]);

  // Pagination
  const totalItemsCount = items.length;
  const totalFilteredCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const currentItems = filteredItems.slice(startIndex, startIndex + pageSize);

  const handleNameChange = (item: Item, newName: string) => {
    onUpdateItem({
      ...item,
      name: newName,
    });
  };

  const handleQtyChange = (item: Item, valueStr: string) => {
    const qtyVal = Math.max(1, parseInt(valueStr, 10) || 1);
    onUpdateItem({
      ...item,
      qty: qtyVal,
    });
  };

  const handleSellPriceChange = (item: Item, rawValue: string) => {
    const cleanNum = parseNumberFromInput(rawValue);
    onUpdateItem({
      ...item,
      sellPrice: cleanNum,
    });
  };

  const handleBuyPriceChange = (item: Item, rawValue: string) => {
    const cleanNum = parseNumberFromInput(rawValue);
    onUpdateItem({
      ...item,
      buyPrice: cleanNum,
    });
  };

  const handleCashbackChange = (item: Item, val: number) => {
    const safeVal = Math.min(20, Math.max(0, val));
    onUpdateItem({
      ...item,
      cashbackPercent: safeVal,
      cashbackChoice: safeVal,
    });
  };

  const handleCommissionChange = (item: Item, val: number) => {
    const safeVal = Math.min(10, Math.max(0, val));
    onUpdateItem({
      ...item,
      commissionPercent: safeVal,
      useCommission: safeVal > 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header section with Title and Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-[#00629b] uppercase block">
              KALKULATOR STRUKTUR KEUANGAN
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-[#00629b]/10 text-[#00629b] font-semibold rounded-full">
              Pajak 12% • PPh 1.5% • Cashback 0–20% • Komisi 0–10%
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Budget Belanja & Proyeksi Laba
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Hapus Semua / Kosongkan Button */}
          {items.length > 0 && onClearAllItems && (
            <>
              {showClearConfirm ? (
                <div className="inline-flex items-center gap-1.5 p-1 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-[11px] text-red-700 font-medium px-1">Hapus semua?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllItems();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 bg-white text-slate-700 hover:bg-slate-100 text-xs font-medium rounded border border-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-hapus-semua"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
                  title="Hapus seluruh daftar barang"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Hapus Semua</span>
                </button>
              )}
            </>
          )}

          {/* Ekspor CSV Button */}
          <button
            type="button"
            id="btn-ekspor-csv"
            disabled={items.length === 0}
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          {/* Tambah Baris Cepat Button */}
          {onAddQuickRow && (
            <button
              type="button"
              id="btn-tambah-cepat"
              onClick={onAddQuickRow}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Baris Baru</span>
            </button>
          )}

          {/* + Tambah Baris Modal Button */}
          <button
            type="button"
            id="btn-tambah-baris"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Barang</span>
          </button>
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari barang dalam daftar..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00629b]"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lengkap
          </button>
          <button
            type="button"
            onClick={() => setViewMode('essential')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'essential'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ringkas
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tax')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'tax'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pajak & Produk
          </button>
          <button
            type="button"
            onClick={() => setViewMode('profit')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'profit'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laba & Cashback
          </button>
        </div>

        {/* Categories & Page size */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#00629b]"
          >
            <option value="all">Semua Kategori</option>
            {categories.filter((c) => c !== 'all').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#00629b]"
          >
            <option value="5">5 per hal</option>
            <option value="10">10 per hal</option>
            <option value="25">25 per hal</option>
          </select>
        </div>
      </div>

      {/* Main Calculation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Top Multi-Header Categorization */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-[10px] uppercase font-extrabold tracking-wider text-slate-600">
                {/* 1. Budget Belanja Section */}
                <th colSpan={4} className="py-2 px-4 border-r border-slate-200 text-[#00629b] bg-[#00629b]/5">
                  1. Budget Belanja
                </th>

                {/* 2. Harga Jual & Perpajakan Section */}
                {(viewMode === 'all' || viewMode === 'tax' || viewMode === 'essential') && (
                  <th 
                    colSpan={viewMode === 'essential' ? 2 : 7} 
                    className="py-2 px-4 border-r border-slate-200 text-indigo-900 bg-indigo-50/50"
                  >
                    2. Harga Jual & Perpajakan
                  </th>
                )}

                {/* 3. Harga Laba Section */}
                {(viewMode === 'all' || viewMode === 'profit' || viewMode === 'essential') && (
                  <th 
                    colSpan={viewMode === 'essential' ? 2 : 4} 
                    className="py-2 px-4 text-emerald-900 bg-emerald-50/60"
                  >
                    3. Harga Laba
                  </th>
                )}

                <th className="py-2 px-3 text-center bg-slate-100">Aksi</th>
              </tr>

              {/* Column Specific Sub-Headers */}
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 tracking-tight">
                {/* Budget Belanja */}
                <th className="py-3 px-3 min-w-[180px]">Nama Barang</th>
                <th className="py-3 px-2 text-right min-w-[105px]">Harga Beli</th>
                <th className="py-3 px-1.5 text-center min-w-[50px]">Qty</th>
                <th className="py-3 px-2 text-right min-w-[110px] border-r border-slate-200 text-slate-900">
                  Total Modal
                </th>

                {/* Harga Jual & Pajak */}
                <th className="py-3 px-2 text-left min-w-[120px]">Harga Jual (Set)</th>
                
                {(viewMode === 'all' || viewMode === 'tax') && (
                  <>
                    {/* Total Harga Produk (Harga Jual / (1 + 11%)) */}
                    <th className="py-3 px-2 text-right min-w-[125px] font-bold text-indigo-950 bg-indigo-50/40">
                      <div>Total Harga Produk</div>
                      <div className="text-[9px] font-semibold text-indigo-600">(Jual / 1.11)</div>
                    </th>

                    <th className="py-3 px-2 text-right min-w-[95px] text-slate-600">
                      <div>Pajak 12%</div>
                      <div className="text-[9px] font-normal text-slate-400">((11/12×HP)×12%)</div>
                    </th>
                    <th className="py-3 px-2 text-right min-w-[85px] text-slate-600">
                      <div>PPh 1.5%</div>
                      <div className="text-[9px] font-normal text-slate-400">(H.Prod × 1.5%)</div>
                    </th>
                    <th className="py-3 px-2 text-right min-w-[95px] text-indigo-900">
                      <div>Total Pajak</div>
                      <div className="text-[9px] font-normal text-indigo-500">(Pajak × Qty)</div>
                    </th>
                    <th className="py-3 px-2 text-right min-w-[90px] text-indigo-900">
                      <div>Total PPh</div>
                      <div className="text-[9px] font-normal text-indigo-500">(PPh × Qty)</div>
                    </th>
                  </>
                )}

                {(viewMode === 'all' || viewMode === 'tax' || viewMode === 'essential') && (
                  <th className="py-3 px-2.5 text-right min-w-[115px] border-r border-slate-200 font-bold text-slate-900">
                    <div>Total Harga Jual</div>
                    <div className="text-[9px] font-normal text-slate-400">(Jual × Qty)</div>
                  </th>
                )}

                {/* Harga Laba */}
                {(viewMode === 'all' || viewMode === 'profit') && (
                  <>
                    <th className="py-3 px-2 text-center min-w-[130px]">
                      <div>Cashback (0-20%)</div>
                      <div className="text-[9px] font-normal text-slate-500">Pilih / Ketik %</div>
                    </th>
                    <th className="py-3 px-2 text-center min-w-[110px]">
                      <div>Komisi (0-10%)</div>
                      <div className="text-[9px] font-normal text-slate-500">Pilih / Ketik %</div>
                    </th>
                  </>
                )}

                {(viewMode === 'all' || viewMode === 'profit' || viewMode === 'essential') && (
                  <>
                    <th className="py-3 px-2 text-right min-w-[105px] font-bold text-emerald-900 bg-emerald-50/25">
                      <div>Laba Satuan</div>
                      <div className="text-[9px] font-normal text-emerald-600">(per unit)</div>
                    </th>
                    <th className="py-3 px-3 text-right min-w-[120px] font-bold text-emerald-800 bg-emerald-50/40">
                      <div>Laba Bersih</div>
                      <div className="text-[9px] font-normal text-emerald-600">(Margin %)</div>
                    </th>
                  </>
                )}

                <th className="py-3 px-2 text-center min-w-[65px]">Aksi</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00629b] flex items-center justify-center">
                        <FilePlus className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Daftar Barang Masih Kosong
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Belum ada barang yang dimasukkan. Silakan klik tombol di bawah untuk mulai menambahkan barang belanjaan dan menghitung proyeksi laba Anda.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {onAddQuickRow && (
                          <button
                            type="button"
                            onClick={onAddQuickRow}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            + Tambah Baris Kosong
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onOpenAddModal}
                          className="px-4 py-1.5 bg-[#00629b] hover:bg-[#005180] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          + Form Input Barang
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const metrics = computeItemMetrics(item);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className={`group transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#ebf4fb] hover:bg-[#e2effa]'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* 1. NAMA BARANG */}
                      <td 
                        className="py-3 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleNameChange(item, e.target.value)}
                            placeholder="Ketik nama barang..."
                            className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00629b] focus:ring-1 focus:ring-[#00629b]"
                          />
                          {item.category && (
                            <div className="text-[10px] text-slate-400 font-normal px-1">
                              {item.category}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 2. HARGA BELI */}
                      <td 
                        className="py-3 px-2 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center rounded border border-slate-200 bg-white shadow-2xs focus-within:border-[#00629b]">
                          <input
                            type="text"
                            value={formatRupiah(item.buyPrice)}
                            onChange={(e) => handleBuyPriceChange(item, e.target.value)}
                            className="w-18 sm:w-20 px-1 py-1 text-right text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
                          />
                        </div>
                      </td>

                      {/* 3. QTY */}
                      <td
                        className="py-3 px-1.5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          min="1"
                          max="9999"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item, e.target.value)}
                          className="w-11 px-1 py-1 text-center font-semibold text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#00629b] shadow-2xs"
                        />
                      </td>

                      {/* 4. TOTAL MODAL */}
                      <td className="py-3 px-2 text-right font-medium text-slate-700 whitespace-nowrap border-r border-slate-200">
                        Rp {formatRupiah(metrics.totalModal)}
                      </td>

                      {/* 5. HARGA JUAL */}
                      <td
                        className="py-3 px-2 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center rounded border border-slate-300 bg-white shadow-2xs focus-within:ring-1 focus-within:ring-[#00629b] focus-within:border-[#00629b]">
                          <span className="px-1.5 py-1 text-[10px] font-bold text-slate-500 border-r border-slate-200 bg-slate-50 select-none">
                            Rp
                          </span>
                          <input
                            type="text"
                            value={formatRupiah(item.sellPrice)}
                            onChange={(e) => handleSellPriceChange(item, e.target.value)}
                            className="w-22 sm:w-24 px-1.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none bg-transparent"
                          />
                        </div>
                      </td>

                      {/* TOTAL HARGA PRODUK (Harga Jual / (1 + 11%)) */}
                      {(viewMode === 'all' || viewMode === 'tax') && (
                        <td className="py-3 px-2 text-right font-bold text-indigo-950 whitespace-nowrap bg-indigo-50/30">
                          <div>Rp {formatRupiah(metrics.totalHargaProduk)}</div>
                          <div className="text-[9px] font-normal text-indigo-600">
                            (Rp {formatRupiah(metrics.hargaProdukSatuan)}/u)
                          </div>
                        </td>
                      )}

                      {/* 8. PAJAK 12% */}
                      {(viewMode === 'all' || viewMode === 'tax') && (
                        <td className="py-3 px-2 text-right text-slate-600 whitespace-nowrap">
                          Rp {formatRupiah(metrics.pajakSatuan)}
                        </td>
                      )}

                      {/* 9. PPH 1.5% */}
                      {(viewMode === 'all' || viewMode === 'tax') && (
                        <td className="py-3 px-2 text-right text-slate-600 whitespace-nowrap">
                          Rp {formatRupiah(metrics.pphSatuan)}
                        </td>
                      )}

                      {/* 10. TOTAL PAJAK */}
                      {(viewMode === 'all' || viewMode === 'tax') && (
                        <td className="py-3 px-2 text-right font-medium text-indigo-900 whitespace-nowrap bg-indigo-50/20">
                          Rp {formatRupiah(metrics.totalPajak)}
                        </td>
                      )}

                      {/* 11. TOTAL PPH */}
                      {(viewMode === 'all' || viewMode === 'tax') && (
                        <td className="py-3 px-2 text-right font-medium text-indigo-900 whitespace-nowrap bg-indigo-50/20">
                          Rp {formatRupiah(metrics.totalPph)}
                        </td>
                      )}

                      {/* 12. TOTAL HARGA JUAL */}
                      {(viewMode === 'all' || viewMode === 'tax' || viewMode === 'essential') && (
                        <td className="py-3 px-2.5 text-right font-bold text-slate-900 whitespace-nowrap border-r border-slate-200">
                          Rp {formatRupiah(metrics.totalHargaJual)}
                        </td>
                      )}

                      {/* 13. CASHBACK 0% - 20% Flexible Selector */}
                      {(viewMode === 'all' || viewMode === 'profit') && (
                        <td 
                          className="py-3 px-2 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            {/* Preset Buttons 10% & 15% */}
                            <button
                              type="button"
                              onClick={() => handleCashbackChange(item, 10)}
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                metrics.cashbackPercent === 10
                                  ? 'bg-[#00629b] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              10%
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCashbackChange(item, 15)}
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                metrics.cashbackPercent === 15
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              15%
                            </button>
                            {/* Custom Number Input 0-20% */}
                            <div className="flex items-center pl-1 border-l border-slate-300">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={metrics.cashbackPercent}
                                onChange={(e) => handleCashbackChange(item, parseInt(e.target.value, 10) || 0)}
                                className="w-8 px-0.5 py-0.5 text-center text-[11px] font-bold text-slate-800 bg-white border border-slate-200 rounded"
                              />
                              <span className="text-[10px] font-bold text-slate-400 pl-0.5">%</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                            Rp {formatRupiah(metrics.cashbackNominal)}
                          </div>
                        </td>
                      )}

                      {/* 14. KOMISI 0% - 10% Flexible Selector */}
                      {(viewMode === 'all' || viewMode === 'profit') && (
                        <td 
                          className="py-3 px-2 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            {/* Preset Buttons 0% & 3% */}
                            <button
                              type="button"
                              onClick={() => handleCommissionChange(item, 0)}
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                metrics.commissionPercent === 0
                                  ? 'bg-slate-400 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              0%
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCommissionChange(item, 3)}
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                metrics.commissionPercent === 3
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              3%
                            </button>
                            {/* Custom Number Input 0-10% */}
                            <div className="flex items-center pl-1 border-l border-slate-300">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={metrics.commissionPercent}
                                onChange={(e) => handleCommissionChange(item, parseInt(e.target.value, 10) || 0)}
                                className="w-7 px-0.5 py-0.5 text-center text-[11px] font-bold text-slate-800 bg-white border border-slate-200 rounded"
                              />
                              <span className="text-[10px] font-bold text-slate-400 pl-0.5">%</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Rp {formatRupiah(metrics.komisiNominal)}
                          </div>
                        </td>
                      )}

                      {/* 15. LABA SATUAN */}
                      {(viewMode === 'all' || viewMode === 'profit' || viewMode === 'essential') && (
                        <td className="py-3 px-2 text-right whitespace-nowrap bg-emerald-50/15">
                          <div className="font-bold text-emerald-900 text-xs">
                            Rp {formatRupiah(metrics.labaPerUnit)}
                          </div>
                          <div className="text-[9px] text-slate-500 font-normal">
                            / unit
                          </div>
                        </td>
                      )}

                      {/* 16. LABA BERSIH */}
                      {(viewMode === 'all' || viewMode === 'profit' || viewMode === 'essential') && (
                        <td className="py-3 px-3 text-right whitespace-nowrap bg-emerald-50/30">
                          <div className="font-extrabold text-emerald-800 text-xs">
                            Rp {formatRupiah(metrics.laba)}
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-600">
                            {metrics.marginPercent.toFixed(1)}% margin
                          </div>
                        </td>
                      )}

                      {/* AKSI */}
                      <td
                        className="py-3 px-2 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectItem(item)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isSelected
                                ? 'text-[#00629b] bg-white shadow-2xs'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Lihat Rincian Rumus Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#e8f1fb] border-t border-[#d5e6f7] px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
          <div>
            Menampilkan <span className="font-semibold">{currentItems.length}</span> dari{' '}
            <span className="font-semibold">{totalItemsCount}</span> barang dalam perhitungan
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-prev-page"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white/60 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-medium px-1 text-slate-600">
              Hal {safeCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              id="btn-next-page"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white/60 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Halaman selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
