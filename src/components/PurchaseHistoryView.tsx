import React, { useState, useMemo } from 'react';
import { CalculationHistory, Item } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  ShoppingCart,
  ArrowRight,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Package,
  Calendar,
} from 'lucide-react';

interface PurchaseHistoryViewProps {
  histories: CalculationHistory[];
  onBackToDashboard: () => void;
}

interface ProjectGroup {
  title: string;
  sessions: CalculationHistory[];
  items: Item[];
  totalModal: number;
  totalHargaJual: number;
  sessionCount: number;
}

export const PurchaseHistoryView: React.FC<PurchaseHistoryViewProps> = ({
  histories,
  onBackToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const projectGroups = useMemo(() => {
    const groups: Record<string, ProjectGroup> = {};
    histories.forEach((hist) => {
      const key = hist.title || 'Tanpa Judul';
      if (!groups[key]) {
        groups[key] = {
          title: key,
          sessions: [],
          items: [],
          totalModal: 0,
          totalHargaJual: 0,
          sessionCount: 0,
        };
      }
      groups[key].sessions.push(hist);
      groups[key].items.push(...hist.items);
      groups[key].totalModal += hist.totalModal;
      groups[key].totalHargaJual += hist.totalHargaJual;
      groups[key].sessionCount += 1;
    });
    return Object.values(groups).sort((a, b) => b.sessions[0].timestamp.localeCompare(a.sessions[0].timestamp));
  }, [histories]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return projectGroups;
    const q = searchQuery.toLowerCase().trim();
    return projectGroups.filter((g) => {
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchItem = g.items.some((i) => i.name.toLowerCase().includes(q));
      return matchTitle || matchItem;
    });
  }, [projectGroups, searchQuery]);

  const toggleProject = (title: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const uniqueItemNames = useMemo(() => {
    const names = new Set<string>();
    histories.forEach((h) => h.items.forEach((i) => { if (i.name) names.add(i.name); }));
    return names.size;
  }, [histories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#00629b] uppercase block mb-1">
            RIWAYAT BELANJA PER PROYEK
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Riwayat Belanja
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh barang yang pernah dibeli dari semua sesi perhitungan, dikelompokkan berdasarkan nama proyek
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer self-start"
        >
          <span>Kembali ke Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama proyek atau nama barang..."
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
        <div className="flex items-center gap-3 text-xs text-slate-600 self-end sm:self-auto">
          <span className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-900">{filteredGroups.length}</strong> proyek
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-900">{uniqueItemNames}</strong> barang unik
          </span>
        </div>
      </div>

      {/* Empty State */}
      {histories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">
            Belum Ada Riwayat Belanja
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            Simpan sesi perhitungan di Riwayat Perhitungan terlebih dahulu. Setiap sesi akan menampilkan daftar barang di sini.
          </p>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Buka Kalkulator Utama
          </button>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Search className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">
            Tidak Ditemukan
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mb-4">
            Tidak ada proyek atau barang dengan kata kunci "<strong>{searchQuery}</strong>".
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
        <div className="space-y-3">
          {filteredGroups.map((group) => {
            const isExpanded = expandedProjects.has(group.title);
            return (
              <div
                key={group.title}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Project Header (clickable) */}
                <button
                  type="button"
                  onClick={() => toggleProject(group.title)}
                  className="w-full flex items-center gap-3 p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer text-left"
                >
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                      {group.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {group.sessions[group.sessions.length - 1].timestamp}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {group.sessionCount} sesi
                      </span>
                      <span className="font-medium text-[#00629b] bg-blue-50 px-1.5 py-0.5 rounded">
                        {group.items.length} barang
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="text-[11px] text-slate-500">Total Modal</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      Rp {formatRupiah(group.totalModal)}
                    </div>
                  </div>
                </button>

                {/* Expanded Item List */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    <div className="px-4 sm:px-5 py-3 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Package className="w-3 h-3" />
                      Daftar Barang ({group.items.length})
                    </div>
                    <div className="divide-y divide-slate-100">
                      {group.items.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {item.name || 'Barang tanpa nama'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.qty || 1} × Rp {formatRupiah(item.buyPrice)} (Beli)
                              {item.sellPrice > 0 && (
                                <> → Rp {formatRupiah(item.sellPrice)} (Jual)</>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-extrabold text-slate-800">
                              Rp {formatRupiah((item.buyPrice || 0) * (item.qty || 1))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
