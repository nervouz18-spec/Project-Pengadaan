import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalculationHistory, 
  Item, 
  ProjectMeta, 
  ProfitShareMember, 
  OperationalExpenseItem, 
  SavedFinancialReport 
} from '../types';
import { formatRupiah, parseNumberFromInput, computeItemMetrics } from '../utils/formatters';
import { 
  FileSpreadsheet, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  BookmarkCheck, 
  Percent, 
  Stamp, 
  Truck, 
  FolderOpen, 
  ChevronDown, 
  PieChart, 
  TrendingUp,
  Tag,
  FileCheck,
  UserCheck,
  PiggyBank,
  Landmark,
  X
} from 'lucide-react';

interface FinancialReportViewProps {
  histories: CalculationHistory[];
  activeProjectMeta: ProjectMeta;
  activeItems: Item[];
  savedReports?: SavedFinancialReport[];
  onSaveReport?: (report: SavedFinancialReport) => void;
  onDeleteSavedReport?: (id: string) => void;
  onGoToCalculator: () => void;
  onGoToHistory: () => void;
  onGoToSavedReports?: () => void;
  loadedReport?: SavedFinancialReport | null;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({
  histories,
  activeProjectMeta,
  activeItems,
  savedReports: propSavedReports,
  onSaveReport,
  onDeleteSavedReport,
  onGoToCalculator,
  onGoToHistory,
  onGoToSavedReports,
  loadedReport,
}) => {
  // Selected Source: 'active' or history ID
  const [selectedSourceId, setSelectedSourceId] = useState<string>('active');

  // Manual Uang Masuk (Omset), Cashback % & Komisi %
  const [manualUangMasukStr, setManualUangMasukStr] = useState<string>('');
  const [reportCashbackPercent, setReportCashbackPercent] = useState<number>(0);
  const [reportCommissionPercent, setReportCommissionPercent] = useState<number>(5);
  const [commissionRecipientName, setCommissionRecipientName] = useState<string>('');

  // Manual Costs
  const [biayaMateraiStr, setBiayaMateraiStr] = useState<string>('10.000');
  const [biayaOperasionalStr, setBiayaOperasionalStr] = useState<string>('50.000');
  const [reportNotes, setReportNotes] = useState<string>('');

  // Tabungan Pajak (0-10% dari Laba Kalkulator atau nominal manual)
  const [tabunganPajakPercent, setTabunganPajakPercent] = useState<number>(0);
  const [tabunganPajakManualNominalStr, setTabunganPajakManualNominalStr] = useState<string>('');
  const [tabunganPajakMode, setTabunganPajakMode] = useState<'percent' | 'manual'>('percent');

  // Operational Expenses itemized breakdown toggle
  const [useItemizedOps, setUseItemizedOps] = useState<boolean>(false);
  const [opsItems, setOpsItems] = useState<OperationalExpenseItem[]>([
    { id: 'ops-1', name: 'Transport & Bensin', amount: 30000 },
    { id: 'ops-2', name: 'Packing & Plastik', amount: 20000 },
  ]);

  // Profit Sharing Members List
  const [members, setMembers] = useState<ProfitShareMember[]>([
    { id: 'mem-1', name: 'Penanggung Jawab / Founder', role: 'Ketua Pelaksana', percentage: 60 },
    { id: 'mem-2', name: 'Partner / Marketing', role: 'Pemasaran & Negosiasi', percentage: 40 },
  ]);

  // Id anggota yang sedang memilih item modal (modal picker)
  const [capitalPickerMemberId, setCapitalPickerMemberId] = useState<string | null>(null);

  // Internal Saved Financial Reports state fallback
  const [internalSavedReports, setInternalSavedReports] = useState<SavedFinancialReport[]>(() => {
    const saved = localStorage.getItem('proyeksi_laba_saved_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const effectiveSavedReports = propSavedReports || internalSavedReports;

  // Save notification toast
  const [alertToast, setAlertToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (!propSavedReports) {
      localStorage.setItem('proyeksi_laba_saved_reports', JSON.stringify(internalSavedReports));
    }
  }, [internalSavedReports, propSavedReports]);

  // Load from external loadedReport prop if provided
  useEffect(() => {
    if (loadedReport) {
      if (loadedReport.projectId) {
        setSelectedSourceId(loadedReport.projectId);
      }
      setManualUangMasukStr(formatRupiah(loadedReport.uangMasukOmset));
      setReportCashbackPercent(loadedReport.cashbackPercent || 0);
      setReportCommissionPercent(loadedReport.commissionPercent || 5);
      setCommissionRecipientName(loadedReport.commissionRecipientName || '');
      setBiayaMateraiStr(formatRupiah(loadedReport.biayaMaterai));
      setBiayaOperasionalStr(formatRupiah(loadedReport.biayaOperasional));
      setReportNotes(loadedReport.customNotes || '');
      if (loadedReport.operationalExpensesList && loadedReport.operationalExpensesList.length > 0) {
        setOpsItems(loadedReport.operationalExpensesList);
        setUseItemizedOps(true);
      }
      if (loadedReport.tabunganPajakPercent !== undefined) {
        setTabunganPajakPercent(loadedReport.tabunganPajakPercent);
      }
      if (
        loadedReport.tabunganPajakNominal !== undefined &&
        (loadedReport.tabunganPajakPercent === 0 || !loadedReport.tabunganPajakPercent)
      ) {
        setTabunganPajakManualNominalStr(formatRupiah(loadedReport.tabunganPajakNominal));
        setTabunganPajakMode('manual');
      }
      if (loadedReport.members && loadedReport.members.length > 0) {
        setMembers(loadedReport.members);
      }
      triggerToast(`Data laporan "${loadedReport.projectName}" dimuat ke kalkulasi.`);
    }
  }, [loadedReport]);

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setAlertToast({ msg, type });
    setTimeout(() => setAlertToast(null), 3000);
  };

  // Compute metrics from active items
  const activeMetrics = useMemo(() => {
    let uangMasukOmset = 0;
    let totalModal = 0;
    let cashbackProject = 0;
    let komisiProject = 0;
    let totalPajak = 0;
    let totalPph = 0;
    let labaProject = 0;
    let commissionItemsCount = 0;

    activeItems.forEach((item) => {
      const m = computeItemMetrics(item);
      uangMasukOmset += m.totalHargaJual;
      totalModal += m.totalModal;
      cashbackProject += m.cashbackNominal;
      komisiProject += m.komisiNominal;
      totalPajak += m.totalPajak;
      totalPph += m.totalPph;
      labaProject += m.laba;
      if (m.komisiNominal > 0) commissionItemsCount++;
    });

    return {
      title: activeProjectMeta.name || 'Sesi Aktif di Kalkulator',
      description: activeProjectMeta.description || 'Proyek perhitungan yang sedang dibuka di tab kalkulator.',
      itemCount: activeItems.length,
      commissionItemsCount,
      uangMasukOmset,
      totalModal,
      cashbackProject,
      komisiProject,
      totalPajakPph: totalPajak + totalPph,
      labaProject,
    };
  }, [activeItems, activeProjectMeta]);

  // Selected project details
  const currentProjectData = useMemo(() => {
    if (selectedSourceId === 'active') {
      return {
        id: 'active',
        isSaved: false,
        name: activeMetrics.title,
        description: activeMetrics.description,
        itemCount: activeMetrics.itemCount,
        commissionItemsCount: activeMetrics.commissionItemsCount,
        uangMasukOmset: activeMetrics.uangMasukOmset,
        totalModal: activeMetrics.totalModal,
        cashbackProject: activeMetrics.cashbackProject,
        komisiProject: activeMetrics.komisiProject,
        totalPajakPph: activeMetrics.totalPajakPph,
        labaProject: activeMetrics.labaProject,
        items: activeItems,
      };
    }

    const hist = histories.find((h) => h.id === selectedSourceId);
    if (hist) {
      const commItems = hist.items ? hist.items.filter(i => (i.commissionPercent || 0) > 0 || i.useCommission).length : 0;
      return {
        id: hist.id,
        isSaved: true,
        name: hist.title,
        description: hist.description || hist.notes || `Disimpan pada ${hist.timestamp}`,
        itemCount: hist.totalItems || (hist.items ? hist.items.length : 0),
        commissionItemsCount: commItems,
        uangMasukOmset: hist.totalHargaJual || 0,
        totalModal: hist.totalModal || 0,
        cashbackProject: hist.totalCashback || 0,
        komisiProject: hist.totalKomisi || 0,
        totalPajakPph: (hist.totalPajak || 0) + (hist.totalPph || 0),
        labaProject: hist.totalLaba || 0,
        items: hist.items || [],
      };
    }

    return {
      id: 'active',
      isSaved: false,
      name: activeMetrics.title,
      description: activeMetrics.description,
      itemCount: activeMetrics.itemCount,
      commissionItemsCount: activeMetrics.commissionItemsCount,
      uangMasukOmset: activeMetrics.uangMasukOmset,
      totalModal: activeMetrics.totalModal,
      cashbackProject: activeMetrics.cashbackProject,
      komisiProject: activeMetrics.komisiProject,
      totalPajakPph: activeMetrics.totalPajakPph,
      labaProject: activeMetrics.labaProject,
      items: activeItems,
    };
  }, [selectedSourceId, activeMetrics, histories, activeItems]);

  // Synchronize manualUangMasukStr when selected source changes
  useEffect(() => {
    if (currentProjectData.uangMasukOmset > 0) {
      setManualUangMasukStr(formatRupiah(currentProjectData.uangMasukOmset));
    }
  }, [selectedSourceId, currentProjectData.id]);

  // Effective Uang Masuk (Manual input taking precedence)
  const effectiveUangMasuk = useMemo(() => {
    if (manualUangMasukStr.trim() !== '') {
      return parseNumberFromInput(manualUangMasukStr);
    }
    return currentProjectData.uangMasukOmset;
  }, [manualUangMasukStr, currentProjectData.uangMasukOmset]);

  // Cashback 0% - 20% dari Uang Masuk yang diinput manual (tidak memakai dari kalkulator)
  const safeCashbackPercent = Math.min(100, Math.max(0, reportCashbackPercent));
  const cashbackReportNominal = Math.round(effectiveUangMasuk * (safeCashbackPercent / 100));

  // Komisi 0% - 10% dari Uang Masuk yang diinput manual
  const safeCommissionPercent = Math.min(10, Math.max(0, reportCommissionPercent));
  const komisiReportNominal = Math.round(effectiveUangMasuk * (safeCommissionPercent / 100));

  // Data Modal dari Proyek
  const totalModalProject = currentProjectData.totalModal;

  // Laba Proyek = Uang Masuk Manual - Total Modal - Cashback Manual - Komisi Manual
  // (Pajak & PPh tidak dikurangkan pada laporan bagi hasil)
  const labaProject = Math.max(
    0,
    effectiveUangMasuk - totalModalProject - cashbackReportNominal - komisiReportNominal
  );

  // Manual costs computation
  const biayaMateraiNum = parseNumberFromInput(biayaMateraiStr);
  const totalItemizedOps = useMemo(() => {
    return opsItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [opsItems]);

  const biayaOperasionalNum = useItemizedOps
    ? totalItemizedOps
    : parseNumberFromInput(biayaOperasionalStr);

  // Tabungan Pajak computation (dari laba proyek atau nominal manual)
  const tabunganPajakNum = useMemo(() => {
    if (tabunganPajakMode === 'percent') {
      return Math.round((labaProject * (tabunganPajakPercent / 100)));
    }
    return parseNumberFromInput(tabunganPajakManualNominalStr);
  }, [tabunganPajakMode, tabunganPajakPercent, tabunganPajakManualNominalStr, labaProject]);

  const effectiveTabunganPajakPercent = useMemo(() => {
    if (tabunganPajakMode === 'percent') return tabunganPajakPercent;
    if (labaProject > 0) {
      return Number(((tabunganPajakNum / labaProject) * 100).toFixed(1));
    }
    return 0;
  }, [tabunganPajakMode, tabunganPajakPercent, tabunganPajakNum, labaProject]);

  // Laba Bersih Akhir = Laba Project - Biaya Materai - Biaya Operasional - Tabungan Pajak
  const labaBersihAkhir = Math.max(
    0, 
    labaProject - biayaMateraiNum - biayaOperasionalNum - tabunganPajakNum
  );

  // ===== Pembagian Modal (Kontribusi Item per Anggota) =====
  const sourceItems = currentProjectData.items;

  // Hitung modal anggota = total (harga beli × qty) dari item terpilih
  const computeMemberCapital = (member: ProfitShareMember): number => {
    const ids = member.capitalItemIds || [];
    if (ids.length === 0) return 0;
    const total = sourceItems
      .filter((item) => ids.includes(item.id))
      .reduce((sum, item) => sum + (item.buyPrice || 0) * (item.qty || 0), 0);
    // Fallback ke nilai tersimpan bila item dari proyek lama tidak ditemukan di sumber saat ini
    if (total === 0 && (member.capitalNominal || 0) > 0) {
      return member.capitalNominal || 0;
    }
    return total;
  };

  // Bagian laba anggota = Laba Bersih Akhir × persentase
  const computeMemberShare = (member: ProfitShareMember): number => {
    return labaBersihAkhir * ((member.percentage || 0) / 100);
  };

  // Total diterima = Modal + Bagian Laba
  const computeMemberTotalReceived = (member: ProfitShareMember): number => {
    return computeMemberCapital(member) + computeMemberShare(member);
  };

  const totalAllocatedCapital = useMemo(() => {
    return members.reduce((sum, m) => sum + computeMemberCapital(m), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, sourceItems]);

  const unallocatedModal = Math.max(0, currentProjectData.totalModal - totalAllocatedCapital);

  // Profit sharing calculations
  const totalPercentageAllocated = useMemo(() => {
    return members.reduce((acc, m) => acc + (m.percentage || 0), 0);
  }, [members]);

  const remainingPercentage = 100 - totalPercentageAllocated;
  const remainingNominal = labaBersihAkhir * (remainingPercentage / 100);

  // Member handlers
  const handleAddMember = () => {
    const newMem: ProfitShareMember = {
      id: `mem-${Date.now()}`,
      name: '',
      role: 'Anggota Tim',
      percentage: remainingPercentage > 0 ? remainingPercentage : 0,
      capitalItemIds: [],
    };
    setMembers((prev) => [...prev, newMem]);
  };

  const handleUpdateMember = (id: string, field: keyof ProfitShareMember, value: any) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          [field]: field === 'percentage' ? Math.max(0, parseFloat(value) || 0) : value,
        };
      })
    );
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) {
      triggerToast('Minimal harus ada 1 penerima pembagian hasil.', 'info');
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // ==== Capital (Modal) Pickers ====
  const handleToggleCapitalItem = (memberId: string, itemId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const ids = m.capitalItemIds || [];
        const has = ids.includes(itemId);
        return {
          ...m,
          capitalItemIds: has ? ids.filter((id) => id !== itemId) : [...ids, itemId],
        };
      })
    );
  };

  const handleSetAllCapitalItems = (memberId: string, selectAll: boolean) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          capitalItemIds: selectAll ? sourceItems.map((i) => i.id) : [],
        };
      })
    );
  };

  const capitalPickerMember = capitalPickerMemberId
    ? members.find((m) => m.id === capitalPickerMemberId) || null
    : null;

  const handleApplyPresetSharing = (presetType: 'equal' | '50-50' | '60-40' | '70-30' | '40-30-30') => {
    if (presetType === 'equal') {
      const share = Number((100 / members.length).toFixed(1));
      setMembers((prev) =>
        prev.map((m, idx) => ({
          ...m,
          percentage: idx === prev.length - 1 ? 100 - share * (prev.length - 1) : share,
        }))
      );
      triggerToast(`Pembagian dibagi rata (${members.length} orang)!`);
    } else if (presetType === '50-50') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: members[0]?.name || 'Penerima A', role: 'Partner 1', percentage: 50, capitalItemIds: [] },
        { id: `mem-${Date.now()}-2`, name: members[1]?.name || 'Penerima B', role: 'Partner 2', percentage: 50, capitalItemIds: [] },
      ]);
      triggerToast('Preset 50% : 50% diterapkan!');
    } else if (presetType === '60-40') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: members[0]?.name || 'Founder / PJ', role: 'Ketua Pelaksana', percentage: 60, capitalItemIds: [] },
        { id: `mem-${Date.now()}-2`, name: members[1]?.name || 'Partner / Tim', role: 'Partner', percentage: 40, capitalItemIds: [] },
      ]);
      triggerToast('Preset 60% : 40% diterapkan!');
    } else if (presetType === '70-30') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: members[0]?.name || 'Pemodal / Founder', role: 'Investor / Lead', percentage: 70, capitalItemIds: [] },
        { id: `mem-${Date.now()}-2`, name: members[1]?.name || 'Pelaksana', role: 'Operasional', percentage: 30, capitalItemIds: [] },
      ]);
      triggerToast('Preset 70% : 30% diterapkan!');
    } else if (presetType === '40-30-30') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: members[0]?.name || 'Penerima 1', role: 'Lead', percentage: 40, capitalItemIds: [] },
        { id: `mem-${Date.now()}-2`, name: members[1]?.name || 'Penerima 2', role: 'Marketing', percentage: 30, capitalItemIds: [] },
        { id: `mem-${Date.now()}-3`, name: members[2]?.name || 'Penerima 3', role: 'Operasional', percentage: 30, capitalItemIds: [] },
      ]);
      triggerToast('Preset 40% : 30% : 30% diterapkan!');
    }
  };

  // Operational items handlers
  const handleAddOpsItem = () => {
    const newItem: OperationalExpenseItem = {
      id: `ops-${Date.now()}`,
      name: '',
      amount: 0,
    };
    setOpsItems((prev) => [...prev, newItem]);
  };

  const handleUpdateOpsItem = (id: string, field: keyof OperationalExpenseItem, value: any) => {
    setOpsItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          [field]: field === 'amount' ? parseNumberFromInput(String(value)) : value,
        };
      })
    );
  };

  const handleDeleteOpsItem = (id: string) => {
    setOpsItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Save current Financial Report
  const handleSaveReport = () => {
    if (!currentProjectData.name) {
      triggerToast('Pilih proyek terlebih dahulu.', 'info');
      return;
    }

    const newReport: SavedFinancialReport = {
      id: `report-${Date.now()}`,
      projectId: currentProjectData.id,
      projectName: currentProjectData.name,
      projectDescription: currentProjectData.description,
      timestamp: new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      uangMasukOmset: effectiveUangMasuk,
      totalModal: totalModalProject,
      cashbackProject: cashbackReportNominal,
      cashbackPercent: safeCashbackPercent,
      komisiProject: komisiReportNominal,
      commissionPercent: safeCommissionPercent,
      commissionRecipientName: commissionRecipientName.trim() || undefined,
      totalPajakPph: 0,
      labaProject: labaProject,
      biayaMaterai: biayaMateraiNum,
      biayaOperasional: biayaOperasionalNum,
      operationalExpensesList: useItemizedOps ? [...opsItems] : [],
      tabunganPajakPercent: effectiveTabunganPajakPercent,
      tabunganPajakNominal: tabunganPajakNum,
      labaBersihAkhir: labaBersihAkhir,
      members: members.map((m) => ({
        ...m,
        capitalNominal: computeMemberCapital(m),
        capitalItemIds: m.capitalItemIds || [],
      })),
      customNotes: reportNotes.trim(),
    };

    if (onSaveReport) {
      onSaveReport(newReport);
    } else {
      setInternalSavedReports((prev) => [newReport, ...prev]);
    }
    triggerToast(`Laporan Keuangan & Pembagian Hasil "${currentProjectData.name}" berhasil disimpan ke arsip!`);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Export Report to CSV
  const handleExportReportCSV = () => {
    const headers = [
      'Nama Proyek',
      'Uang Masuk / Omset Manual (Rp)',
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
      'Tabungan Pajak (Rp)',
      'Laba Bersih Akhir (Rp)',
      'Nama Penerima',
      'Peran',
      'Porsi (%)',
      'Modal Kontribusi (Rp)',
      'Bagian Laba (Rp)',
      'Total Diterima (Rp)',
    ];

    const rows = members.map((m) => {
      const shareNominal = labaBersihAkhir * (m.percentage / 100);
      const capitalNominal = computeMemberCapital(m);
      const totalReceived = capitalNominal + shareNominal;
      return [
        `"${currentProjectData.name.replace(/"/g, '""')}"`,
        Math.round(effectiveUangMasuk),
        Math.round(totalModalProject),
        `${safeCashbackPercent}%`,
        Math.round(cashbackReportNominal),
        `${safeCommissionPercent}%`,
        Math.round(komisiReportNominal),
        `"${(commissionRecipientName || '-').replace(/"/g, '""')}"`,
        Math.round(labaProject),
        Math.round(biayaMateraiNum),
        Math.round(biayaOperasionalNum),
        `${effectiveTabunganPajakPercent}%`,
        Math.round(tabunganPajakNum),
        Math.round(labaBersihAkhir),
        `"${m.name.replace(/"/g, '""')}"`,
        `"${(m.role || '').replace(/"/g, '""')}"`,
        `${m.percentage}%`,
        Math.round(capitalNominal),
        Math.round(shareNominal),
        Math.round(totalReceived),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-Keuangan-BagiHasil-${currentProjectData.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {alertToast && (
        <div className="p-3 bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{alertToast.msg}</span>
          </div>
        </div>
      )}

      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-[#00629b] uppercase block">
              LAPORAN KEUANGAN & SETTLEMENT
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
              Profit Sharing & Bagi Hasil
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Laporan Keuangan & Pembagian Hasil
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hitung uang masuk, modal belanja, cashback, biaya materai & operasional, serta alokasikan persentase bagi hasil kepada anggota tim.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onGoToSavedReports && (
            <button
              type="button"
              onClick={onGoToSavedReports}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
              title="Buka Tab Arsip Laporan Bagi Hasil"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Arsip Laporan ({effectiveSavedReports.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportReportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Slip</span>
          </button>

          <button
            type="button"
            onClick={handleSaveReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Simpan Laporan</span>
          </button>
        </div>
      </div>

      {/* 1. Project Selector Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00629b]/10 text-[#00629b] flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pilih Sumber Proyek / Sesi Perhitungan
              </h3>
              <p className="text-xs text-slate-500">
                Pilih proyek aktif atau riwayat tersimpan untuk menarik otomatis modal belanja proyek
              </p>
            </div>
          </div>

          {/* Source Dropdown */}
          <div className="w-full sm:w-auto min-w-[280px]">
            <select
              id="select-sumber-proyek"
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00629b] focus:ring-1 focus:ring-[#00629b] cursor-pointer"
            >
              <option value="active">
                ⚡ Sesi Aktif di Kalkulator ({activeItems.length} barang) - {activeProjectMeta.name}
              </option>
              {histories.map((hist) => (
                <option key={hist.id} value={hist.id}>
                  📁 {hist.title} ({hist.totalItems} barang) - {hist.timestamp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Project Summary Highlight Bar */}
        <div className="p-4 bg-linear-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {currentProjectData.name}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-[#00629b] text-[10px] font-extrabold rounded-md">
                {currentProjectData.itemCount} Barang
              </span>
            </div>
            <p className="text-slate-600 text-xs line-clamp-2">
              {currentProjectData.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            {selectedSourceId === 'active' && activeItems.length === 0 ? (
              <button
                type="button"
                onClick={onGoToCalculator}
                className="px-3.5 py-1.5 bg-[#00629b] text-white text-xs font-bold rounded-lg hover:bg-[#005180] transition-colors"
              >
                + Isi Barang di Kalkulator
              </button>
            ) : (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Modal Belanja:</span>
                <span className="text-sm font-extrabold text-red-600">
                  Rp {formatRupiah(currentProjectData.totalModal)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Financial Overview Cards (Manual Omset, Proyek Modal, Cashback Manual & Komisi 0-10%) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Uang Masuk / Omset (INPUT MANUAL) */}
        <div className="bg-white rounded-2xl p-5 border-2 border-blue-200/90 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#00629b] flex items-center gap-1.5">
                <span>1. Uang Masuk (Omset)</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-[#00629b] font-extrabold rounded-md uppercase tracking-wider">
                  Manual
                </span>
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00629b] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={manualUangMasukStr}
                onChange={(e) => {
                  const num = parseNumberFromInput(e.target.value);
                  setManualUangMasukStr(num ? formatRupiah(num) : '');
                }}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-base sm:text-lg font-black text-slate-900 focus:bg-white focus:outline-none focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/20 transition-all"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Dari Proyek:</span>
            <button
              type="button"
              onClick={() => setManualUangMasukStr(formatRupiah(currentProjectData.uangMasukOmset))}
              className="font-bold text-[#00629b] hover:underline cursor-pointer flex items-center gap-0.5"
              title="Reset ke total harga jual dari kalkulator proyek"
            >
              <span>Rp {formatRupiah(currentProjectData.uangMasukOmset)}</span>
              <span className="text-[11px]">↺</span>
            </button>
          </div>
        </div>

        {/* Card 2: Total Modal Belanja (Dari Proyek) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">
                2. Total Modal Belanja
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-red-600">
              Rp {formatRupiah(totalModalProject)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Sumber:</span>
            <span className="font-semibold text-slate-700">Modal Belanja Proyek</span>
          </div>
        </div>

        {/* Card 3: Cashback (0-20% dari Uang Masuk yang diinput manual) */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <span>3. Cashback ({safeCashbackPercent}%)</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold rounded">
                  0–20%
                </span>
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>

            <div className="text-lg sm:text-xl font-extrabold text-amber-700">
              Rp {formatRupiah(cashbackReportNominal)}
            </div>
            <div className="text-[10px] text-amber-600/90 font-medium mt-0.5">
              ({safeCashbackPercent}% × Omset Rp {formatRupiah(effectiveUangMasuk)})
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
            {/* Quick % Selector */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-slate-500">Pilih %:</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 5, 10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setReportCashbackPercent(pct)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                      reportCashbackPercent === pct
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Custom % Input */}
            <div className="flex items-center gap-1.5">
              <div className="relative w-16 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={reportCashbackPercent}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setReportCashbackPercent(val);
                  }}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 text-right pr-5"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  %
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">
                Cashback dari Omset
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Komisi 0-10% dari Uang Masuk yang diinput manual */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                <span>4. Komisi ({safeCommissionPercent}%)</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold rounded">
                  0–10%
                </span>
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
            </div>

            <div className="text-lg sm:text-xl font-extrabold text-indigo-700">
              Rp {formatRupiah(komisiReportNominal)}
            </div>
            <div className="text-[10px] text-indigo-600/90 font-medium mt-0.5">
              ({safeCommissionPercent}% × Omset Rp {formatRupiah(effectiveUangMasuk)})
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
            {/* Quick % Selector 0% - 10% */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-slate-500">Pilih %:</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 5, 10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setReportCommissionPercent(pct)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                      reportCommissionPercent === pct
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Custom % & PIC Name */}
            <div className="flex items-center gap-1.5">
              <div className="relative w-16 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={reportCommissionPercent}
                  onChange={(e) => {
                    const val = Math.min(10, Math.max(0, parseFloat(e.target.value) || 0));
                    setReportCommissionPercent(val);
                  }}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 text-right pr-5"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  %
                </span>
              </div>
              <input
                type="text"
                value={commissionRecipientName}
                onChange={(e) => setCommissionRecipientName(e.target.value)}
                placeholder="Nama PIC/Sales..."
                className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Laba Bersih Akhir (Final Net Profit) */}
        <div className="bg-linear-to-br from-[#005988] to-[#00476d] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                Laba Bersih Akhir
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/15 text-emerald-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Rp {formatRupiah(labaBersihAkhir)}
            </div>
          </div>
          <div className="text-[11px] text-cyan-100 mt-3 pt-2 border-t border-white/15 flex items-center justify-between">
            <span>Siap Dibagikan:</span>
            <span className="font-bold text-emerald-300">100% Laba Bersih</span>
          </div>
        </div>
      </div>

      {/* 3. Grid: Input Biaya Manual (Kiri) & Struktur Laba Bersih (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Pengeluaran Tambahan Manual (Materai & Operasional) (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-[#00629b]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Pengeluaran Tambahan
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded">
                Input Manual
              </span>
            </div>

            {/* 1. Input Biaya Materai */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-slate-500" />
                  <span>Biaya Materai (Rp)</span>
                </label>
                <span className="text-xs font-extrabold text-slate-900">
                  Rp {formatRupiah(biayaMateraiNum)}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={biayaMateraiStr}
                  onChange={(e) => {
                    const num = parseNumberFromInput(e.target.value);
                    setBiayaMateraiStr(num ? formatRupiah(num) : '');
                  }}
                  placeholder="Misal: 10.000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00629b]"
                />
              </div>

              {/* Quick presets for materai */}
              <div className="flex gap-1.5">
                {[0, 10000, 20000, 30000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBiayaMateraiStr(formatRupiah(val))}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      biayaMateraiNum === val
                        ? 'bg-[#00629b] text-white border-[#00629b]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val === 0 ? 'Rp 0' : `Rp ${formatRupiah(val)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Input Biaya Operasional */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Biaya Operasional (Rp)</span>
                </label>
                <span className="text-xs font-extrabold text-slate-900">
                  Rp {formatRupiah(biayaOperasionalNum)}
                </span>
              </div>

              {/* Mode Toggle: Direct Input vs Itemized Breakdown */}
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Rincikan pengeluaran operasional:</span>
                <button
                  type="button"
                  onClick={() => setUseItemizedOps(!useItemizedOps)}
                  className="text-xs font-bold text-[#00629b] hover:underline cursor-pointer"
                >
                  {useItemizedOps ? 'Ganti ke Total Langsung' : '+ Rincian Item'}
                </button>
              </div>

              {useItemizedOps ? (
                /* Itemized breakdown table */
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  {opsItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateOpsItem(item.id, 'name', e.target.value)}
                        placeholder="Nama biaya (misal: Bensin)"
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00629b]"
                      />
                      <div className="w-24 sm:w-28 relative">
                        <input
                          type="text"
                          value={formatRupiah(item.amount)}
                          onChange={(e) => handleUpdateOpsItem(item.id, 'amount', e.target.value)}
                          placeholder="Rp"
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right text-slate-900 focus:outline-none focus:border-[#00629b]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteOpsItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddOpsItem}
                    className="w-full py-1.5 text-xs font-bold text-[#00629b] bg-white border border-dashed border-[#00629b]/40 rounded-lg hover:bg-blue-50/50 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Pos Operasional</span>
                  </button>
                </div>
              ) : (
                /* Direct Total Input */
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={biayaOperasionalStr}
                      onChange={(e) => {
                        const num = parseNumberFromInput(e.target.value);
                        setBiayaOperasionalStr(num ? formatRupiah(num) : '');
                      }}
                      placeholder="Misal: 50.000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00629b]"
                    />
                  </div>

                  <div className="flex gap-1.5">
                    {[0, 25000, 50000, 100000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBiayaOperasionalStr(formatRupiah(val))}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                          biayaOperasionalNum === val
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {val === 0 ? 'Rp 0' : `Rp ${formatRupiah(val)}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Input Tabungan Pajak (0-10% dari Laba Kalkulator / Manual) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tabungan Pajak (Cadangan Kas)</span>
                </label>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-700">
                    Rp {formatRupiah(tabunganPajakNum)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    ({effectiveTabunganPajakPercent}% dari Laba)
                  </span>
                </div>
              </div>

              {/* Mode Toggle: Percent vs Manual */}
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Metode penentuan:</span>
                <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTabunganPajakMode('percent')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      tabunganPajakMode === 'percent'
                        ? 'bg-white text-amber-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    % Persentase (0–10%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTabunganPajakMode('manual');
                      if (!tabunganPajakManualNominalStr && tabunganPajakNum > 0) {
                        setTabunganPajakManualNominalStr(formatRupiah(tabunganPajakNum));
                      }
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      tabunganPajakMode === 'manual'
                        ? 'bg-white text-amber-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Nominal Rp Manual
                  </button>
                </div>
              </div>

              {tabunganPajakMode === 'percent' ? (
                <div className="space-y-2">
                  {/* Percent Input with live Rp indicator */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={tabunganPajakPercent}
                        onChange={(e) => setTabunganPajakPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0"
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                    <div className="px-3 py-2 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs font-bold text-amber-900 text-right min-w-[125px]">
                      = Rp {formatRupiah(tabunganPajakNum)}
                    </div>
                  </div>

                  {/* Preset 0% - 10% buttons */}
                  <div className="flex flex-wrap gap-1">
                    {[0, 1, 2, 2.5, 5, 7.5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTabunganPajakPercent(pct)}
                        className={`flex-1 min-w-[38px] py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                          tabunganPajakPercent === pct
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    * Dihitung dari Laba Kalkulator (Rp {formatRupiah(currentProjectData.labaProject)}).
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={tabunganPajakManualNominalStr}
                      onChange={(e) => {
                        const num = parseNumberFromInput(e.target.value);
                        setTabunganPajakManualNominalStr(num ? formatRupiah(num) : '');
                      }}
                      placeholder="Misal: 100.000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Setara persentase:</span>
                    <strong className="text-amber-800 font-bold">
                      {effectiveTabunganPajakPercent}% dari Laba Kalkulator
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Notes */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tambahan Laporan (Opsional)
              </label>
              <textarea
                rows={2}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Contoh: Kesepakatan bagi hasil disetujui bersama tim pengadaan..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00629b] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Perhitungan Rinci Laba Bersih Akhir (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#00629b]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Rekapitulasi Keuangan Bersih
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Formula Real Settlement
              </span>
            </div>

            {/* Breakdown Formula List */}
            <div className="space-y-2.5 text-xs">
              {/* 1. Uang Masuk / Omset (Manual) */}
              <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                <div>
                  <span className="font-bold text-blue-950 block">
                    1. Uang Masuk (Omset Masuk)
                  </span>
                  <span className="text-[11px] text-blue-700">
                    Nilai omset / kas masuk proyek (input manual)
                  </span>
                </div>
                <span className="font-extrabold text-blue-900 text-sm">
                  Rp {formatRupiah(effectiveUangMasuk)}
                </span>
              </div>

              {/* 2. Modal Belanja (Dari Proyek) */}
              <div className="flex items-center justify-between p-2.5 bg-red-50/40 border border-red-100/60 rounded-xl">
                <div>
                  <span className="font-bold text-red-950 block">
                    2. Dikurangi: Modal Belanja Barang
                  </span>
                  <span className="text-[11px] text-red-600/80">
                    Akumulasi harga beli × qty (diambil dari proyek kalkulator)
                  </span>
                </div>
                <span className="font-extrabold text-red-700 text-sm">
                  - Rp {formatRupiah(totalModalProject)}
                </span>
              </div>

              {/* 3. Cashback (Dari Omset Manual) */}
              {cashbackReportNominal > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-amber-50/40 border border-amber-100/60 rounded-xl">
                  <div>
                    <span className="font-bold text-amber-950 block">
                      3. Dikurangi: Cashback ({safeCashbackPercent}%)
                    </span>
                    <span className="text-[11px] text-amber-700/80">
                      {safeCashbackPercent}% dari Uang Masuk (Omset)
                    </span>
                  </div>
                  <span className="font-extrabold text-amber-800 text-sm">
                    - Rp {formatRupiah(cashbackReportNominal)}
                  </span>
                </div>
              )}

              {/* 4. Komisi (0-10% dari Uang Masuk) */}
              {komisiReportNominal > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div>
                    <span className="font-bold text-indigo-950 block">
                      4. Dikurangi: Komisi Penjualan / PIC ({safeCommissionPercent}%)
                    </span>
                    <span className="text-[11px] text-indigo-700">
                      Penerima: <strong>{commissionRecipientName || 'PIC / Marketing'}</strong> ({safeCommissionPercent}% dari Uang Masuk)
                    </span>
                  </div>
                  <span className="font-extrabold text-indigo-900 text-sm">
                    - Rp {formatRupiah(komisiReportNominal)}
                  </span>
                </div>
              )}

              {/* Subtotal Laba Proyek Awal */}
              <div className="flex items-center justify-between p-2.5 bg-slate-100/90 rounded-xl font-bold">
                <span className="text-slate-800">
                  = Laba Proyek (Sebelum Biaya Operasional):
                </span>
                <span className="font-black text-slate-900 text-sm">
                  Rp {formatRupiah(labaProject)}
                </span>
              </div>

              {/* 5. Biaya Materai */}
              <div className="flex items-center justify-between p-2.5 bg-red-50/50 rounded-xl border border-red-100/60">
                <div>
                  <span className="font-bold text-red-900 block">
                    5. Dikurangi: Biaya Materai
                  </span>
                  <span className="text-[11px] text-red-600/80">
                    Pengeluaran dokumen & legalitas administrasi
                  </span>
                </div>
                <span className="font-extrabold text-red-700 text-sm">
                  - Rp {formatRupiah(biayaMateraiNum)}
                </span>
              </div>

              {/* 6. Biaya Operasional */}
              <div className="flex items-center justify-between p-2.5 bg-red-50/50 rounded-xl border border-red-100/60">
                <div>
                  <span className="font-bold text-red-900 block">
                    6. Dikurangi: Biaya Operasional
                  </span>
                  <span className="text-[11px] text-red-600/80">
                    Bensin, transport, packing, akomodasi, dll
                  </span>
                </div>
                <span className="font-extrabold text-red-700 text-sm">
                  - Rp {formatRupiah(biayaOperasionalNum)}
                </span>
              </div>

              {/* 7. Tabungan Pajak */}
              {tabunganPajakNum > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70">
                  <div>
                    <span className="font-bold text-amber-950 block">
                      7. Dikurangi: Tabungan Pajak ({effectiveTabunganPajakPercent}% dari Laba)
                    </span>
                    <span className="text-[11px] text-amber-700/90">
                      Cadangan kas pajak tahunan sebelum bagi hasil
                    </span>
                  </div>
                  <span className="font-extrabold text-amber-800 text-sm">
                    - Rp {formatRupiah(tabunganPajakNum)}
                  </span>
                </div>
              )}

              {/* 8. Total Laba Bersih Final */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mt-3">
                <div>
                  <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide block">
                    = LABA BERSIH AKHIR (SIAP DIBAGIKAN)
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Total dana bersih siap didistribusikan ke penerima
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-emerald-800">
                  Rp {formatRupiah(labaBersihAkhir)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section Pembagian Hasil (Profit Sharing Management) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        {/* Section Header with Preset Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Alokasi Pembagian Hasil Tim (Profit Sharing)
              </h2>
              <p className="text-xs text-slate-500">
                Input nama orang/anggota dan persentase (%) yang akan dihitung dari <strong>Laba Bersih Akhir (Rp {formatRupiah(labaBersihAkhir)})</strong>
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Preset Cepat:</span>
            <button
              type="button"
              onClick={() => handleApplyPresetSharing('50-50')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              50 : 50
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetSharing('60-40')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              60 : 40
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetSharing('70-30')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              70 : 30
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetSharing('40-30-30')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              40 : 30 : 30
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetSharing('equal')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900 text-white cursor-pointer"
            >
              Bagi Rata
            </button>
          </div>
        </div>

        {/* Allocation Status Indicator Bar */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Total Persentase Terdistribusi:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  totalPercentageAllocated === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : totalPercentageAllocated > 100
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {totalPercentageAllocated}% / 100%
              </span>
            </div>

            <div className="text-right">
              {totalPercentageAllocated === 100 ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sempurna! 100% Laba Bersih Telah Terbagi</span>
                </span>
              ) : totalPercentageAllocated > 100 ? (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Kelebihan {totalPercentageAllocated - 100}%! Harap sesuaikan</span>
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  Sisa {remainingPercentage}% (Rp {formatRupiah(remainingNominal)}) belum dialokasikan
                </span>
              )}
            </div>
          </div>

          {/* Graphical Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
            {members.map((m, idx) => {
              const colors = [
                'bg-[#00629b]',
                'bg-emerald-600',
                'bg-amber-500',
                'bg-purple-600',
                'bg-rose-500',
                'bg-cyan-600',
              ];
              const color = colors[idx % colors.length];
              return (
                <div
                  key={m.id}
                  style={{ width: `${Math.min(100, m.percentage)}%` }}
                  className={`${color} h-full transition-all duration-300`}
                  title={`${m.name || 'Orang'}: ${m.percentage}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Capital Allocation Status Bar */}
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-[#00629b]" />
              Modal Kontribusi Teralokasi:
            </span>
            <span className={unallocatedModal === 0 ? 'text-emerald-700' : 'text-amber-700'}>
              Rp {formatRupiah(totalAllocatedCapital)} / Rp {formatRupiah(currentProjectData.totalModal)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00629b] h-full transition-all duration-300"
              style={{ width: `${currentProjectData.totalModal > 0 ? Math.min(100, (totalAllocatedCapital / currentProjectData.totalModal) * 100) : 0}%` }}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600">
            <span>Item yang dikontribusikan anggota sebagai modal (harga beli × qty)</span>
            {unallocatedModal > 0 ? (
              <span className="font-bold text-amber-700">
                Modal Belum Teralokasi: Rp {formatRupiah(unallocatedModal)}
              </span>
            ) : (
              <span className="font-bold text-emerald-700">Seluruh modal proyek telah teralokasi</span>
            )}
          </div>
        </div>

        {/* Member Input Rows Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                <th className="py-3 px-3 min-w-[180px]">Nama Penerima / Orang *</th>
                <th className="py-3 px-3 min-w-[150px]">Peran / Keterangan</th>
                <th className="py-3 px-3 text-center min-w-[100px]">Persenan (%) *</th>
                <th className="py-3 px-3 text-right min-w-[180px]">Modal Kontribusi (Rp)</th>
                <th className="py-3 px-3 text-right min-w-[140px] font-extrabold text-emerald-900 bg-emerald-50/50">
                  Bagian Laba (Rp)
                </th>
                <th className="py-3 px-3 text-right min-w-[160px] font-extrabold text-blue-900 bg-blue-50/50">
                  Total Diterima (Rp)
                </th>
                <th className="py-3 px-2 text-center min-w-[50px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {members.map((member, index) => {
                const memberCapital = computeMemberCapital(member);
                const memberShare = computeMemberShare(member);
                const memberTotal = computeMemberTotalReceived(member);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Nama Orang */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                        placeholder={`Contoh: Penerima #${index + 1}`}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00629b]"
                      />
                    </td>

                    {/* Peran / Jabatan */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={member.role || ''}
                        onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                        placeholder="Misal: Marketing / Founder"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00629b]"
                      />
                    </td>

                    {/* Persenan (%) */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 border border-slate-300 rounded-xl">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={member.percentage}
                          onChange={(e) => handleUpdateMember(member.id, 'percentage', e.target.value)}
                          className="w-14 text-center font-extrabold text-xs text-slate-900 bg-transparent focus:outline-none"
                        />
                        <span className="font-bold text-slate-400 text-xs">%</span>
                      </div>
                    </td>

                    {/* Modal Kontribusi (Rp) */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-extrabold text-slate-800">
                        Rp {formatRupiah(memberCapital)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCapitalPickerMemberId(member.id)}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#00629b] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Pilih barang proyek sebagai modal kontribusi anggota ini"
                      >
                        <FolderOpen className="w-3 h-3" />
                        {member.capitalItemIds && member.capitalItemIds.length > 0
                          ? `Ubah Modal (${member.capitalItemIds.length} item)`
                          : 'Pilih Modal'}
                      </button>
                    </td>

                    {/* Bagian Laba (Rp) */}
                    <td className="py-3 px-3 text-right font-extrabold text-sm text-emerald-800 bg-emerald-50/40 whitespace-nowrap">
                      Rp {formatRupiah(memberShare)}
                    </td>

                    {/* Total Diterima (Rp) */}
                    <td className="py-3 px-3 text-right font-extrabold text-sm text-blue-900 bg-blue-50/40 whitespace-nowrap">
                      Rp {formatRupiah(memberTotal)}
                    </td>

                    {/* Delete button */}
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus orang ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Member Button */}
        <div className="flex items-center justify-between pt-2 gap-4">
          <button
            type="button"
            onClick={handleAddMember}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Orang / Penerima</span>
          </button>

          <div className="text-right text-xs font-semibold text-slate-600">
            <div>
              Bagian Laba Dibagikan:{' '}
              <strong className="text-emerald-800 font-extrabold">
                Rp {formatRupiah(labaBersihAkhir * (totalPercentageAllocated / 100))}
              </strong>
            </div>
            <div className="mt-0.5">
              Total Keseluruhan (Modal + Laba):{' '}
              <strong className="text-blue-800 font-extrabold">
                Rp {formatRupiah(totalAllocatedCapital + labaBersihAkhir * (totalPercentageAllocated / 100))}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. MODAL PEMILIH ITEM MODAL PER ANGGOTA */}
      {capitalPickerMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00629b]/10 text-[#00629b] flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Pilih Modal Kontribusi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Untuk <strong className="text-slate-800">{capitalPickerMember.name || 'Penerima'}</strong> — centang barang proyek yang dikontribusikan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCapitalPickerMemberId(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Item List */}
            <div className="overflow-y-auto flex-1 p-5 space-y-2">
              {sourceItems.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">
                    Tidak ada barang di proyek terpilih. Tambahkan barang di kalkulator atau pilih sumber proyek yang memiliki item.
                  </p>
                  <button
                    type="button"
                    onClick={onGoToCalculator}
                    className="px-4 py-2 bg-[#00629b] text-white text-xs font-bold rounded-xl hover:bg-[#005180] transition-colors cursor-pointer"
                  >
                    + Isi Barang di Kalkulator
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {sourceItems.length} Barang dari {currentProjectData.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetAllCapitalItems(capitalPickerMember.id, true)}
                        className="text-[11px] font-bold text-[#00629b] hover:underline cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => handleSetAllCapitalItems(capitalPickerMember.id, false)}
                        className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  {sourceItems.map((item) => {
                    const isChecked = (capitalPickerMember.capitalItemIds || []).includes(item.id);
                    const subtotal = (item.buyPrice || 0) * (item.qty || 1);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50/70 border-[#00629b]/50'
                            : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCapitalItem(capitalPickerMember.id, item.id)}
                            className="w-4 h-4 accent-[#00629b] cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {item.name || 'Barang tanpa nama'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.qty || 1} × Rp {formatRupiah(item.buyPrice)} (Harga Beli)
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                          Rp {formatRupiah(subtotal)}
                        </div>
                      </label>
                    );
                  })}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs">
                <span className="text-slate-500">Total Modal Kontribusi:</span>{' '}
                <strong className="text-[#00629b] font-extrabold">
                  Rp {formatRupiah(computeMemberCapital(capitalPickerMember))}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCapitalPickerMemberId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => setCapitalPickerMemberId(null)}
                  className="px-5 py-2 bg-[#00629b] hover:bg-[#005180] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Simpan Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
