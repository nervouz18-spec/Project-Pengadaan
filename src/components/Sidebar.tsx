import React from 'react';
import { LayoutGrid, Calculator, History, TrendingUp, Sparkles, FolderPlus, FileSpreadsheet, BookmarkCheck, ShoppingCart } from 'lucide-react';

export type AppTab = 'dashboard' | 'calculator' | 'history' | 'purchase-history' | 'financial-report' | 'saved-reports';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  historyCount: number;
  itemCount: number;
  savedReportsCount?: number;
  purchaseHistoryProjectCount?: number;
  onNewProjectClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  historyCount,
  itemCount,
  savedReportsCount = 0,
  purchaseHistoryProjectCount = 0,
  onNewProjectClick,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Logo Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-[#00629b]/10 text-[#00629b] flex items-center justify-center font-bold">
          <TrendingUp className="w-5 h-5 text-[#00629b]" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-[#00629b] text-lg tracking-tight leading-none">
            Proyeksi Laba
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
            Financial & Project Hub
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      {onNewProjectClick && (
        <div className="p-4 pb-1">
          <button
            type="button"
            onClick={onNewProjectClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Proyek Baru</span>
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="p-4 space-y-1.5 flex-1">
        {/* 1. Dashboard Tab */}
        <button
          type="button"
          id="nav-dashboard-tab"
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#4eedaa] text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid
            className={`w-4 h-4 ${
              activeTab === 'dashboard' ? 'text-slate-950' : 'text-slate-500'
            }`}
          />
          <span>Dashboard & Omset</span>
        </button>

        {/* 2. Kalkulator Perhitungan Tab */}
        <button
          type="button"
          id="nav-calculator-tab"
          onClick={() => onSelectTab('calculator')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-[#4eedaa] text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calculator
              className={`w-4 h-4 ${
                activeTab === 'calculator' ? 'text-slate-950' : 'text-slate-500'
              }`}
            />
            <span>Kalkulator Perhitungan</span>
          </div>
          {itemCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'calculator'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-blue-100 text-[#00629b]'
              }`}
            >
              {itemCount}
            </span>
          )}
        </button>

        {/* 3. Riwayat Perhitungan Tab (Pindahkan di atas Laporan & Bagi Hasil) */}
        <button
          type="button"
          id="nav-history-tab"
          onClick={() => onSelectTab('history')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#4eedaa] text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <History
              className={`w-4 h-4 ${
                activeTab === 'history' ? 'text-slate-950' : 'text-slate-500'
              }`}
            />
            <span>Riwayat Perhitungan</span>
          </div>
          {historyCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'history'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {historyCount}
            </span>
          )}
        </button>

        {/* 3b. Riwayat Belanja per Proyek Tab */}
        <button
          type="button"
          id="nav-purchase-history-tab"
          onClick={() => onSelectTab('purchase-history')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
            activeTab === 'purchase-history'
              ? 'bg-[#4eedaa] text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart
              className={`w-4 h-4 ${
                activeTab === 'purchase-history' ? 'text-slate-950' : 'text-slate-500'
              }`}
            />
            <span>Riwayat Belanja</span>
          </div>
          {purchaseHistoryProjectCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'purchase-history'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-blue-100 text-[#00629b]'
              }`}
            >
              {purchaseHistoryProjectCount}
            </span>
          )}
        </button>

        {/* 4. Laporan & Bagi Hasil Tab */}
        <button
          type="button"
          id="nav-financial-report-tab"
          onClick={() => onSelectTab('financial-report')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
            activeTab === 'financial-report'
              ? 'bg-[#4eedaa] text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet
              className={`w-4 h-4 ${
                activeTab === 'financial-report' ? 'text-slate-950' : 'text-slate-500'
              }`}
            />
            <span>Laporan & Bagi Hasil</span>
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
              activeTab === 'financial-report'
                ? 'bg-slate-950/15 text-slate-950'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Hitung
          </span>
        </button>

        {/* 5. TAB BARU: Arsip Laporan Bagi Hasil */}
        <button
          type="button"
          id="nav-saved-reports-tab"
          onClick={() => onSelectTab('saved-reports')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
            activeTab === 'saved-reports'
              ? 'bg-[#4eedaa] text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookmarkCheck
              className={`w-4 h-4 ${
                activeTab === 'saved-reports' ? 'text-slate-950' : 'text-slate-500'
              }`}
            />
            <span>Arsip Laporan Bagi Hasil</span>
          </div>
          {savedReportsCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'saved-reports'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {savedReportsCount}
            </span>
          )}
        </button>
      </nav>

      {/* Quick Summary Footer in Sidebar */}
      <div className="p-4 m-4 bg-slate-50 border border-slate-200/60 rounded-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00629b]" />
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            Sistem Terintegrasi
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Pajak 12% • PPh 1.5% • Materai & Operasional • Bagi Hasil Tim %
        </p>
      </div>
    </aside>
  );
};

