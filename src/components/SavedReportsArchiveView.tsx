import React, { useState, useMemo } from 'react';
import { 
  SavedFinancialReport, 
  CalculationHistory, 
  ProfitShareMember 
} from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  BookmarkCheck, 
  FolderOpen, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  Users, 
  Tag, 
  Receipt, 
  Stamp, 
  Truck, 
  PiggyBank, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  FileSpreadsheet, 
  Folder,
  History,
  FileCheck,
  TrendingUp,
  X,
  Share2,
  PencilLine,
  Save,
  AlertTriangle
} from 'lucide-react';

interface SavedReportsArchiveViewProps {
  savedReports: SavedFinancialReport[];
  histories: CalculationHistory[];
  onDeleteReport: (id: string) => void;
  onGoToNewReport: () => void;
  onLoadReportToEditor?: (report: SavedFinancialReport) => void;
  onUpdateReport?: (updated: SavedFinancialReport) => void;
}

export const SavedReportsArchiveView: React.FC<SavedReportsArchiveViewProps> = ({
  savedReports,
  histories,
  onDeleteReport,
  onGoToNewReport,
  onLoadReportToEditor,
  onUpdateReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [selectedDetailReport, setSelectedDetailReport] = useState<SavedFinancialReport | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [editingReport, setEditingReport] = useState<SavedFinancialReport | null>(null);
  const [editDraft, setEditDraft] = useState<SavedFinancialReport | null>(null);
  const [editPercentageError, setEditPercentageError] = useState<string | null>(null);

  // List of distinct project names from histories & saved reports
  const projectNamesList = useMemo(() => {
    const names = new Set<string>();
    histories.forEach((h) => {
      if (h.name) names.add(h.name);
    });
    savedReports.forEach((r) => {
      if (r.projectName) names.add(r.projectName);
    });
    return Array.from(names);
  }, [histories, savedReports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return savedReports.filter((report) => {
      // Filter by project name
      if (selectedProjectFilter !== 'all' && report.projectName !== selectedProjectFilter) {
        return false;
      }
      // Search keyword
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchProject = report.projectName.toLowerCase().includes(term);
      const matchNotes = (report.customNotes || '').toLowerCase().includes(term);
      const matchPic = (report.commissionRecipientName || '').toLowerCase().includes(term);
      const matchMembers = report.members.some((m) => m.name.toLowerCase().includes(term) || (m.role || '').toLowerCase().includes(term));
      return matchProject || matchNotes || matchPic || matchMembers;
    });
  }, [savedReports, selectedProjectFilter, searchTerm]);

  // Group filtered reports by Project Name
  const groupedReports = useMemo(() => {
    const map = new Map<string, SavedFinancialReport[]>();
    filteredReports.forEach((rep) => {
      const key = rep.projectName || 'Proyek Tanpa Nama';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(rep);
    });
    return Array.from(map.entries()).map(([projectName, reports]) => {
      // Aggregate stats for this project
      const totalOmset = reports.reduce((sum, r) => sum + (r.uangMasukOmset || 0), 0);
      const totalLabaBersih = reports.reduce((sum, r) => sum + (r.labaBersihAkhir || 0), 0);
      const totalModal = reports.reduce((sum, r) => sum + (r.totalModal || 0), 0);
      const totalKomisi = reports.reduce((sum, r) => sum + (r.komisiProject || 0), 0);
      const totalCashback = reports.reduce((sum, r) => sum + (r.cashbackProject || 0), 0);

      // Check if project exists in calculation history
      const matchedHistory = histories.find((h) => h.name === projectName || h.id === reports[0]?.projectId);

      return {
        projectName,
        reports,
        count: reports.length,
        totalOmset,
        totalLabaBersih,
        totalModal,
        totalKomisi,
        totalCashback,
        matchedHistory,
        latestDate: reports[0]?.timestamp || '-',
      };
    });
  }, [filteredReports, histories]);

  // Overall Statistics across all saved reports
  const overallStats = useMemo(() => {
    const totalReports = savedReports.length;
    const totalOmset = savedReports.reduce((s, r) => s + (r.uangMasukOmset || 0), 0);
    const totalLabaBersih = savedReports.reduce((s, r) => s + (r.labaBersihAkhir || 0), 0);
    const totalKomisi = savedReports.reduce((s, r) => s + (r.komisiProject || 0), 0);
    const totalCashback = savedReports.reduce((s, r) => s + (r.cashbackProject || 0), 0);
    const distinctProjectsCount = new Set(savedReports.map((r) => r.projectName)).size;

    return {
      totalReports,
      totalOmset,
      totalLabaBersih,
      totalKomisi,
      totalCashback,
      distinctProjectsCount,
    };
  }, [savedReports]);

  // Toggle project accordion
  const toggleProject = (projectName: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectName]: prev[projectName] === undefined ? false : !prev[projectName],
    }));
  };

  const isProjectExpanded = (projectName: string) => {
    // Default expanded
    return expandedProjects[projectName] !== false;
  };

  // ===== EDIT SAVED REPORT (update in place) =====
  const openEditReport = (rep: SavedFinancialReport) => {
    if (!onUpdateReport) return;
    setEditingReport(rep);
    setEditDraft(JSON.parse(JSON.stringify(rep)) as SavedFinancialReport);
    setEditPercentageError(null);
  };

  const updateEditField = <K extends keyof SavedFinancialReport>(
    key: K,
    value: SavedFinancialReport[K]
  ) => {
    setEditDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateEditMember = (index: number, field: keyof ProfitShareMember, value: string | number) => {
    setEditDraft((prev) => {
      if (!prev) return prev;
      const members = prev.members.map((m, i) => (i === index ? { ...m, [field]: value } : m));
      return { ...prev, members };
    });
    setEditPercentageError(null);
  };

  const addEditMember = () => {
    setEditDraft((prev) => {
      if (!prev) return prev;
      const currentTotal = prev.members.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
      const remaining = 100 - currentTotal;
      const newPercentage = remaining > 0 ? Number(Math.min(remaining, 100).toFixed(2)) : 0;
      return {
        ...prev,
        members: [
          ...prev.members,
          {
            id: `edit-member-${Date.now()}-${prev.members.length}`,
            name: '',
            role: '',
            percentage: newPercentage,
          },
        ],
      };
    });
    setEditPercentageError(null);
  };

  const removeEditMember = (index: number) => {
    setEditDraft((prev) => (prev ? { ...prev, members: prev.members.filter((_, i) => i !== index) } : prev));
    setEditPercentageError(null);
  };

  // Live recomputation of report numbers from the edit draft
  const editComputed = useMemo(() => {
    if (!editDraft) return null;
    const uangMasuk = Math.max(0, Number(editDraft.uangMasukOmset) || 0);
    const totalModal = Math.max(0, Number(editDraft.totalModal) || 0);
    const cashbackPercent = Math.min(100, Math.max(0, Number(editDraft.cashbackPercent) || 0));
    const commissionPercent = Math.min(10, Math.max(0, Number(editDraft.commissionPercent) || 0));
    const cashbackNominal = Math.round(uangMasuk * (cashbackPercent / 100));
    const komisiNominal = Math.round(uangMasuk * (commissionPercent / 100));
    const labaProject = Math.max(0, uangMasuk - totalModal - cashbackNominal - komisiNominal);
    const biayaMaterai = Math.max(0, Number(editDraft.biayaMaterai) || 0);
    const biayaOperasional = Math.max(0, Number(editDraft.biayaOperasional) || 0);
    const labaSetelahBiaya = Math.max(0, labaProject - biayaMaterai - biayaOperasional);
    const tabunganPajakPercent = Math.min(100, Math.max(0, Number(editDraft.tabunganPajakPercent) || 0));
    const tabunganPajakNominal = Math.round(labaSetelahBiaya * (tabunganPajakPercent / 100));
    const labaBersihAkhir = Math.max(0, labaSetelahBiaya - tabunganPajakNominal);
    const totalPercent = editDraft.members.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
    return {
      cashbackNominal,
      komisiNominal,
      labaProject,
      labaSetelahBiaya,
      tabunganPajakNominal,
      labaBersihAkhir,
      totalPercent: Number(totalPercent.toFixed(2)),
      percentIsValid: Math.abs(totalPercent - 100) < 0.01,
    };
  }, [editDraft]);

  const handleSaveEdit = () => {
    if (!editingReport || !editDraft || !editComputed) return;
    if (!editComputed.percentIsValid) {
      setEditPercentageError(`Total porsi harus 100% (saat ini ${editComputed.totalPercent}%).`);
      return;
    }
    const members = editDraft.members.map((m) => ({
      ...m,
      id: m.id || `edit-member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: (m.name || '').trim() || 'Penerima',
      role: (m.role || '').trim(),
      percentage: Number(m.percentage) || 0,
      capitalNominal: Math.max(0, Number(m.capitalNominal) || 0),
      capitalItemIds: m.capitalItemIds,
      capitalItems: m.capitalItems,
    }));
    const updated: SavedFinancialReport = {
      ...editDraft,
      id: editingReport.id,
      projectId: editDraft.projectId || editingReport.projectId,
      projectName: (editDraft.projectName || '').trim() || 'Proyek Tanpa Nama',
      projectDescription: (editDraft.projectDescription || '').trim() || undefined,
      timestamp: new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      uangMasukOmset: Math.max(0, Number(editDraft.uangMasukOmset) || 0),
      totalModal: Math.max(0, Number(editDraft.totalModal) || 0),
      cashbackProject: editComputed.cashbackNominal,
      cashbackPercent: Math.min(100, Math.max(0, Number(editDraft.cashbackPercent) || 0)),
      komisiProject: editComputed.komisiNominal,
      commissionPercent: Math.min(10, Math.max(0, Number(editDraft.commissionPercent) || 0)),
      commissionRecipientName: (editDraft.commissionRecipientName || '').trim() || undefined,
      labaProject: editComputed.labaProject,
      biayaMaterai: Math.max(0, Number(editDraft.biayaMaterai) || 0),
      biayaOperasional: Math.max(0, Number(editDraft.biayaOperasional) || 0),
      tabunganPajakPercent: Math.min(100, Math.max(0, Number(editDraft.tabunganPajakPercent) || 0)),
      tabunganPajakNominal: editComputed.tabunganPajakNominal,
      labaBersihAkhir: editComputed.labaBersihAkhir,
      members,
      customNotes: (editDraft.customNotes || '').trim() || undefined,
    };
    onUpdateReport?.(updated);
    setSelectedDetailReport((prev) => (prev && prev.id === editingReport.id ? updated : prev));
    setEditingReport(null);
    setEditDraft(null);
    setEditPercentageError(null);
  };

  const closeEditModal = () => {
    setEditingReport(null);
    setEditDraft(null);
    setEditPercentageError(null);
  };

  // Export Single Report to CSV
  const handleExportSingleCSV = (report: SavedFinancialReport) => {
    const headers = [
      'Nama Proyek',
      'Waktu Disimpan',
      'Uang Masuk / Omset (Rp)',
      'Total Modal Proyek (Rp)',
      'Cashback (%)',
      'Nominal Cashback (Rp)',
      'Komisi (%)',
      'Nominal Komisi (Rp)',
      'Penerima Komisi',
      'Laba Proyek (Rp)',
      'Biaya Materai (Rp)',
      'Biaya Operasional (Rp)',
      'Tabungan Pajak (%)',
      'Nominal Tabungan Pajak (Rp)',
      'Laba Bersih Akhir (Rp)',
      'Nama Penerima',
      'Peran',
      'Porsi (%)',
      'Modal Kontribusi (Rp)',
      'Bagian Laba (Rp)',
      'Total Diterima (Rp)',
      'Catatan',
    ];

    const rows: (string | number)[][] = [];

    if (report.members.length === 0) {
      rows.push([
        `"${report.projectName.replace(/"/g, '""')}"`,
        `"${report.timestamp}"`,
        Math.round(report.uangMasukOmset),
        Math.round(report.totalModal),
        `${report.cashbackPercent || 0}%`,
        Math.round(report.cashbackProject || 0),
        `${report.commissionPercent || 0}%`,
        Math.round(report.komisiProject || 0),
        `"${(report.commissionRecipientName || '-').replace(/"/g, '""')}"`,
        Math.round(report.labaProject),
        Math.round(report.biayaMaterai),
        Math.round(report.biayaOperasional),
        `${report.tabunganPajakPercent || 0}%`,
        Math.round(report.tabunganPajakNominal || 0),
        Math.round(report.labaBersihAkhir),
        '-',
        '-',
        '-',
        0,
        Math.round(report.labaBersihAkhir),
        Math.round(report.labaBersihAkhir),
        `"${(report.customNotes || '').replace(/"/g, '""')}"`,
      ]);
    } else {
      report.members.forEach((m) => {
        const shareNominal = report.labaBersihAkhir * (m.percentage / 100);
        const capitalNominal = m.capitalNominal || 0;
        rows.push([
          `"${report.projectName.replace(/"/g, '""')}"`,
          `"${report.timestamp}"`,
          Math.round(report.uangMasukOmset),
          Math.round(report.totalModal),
          `${report.cashbackPercent || 0}%`,
          Math.round(report.cashbackProject || 0),
          `${report.commissionPercent || 0}%`,
          Math.round(report.komisiProject || 0),
          `"${(report.commissionRecipientName || '-').replace(/"/g, '""')}"`,
          Math.round(report.labaProject),
          Math.round(report.biayaMaterai),
          Math.round(report.biayaOperasional),
          `${report.tabunganPajakPercent || 0}%`,
          Math.round(report.tabunganPajakNominal || 0),
          Math.round(report.labaBersihAkhir),
          `"${(m.name || 'Orang').replace(/"/g, '""')}"`,
          `"${(m.role || '-').replace(/"/g, '""')}"`,
          `${m.percentage}%`,
          Math.round(capitalNominal),
          Math.round(shareNominal),
          Math.round(capitalNominal + shareNominal),
          `"${(report.customNotes || '').replace(/"/g, '""')}"`,
        ]);
      });
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Bagi_Hasil_${report.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export All Saved Reports to CSV
  const handleExportAllCSV = () => {
    if (savedReports.length === 0) return;

    const headers = [
      'ID Laporan',
      'Nama Proyek',
      'Waktu Disimpan',
      'Uang Masuk / Omset (Rp)',
      'Total Modal Proyek (Rp)',
      'Cashback (%)',
      'Nominal Cashback (Rp)',
      'Komisi (%)',
      'Nominal Komisi (Rp)',
      'Penerima Komisi',
      'Laba Proyek (Rp)',
      'Biaya Materai (Rp)',
      'Biaya Operasional (Rp)',
      'Tabungan Pajak (%)',
      'Nominal Tabungan Pajak (Rp)',
      'Laba Bersih Akhir (Rp)',
      'Jumlah Penerima',
      'Rincian Pembagian Hasil',
      'Catatan',
    ];

    const rows = savedReports.map((r) => {
      const memberDetails = r.members
        .map((m) => {
          const shareNominal = r.labaBersihAkhir * (m.percentage / 100);
          const capitalNominal = m.capitalNominal || 0;
          const totalReceived = capitalNominal + shareNominal;
          return `${m.name} (${m.percentage}% = Bagian Laba Rp ${formatRupiah(shareNominal)} | Modal Rp ${formatRupiah(capitalNominal)} | Total Rp ${formatRupiah(totalReceived)})`;
        })
        .join('; ');

      return [
        `"${r.id}"`,
        `"${r.projectName.replace(/"/g, '""')}"`,
        `"${r.timestamp}"`,
        Math.round(r.uangMasukOmset),
        Math.round(r.totalModal),
        `${r.cashbackPercent || 0}%`,
        Math.round(r.cashbackProject || 0),
        `${r.commissionPercent || 0}%`,
        Math.round(r.komisiProject || 0),
        `"${(r.commissionRecipientName || '-').replace(/"/g, '""')}"`,
        Math.round(r.labaProject),
        Math.round(r.biayaMaterai),
        Math.round(r.biayaOperasional),
        `${r.tabunganPajakPercent || 0}%`,
        Math.round(r.tabunganPajakNominal || 0),
        Math.round(r.labaBersihAkhir),
        r.members.length,
        `"${memberDetails.replace(/"/g, '""')}"`,
        `"${(r.customNotes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Semua_Arsip_Laporan_Bagi_Hasil_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Top Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black shadow-2xs">
            <BookmarkCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Arsip & Penyimpanan Laporan Bagi Hasil
              </h1>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                {savedReports.length} Laporan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Seluruh laporan dan slip bagi hasil yang tersimpan, dikelompokkan berdasarkan nama proyek riwayat perhitungan.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {savedReports.length > 0 && (
            <button
              type="button"
              onClick={handleExportAllCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Ekspor Semua CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onGoToNewReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat / Hitung Laporan Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Global Metric Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Laporan
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            {overallStats.totalReports}{' '}
            <span className="text-xs font-medium text-slate-400">
              ({overallStats.distinctProjectsCount} Proyek)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 block uppercase tracking-wider">
            Total Omset Masuk
          </span>
          <div className="text-lg sm:text-xl font-black text-blue-900 mt-0.5">
            Rp {formatRupiah(overallStats.totalOmset)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-800 block uppercase tracking-wider">
            Total Laba Bersih Dibagi
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-800 mt-0.5">
            Rp {formatRupiah(overallStats.totalLabaBersih)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">
            Total Cashback
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-800 mt-0.5">
            Rp {formatRupiah(overallStats.totalCashback)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-indigo-700 block uppercase tracking-wider">
            Total Komisi PIC
          </span>
          <div className="text-lg sm:text-xl font-black text-indigo-900 mt-0.5">
            Rp {formatRupiah(overallStats.totalKomisi)}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama proyek, PIC, orang, catatan..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00629b]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdown & View Mode Switch */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Project Filter Select */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#00629b]"
            >
              <option value="all">Semua Proyek Riwayat ({projectNamesList.length})</option>
              {projectNamesList.map((name, i) => (
                <option key={i} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Grouped vs List Mode */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kelompokkan per Proyek Riwayat"
            >
              <span className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Per Proyek</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilkan Semua dalam Daftar"
            >
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Semua</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Empty State */}
      {savedReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Belum Ada Laporan Bagi Hasil Tersimpan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda dapat menghitung pembagian hasil di tab <strong>Laporan & Bagi Hasil</strong>, lalu menekan tombol <strong>Simpan Laporan</strong> untuk mengarsipkannya di sini berdasarkan nama proyek perhitungan.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToNewReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Buat Laporan Bagi Hasil</span>
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada laporan yang cocok</h3>
          <p className="text-xs text-slate-500">
            Tidak ditemukan laporan yang sesuai dengan kata kunci atau filter proyek yang dipilih.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedProjectFilter('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === 'grouped' ? (
        /* 5A. VIEW MODE: GROUPED BY PROJECT NAME */
        <div className="space-y-6">
          {groupedReports.map((group) => {
            const isExpanded = isProjectExpanded(group.projectName);
            return (
              <div
                key={group.projectName}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Group Header Card */}
                <div
                  onClick={() => toggleProject(group.projectName)}
                  className="p-5 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00629b] flex items-center justify-center shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {group.projectName}
                        </h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-[#00629b] text-[10px] font-black rounded-md uppercase">
                          {group.count} Slip Tersimpan
                        </span>
                        {group.matchedHistory && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            <History className="w-3 h-3 text-slate-400" />
                            Ada di Riwayat
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Pembaruan Terakhir: {group.latestDate}
                      </span>
                    </div>
                  </div>

                  {/* Summary Badges on Header */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 block uppercase">Total Omset:</span>
                      <strong className="text-slate-800 font-bold">
                        Rp {formatRupiah(group.totalOmset)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 block uppercase font-bold">
                        Total Laba Bersih:
                      </span>
                      <strong className="text-emerald-800 font-black text-sm">
                        Rp {formatRupiah(group.totalLabaBersih)}
                      </strong>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Content: List of Saved Reports */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50/40 divide-y divide-slate-200/60 space-y-4">
                    {group.reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="pt-4 first:pt-0 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-4"
                      >
                        {/* Report Sub-Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  Slip Pembagian Hasil
                                </span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                  {rep.timestamp}
                                </span>
                              </div>
                              {rep.projectDescription && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {rep.projectDescription}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions for this Report */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailReport(rep)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Lihat Slip & Detail Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Lihat Slip</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExportSingleCSV(rep)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Ekspor CSV Laporan Ini"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden md:inline">CSV</span>
                            </button>

                            {onUpdateReport && (
                              <button
                                type="button"
                                onClick={() => openEditReport(rep)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="Edit Laporan Ini"
                              >
                                <PencilLine className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit</span>
                              </button>
                            )}

                            {onLoadReportToEditor && (
                              <button
                                type="button"
                                onClick={() => onLoadReportToEditor(rep)}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#00629b] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="Buka kembali di Kalkulator Laporan"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Buka di Editor</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(rep.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus slip ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Financial Metrics Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <span className="text-[10px] text-blue-600 block font-bold">1. Omset Masuk</span>
                            <strong className="text-blue-950 font-black text-sm">
                              Rp {formatRupiah(rep.uangMasukOmset)}
                            </strong>
                          </div>

                          <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl">
                            <span className="text-[10px] text-red-600 block font-bold">2. Modal Belanja</span>
                            <strong className="text-red-700 font-extrabold text-sm">
                              Rp {formatRupiah(rep.totalModal)}
                            </strong>
                          </div>

                          <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl">
                            <span className="text-[10px] text-amber-700 block font-bold">
                              3. Cashback ({rep.cashbackPercent || 0}%)
                            </span>
                            <strong className="text-amber-800 font-extrabold text-sm">
                              Rp {formatRupiah(rep.cashbackProject || 0)}
                            </strong>
                          </div>

                          <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                            <span className="text-[10px] text-indigo-700 block font-bold truncate">
                              4. Komisi ({rep.commissionPercent || 0}%)
                            </span>
                            <strong className="text-indigo-800 font-extrabold text-sm">
                              Rp {formatRupiah(rep.komisiProject || 0)}
                            </strong>
                            {rep.commissionRecipientName && (
                              <span className="text-[9px] text-indigo-600 block truncate">
                                PIC: {rep.commissionRecipientName}
                              </span>
                            )}
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-[10px] text-slate-500 block font-bold">
                              5. Materai & Ops
                            </span>
                            <strong className="text-slate-800 font-extrabold text-sm">
                              Rp {formatRupiah(rep.biayaMaterai + rep.biayaOperasional)}
                            </strong>
                          </div>

                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <span className="text-[10px] text-emerald-800 block font-black">
                              Laba Bersih Akhir
                            </span>
                            <strong className="text-emerald-900 font-black text-sm">
                              Rp {formatRupiah(rep.labaBersihAkhir)}
                            </strong>
                          </div>
                        </div>

                        {/* Members Breakdown Chips */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                            Distribusi Bagi Hasil ({rep.members.length} Orang Penerima):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {rep.members.map((m, idx) => {
                              const shareNominal = rep.labaBersihAkhir * (m.percentage / 100);
                              const capitalNominal = m.capitalNominal || 0;
                              const totalReceived = capitalNominal + shareNominal;
                              return (
                                <div
                                  key={idx}
                                  className="p-2.5 bg-emerald-50/60 border border-emerald-200/70 rounded-xl space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <span className="font-bold text-emerald-950 text-xs block truncate">
                                        {m.name || 'Penerima'}
                                      </span>
                                      <span className="text-[10px] text-emerald-700 block">
                                        {m.role || 'Anggota Tim'} • {m.percentage}%
                                      </span>
                                    </div>
                                    <strong className="text-xs font-black text-emerald-900 whitespace-nowrap">
                                      Rp {formatRupiah(shareNominal)}
                                    </strong>
                                  </div>
                                  {(capitalNominal > 0 || totalReceived > 0) && (
                                    <div className="text-[10px] text-slate-600 bg-white/70 border border-emerald-100 rounded-lg px-2 py-1 space-y-0.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Modal:</span>
                                        <strong className="text-slate-800">Rp {formatRupiah(capitalNominal)}</strong>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-blue-700">Total Diterima:</span>
                                        <strong className="text-blue-900">Rp {formatRupiah(totalReceived)}</strong>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom Notes if exists */}
                        {rep.customNotes && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                            <span className="font-bold text-slate-700">Catatan:</span> {rep.customNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* 5B. VIEW MODE: ALL LIST CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#00629b]/40 hover:shadow-sm transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-[#00629b] rounded-md">
                      {rep.projectName}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {rep.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDetailReport(rep)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Lihat Slip Lengkap"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSingleCSV(rep)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Ekspor CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {onUpdateReport && (
                      <button
                        type="button"
                        onClick={() => openEditReport(rep)}
                        className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                        title="Edit Laporan"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(rep.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Omset Masuk:</span>
                    <strong className="text-slate-800">Rp {formatRupiah(rep.uangMasukOmset)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Modal Belanja:</span>
                    <strong className="text-slate-800">Rp {formatRupiah(rep.totalModal)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cashback & Komisi:</span>
                    <strong className="text-slate-800">
                      Rp {formatRupiah((rep.cashbackProject || 0) + (rep.komisiProject || 0))}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 block font-bold">Laba Bersih Akhir:</span>
                    <strong className="text-emerald-800 font-extrabold text-sm">
                      Rp {formatRupiah(rep.labaBersihAkhir)}
                    </strong>
                  </div>
                </div>

                {/* Members list */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Distribusi Bagi Hasil ({rep.members.length} Orang):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {rep.members.map((m, idx) => {
                      const shareNominal = rep.labaBersihAkhir * (m.percentage / 100);
                      const capitalNominal = m.capitalNominal || 0;
                      return (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200/60 rounded-md font-medium"
                        >
                          {m.name || 'Orang'}: <strong>{m.percentage}%</strong> (Bagian Laba Rp {formatRupiah(shareNominal)}
                          {capitalNominal > 0 && <> • Modal Rp {formatRupiah(capitalNominal)} • Total Rp {formatRupiah(capitalNominal + shareNominal)}</>}
                          )
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedDetailReport(rep)}
                  className="text-xs font-bold text-[#00629b] hover:underline flex items-center gap-1"
                >
                  <span>Buka Slip & Cetak</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {onLoadReportToEditor && (
                  <button
                    type="button"
                    onClick={() => onLoadReportToEditor(rep)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Buka di Editor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. POPUP DETAIL SLIP & PRINT MODAL */}
      {selectedDetailReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Slip Resmi Pembagian Hasil
                  </h3>
                  <p className="text-xs text-slate-500">
                    Proyek: <strong className="text-slate-800">{selectedDetailReport.projectName}</strong> • Disimpan: {selectedDetailReport.timestamp}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Printable Body */}
            <div id="printable-saved-slip" className="space-y-5 text-slate-800">
              {/* Slip Metadata Header */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">NAMA PROYEK</span>
                  <strong className="text-slate-900 text-sm block">{selectedDetailReport.projectName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">WAKTU DIBUAT</span>
                  <strong className="text-slate-700 block">{selectedDetailReport.timestamp}</strong>
                </div>
                {selectedDetailReport.commissionRecipientName && (
                  <div>
                    <span className="text-[10px] text-indigo-600 block font-bold">PIC / PENERIMA KOMISI</span>
                    <strong className="text-indigo-900 block">{selectedDetailReport.commissionRecipientName}</strong>
                  </div>
                )}
              </div>

              {/* Rincian Finansial Formula */}
              <div className="space-y-2 text-xs">
                <span className="font-extrabold text-slate-900 text-xs block uppercase tracking-wider">
                  Rincian Kalkulasi Laba Bersih:
                </span>
                <div className="p-3 bg-blue-50/60 rounded-xl flex justify-between">
                  <span className="text-blue-950 font-bold">1. Uang Masuk / Omset (Manual):</span>
                  <strong className="text-blue-900">Rp {formatRupiah(selectedDetailReport.uangMasukOmset)}</strong>
                </div>
                <div className="p-3 bg-red-50/40 rounded-xl flex justify-between">
                  <span className="text-red-950 font-bold">2. Modal Belanja Barang:</span>
                  <strong className="text-red-700">- Rp {formatRupiah(selectedDetailReport.totalModal)}</strong>
                </div>
                {(selectedDetailReport.cashbackProject || 0) > 0 && (
                  <div className="p-3 bg-amber-50/40 rounded-xl flex justify-between">
                    <span className="text-amber-950 font-bold">
                      3. Cashback ({selectedDetailReport.cashbackPercent || 0}%):
                    </span>
                    <strong className="text-amber-800">- Rp {formatRupiah(selectedDetailReport.cashbackProject || 0)}</strong>
                  </div>
                )}
                {(selectedDetailReport.komisiProject || 0) > 0 && (
                  <div className="p-3 bg-indigo-50/40 rounded-xl flex justify-between">
                    <span className="text-indigo-950 font-bold">
                      4. Komisi ({selectedDetailReport.commissionPercent || 0}% - PIC: {selectedDetailReport.commissionRecipientName || 'Marketing'}):
                    </span>
                    <strong className="text-indigo-900">- Rp {formatRupiah(selectedDetailReport.komisiProject || 0)}</strong>
                  </div>
                )}
                <div className="p-3 bg-slate-100 rounded-xl flex justify-between font-bold">
                  <span className="text-slate-800">= Laba Proyek Sebelum Operasional:</span>
                  <strong className="text-slate-900">Rp {formatRupiah(selectedDetailReport.labaProject)}</strong>
                </div>
                <div className="p-3 bg-red-50/40 rounded-xl flex justify-between">
                  <span className="text-red-950">5. Biaya Materai:</span>
                  <strong className="text-red-700">- Rp {formatRupiah(selectedDetailReport.biayaMaterai)}</strong>
                </div>
                <div className="p-3 bg-red-50/40 rounded-xl flex justify-between">
                  <span className="text-red-950">6. Biaya Operasional:</span>
                  <strong className="text-red-700">- Rp {formatRupiah(selectedDetailReport.biayaOperasional)}</strong>
                </div>
                {(selectedDetailReport.tabunganPajakNominal || 0) > 0 && (
                  <div className="p-3 bg-amber-50/40 rounded-xl flex justify-between">
                    <span className="text-amber-950">
                      7. Tabungan Pajak ({selectedDetailReport.tabunganPajakPercent || 0}%):
                    </span>
                    <strong className="text-amber-800">- Rp {formatRupiah(selectedDetailReport.tabunganPajakNominal || 0)}</strong>
                  </div>
                )}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center mt-2">
                  <span className="text-xs font-black text-emerald-950 uppercase">
                    = LABA BERSIH AKHIR (DIBAGIKAN)
                  </span>
                  <strong className="text-base font-black text-emerald-900">
                    Rp {formatRupiah(selectedDetailReport.labaBersihAkhir)}
                  </strong>
                </div>
              </div>

              {/* Tabel Distribusi Penerima Bagi Hasil */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-900 text-xs block uppercase tracking-wider">
                  Distribusi Pembagian Hasil ke Anggota Tim:
                </span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Penerima</th>
                        <th className="py-2.5 px-3">Peran / Tugas</th>
                        <th className="py-2.5 px-3 text-center">Porsi (%)</th>
                        <th className="py-2.5 px-3 text-right">Modal Kontribusi</th>
                        <th className="py-2.5 px-3 text-right">Bagian Laba</th>
                        <th className="py-2.5 px-3 text-right">Total Diterima</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDetailReport.members.map((m, idx) => {
                        const nominal = selectedDetailReport.labaBersihAkhir * (m.percentage / 100);
                        const capitalNominal = m.capitalNominal || 0;
                        const totalReceived = capitalNominal + nominal;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{m.name || 'Anggota'}</td>
                            <td className="py-2.5 px-3 text-slate-500">{m.role || '-'}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{m.percentage}%</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-700">
                              Rp {formatRupiah(capitalNominal)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                              Rp {formatRupiah(nominal)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-blue-900">
                              Rp {formatRupiah(totalReceived)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {selectedDetailReport.members.some((m) => (m.capitalNominal || 0) > 0) && (
                      <tfoot className="border-t border-slate-200 bg-blue-50/40">
                        <tr>
                          <td colSpan={4} className="py-2.5 px-3 text-xs font-extrabold text-slate-700">
                            TOTAL
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-slate-800">
                            Rp {formatRupiah(selectedDetailReport.members.reduce((s, m) => s + (m.capitalNominal || 0), 0))}
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-emerald-900">
                            Rp {formatRupiah(selectedDetailReport.labaBersihAkhir)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-blue-900">
                            Rp {formatRupiah(selectedDetailReport.members.reduce((s, m) => s + (m.capitalNominal || 0) + (selectedDetailReport.labaBersihAkhir * (m.percentage / 100)), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {selectedDetailReport.customNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Catatan Khusus:</span> {selectedDetailReport.customNotes}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetailReport(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {onUpdateReport && (
                  <button
                    type="button"
                    onClick={() => openEditReport(selectedDetailReport)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    <PencilLine className="w-4 h-4" />
                    <span>Edit Laporan</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleExportSingleCSV(selectedDetailReport)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Slip Pembagian</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Laporan Ini?</h3>
              <p className="text-xs text-slate-500">
                Laporan bagi hasil ini akan dihapus dari arsip penyimpanan secara permanen.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteReport(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. EDIT REPORT MODAL */}
      {editingReport && editDraft && onUpdateReport && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <PencilLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Edit Laporan Bagi Hasil</h3>
                  <p className="text-[11px] text-slate-500">
                    Perbarui data laporan ini langsung di arsip. ID laporan tidak berubah.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/70 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* A. Data Proyek & Keuangan */}
              <section className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Data Proyek & Keuangan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Proyek</label>
                    <input
                      type="text"
                      value={editDraft.projectName}
                      onChange={(e) => updateEditField('projectName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                      placeholder="Nama proyek..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Deskripsi Proyek</label>
                    <input
                      type="text"
                      value={editDraft.projectDescription || ''}
                      onChange={(e) => updateEditField('projectDescription', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                      placeholder="Deskripsi singkat proyek..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Uang Masuk / Omset (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={editDraft.uangMasukOmset}
                      onChange={(e) => updateEditField('uangMasukOmset', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Total Modal Proyek (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={editDraft.totalModal}
                      onChange={(e) => updateEditField('totalModal', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Cashback (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editDraft.cashbackPercent || 0}
                      onChange={(e) => updateEditField('cashbackPercent', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Komisi (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step="0.1"
                      value={editDraft.commissionPercent || 0}
                      onChange={(e) => updateEditField('commissionPercent', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Penerima Komisi</label>
                    <input
                      type="text"
                      value={editDraft.commissionRecipientName || ''}
                      onChange={(e) => updateEditField('commissionRecipientName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                      placeholder="Nama penerima komisi..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Biaya Materai (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={editDraft.biayaMaterai}
                      onChange={(e) => updateEditField('biayaMaterai', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Biaya Operasional (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={editDraft.biayaOperasional}
                      onChange={(e) => updateEditField('biayaOperasional', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tabungan Pajak (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={editDraft.tabunganPajakPercent || 0}
                      onChange={(e) => updateEditField('tabunganPajakPercent', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                    />
                  </div>
                </div>

                {/* Live Summary */}
                {editComputed && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Cashback (Rp)</span>
                      <strong className="text-xs text-slate-800">Rp {formatRupiah(editComputed.cashbackNominal)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Komisi (Rp)</span>
                      <strong className="text-xs text-slate-800">Rp {formatRupiah(editComputed.komisiNominal)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Laba Proyek</span>
                      <strong className="text-xs text-emerald-800">Rp {formatRupiah(editComputed.labaProject)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tabungan Pajak</span>
                      <strong className="text-xs text-slate-800">Rp {formatRupiah(editComputed.tabunganPajakNominal)}</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-700 block font-bold">Laba Bersih Akhir</span>
                      <strong className="text-xs text-emerald-900 font-black">Rp {formatRupiah(editComputed.labaBersihAkhir)}</strong>
                    </div>
                  </div>
                )}
              </section>

              {/* B. Pembagian Bagi Hasil */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Distribusi Bagi Hasil ({editDraft.members.length} Penerima)
                  </span>
                  <button
                    type="button"
                    onClick={addEditMember}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Penerima</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editDraft.members.map((m, idx) => {
                    const shareNominal = editComputed ? editComputed.labaBersihAkhir * ((Number(m.percentage) || 0) / 100) : 0;
                    const capitalNominal = Math.max(0, Number(m.capitalNominal) || 0);
                    return (
                      <div key={m.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-600 text-[11px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => updateEditMember(idx, 'name', e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                            placeholder="Nama penerima..."
                          />
                          <input
                            type="text"
                            value={m.role || ''}
                            onChange={(e) => updateEditMember(idx, 'role', e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                            placeholder="Peran / tugas..."
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              value={m.percentage}
                              onChange={(e) => updateEditMember(idx, 'percentage', Number(e.target.value))}
                              className="w-20 px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-emerald-800 text-right focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                            />
                            <span className="text-xs font-bold text-slate-500">%</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEditMember(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                            title="Hapus Penerima"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pl-8">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Modal (Rp):</span>
                            <input
                              type="number"
                              min={0}
                              value={capitalNominal}
                              onChange={(e) => updateEditMember(idx, 'capitalNominal', Number(e.target.value))}
                              className="w-28 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                            />
                          </div>
                          {(m.capitalItems && m.capitalItems.length > 0) && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-1.5 py-0.5">
                              Berasal dari {m.capitalItems.length} item (split persenan)
                            </span>
                          )}
                          {(!m.capitalItems || m.capitalItems.length === 0) && (m.capitalItemIds && m.capitalItemIds.length > 0) && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-1.5 py-0.5">
                              Berasal dari {m.capitalItemIds.length} item terpilih
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-slate-400">Bagian Laba:</span>
                            <strong className="text-emerald-700">Rp {formatRupiah(shareNominal)}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-slate-400">Total Diterima:</span>
                            <strong className="text-blue-800">Rp {formatRupiah(capitalNominal + shareNominal)}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Percentage Total Indicator */}
                {editComputed && (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-[11px] font-bold text-slate-600">Total Porsi</span>
                    <span
                      className={`text-sm font-black ${
                        editComputed.percentIsValid ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {editComputed.totalPercent}% {editComputed.percentIsValid && <CheckCircle2 className="w-4 h-4 inline-block" />}
                    </span>
                  </div>
                )}
                {editPercentageError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-700 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{editPercentageError}</span>
                  </div>
                )}
              </section>

              {/* C. Catatan */}
              <section className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Catatan
                </span>
                <textarea
                  value={editDraft.customNotes || ''}
                  onChange={(e) => updateEditField('customNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300"
                  placeholder="Catatan khusus untuk laporan ini..."
                />
              </section>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <div className="text-[11px] text-slate-400">
                Edit terakhir: <strong className="text-slate-600">{editingReport.timestamp}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editComputed?.percentIsValid}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                    editComputed?.percentIsValid
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
