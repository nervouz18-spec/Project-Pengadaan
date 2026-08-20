import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Item, GlobalSettings, CalculationHistory, UserProfile, ProjectMeta, SavedFinancialReport } from './types';
import { initialItems, initialGlobalSettings, initialHistories } from './data/initialData';
import { computeItemMetrics, exportToCSV, formatRupiah } from './utils/formatters';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, AppTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ProjectHeaderBanner } from './components/ProjectHeaderBanner';
import { ProjectSetupModal } from './components/ProjectSetupModal';
import { CalculatorTable } from './components/CalculatorTable';
import { FinancialSummaryCard } from './components/FinancialSummaryCard';
import { GlobalSettingsCard } from './components/GlobalSettingsCard';
import { DetailTerpilihCard } from './components/DetailTerpilihCard';
import { AddRowModal } from './components/AddRowModal';
import { SaveHistoryModal } from './components/SaveHistoryModal';
import { FinancialReportView } from './components/FinancialReportView';
import { HistoryView } from './components/HistoryView';
import { PurchaseHistoryView } from './components/PurchaseHistoryView';
import { SavedReportsArchiveView } from './components/SavedReportsArchiveView';
import { Footer } from './components/Footer';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('proyeksi_laba_auth');
    return saved === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('proyeksi_laba_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.name === 'string' && typeof parsed.email === 'string') {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return {
      name: 'Admin Keuangan',
      email: 'admin@proyeksilaba.com',
      username: 'admin_keuangan',
      role: 'Administrator',
    };
  });

  // Active View State ('dashboard' | 'calculator' | 'financial-report' | 'history')
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Active Project Metadata (Nama & Deskripsi Singkat)
  const [currentProject, setCurrentProject] = useState<ProjectMeta>(() => {
    const saved = localStorage.getItem('proyeksi_laba_current_project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.name === 'string') {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return {
      name: 'Proyek Perhitungan Baru',
      description: 'Perhitungan budget belanja, harga jual, perpajakan, dan proyeksi laba.',
      createdAt: new Date().toISOString(),
    };
  });

  // Items State
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('proyeksi_laba_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const isOldDummyData = parsed.some((p: Item) => p.name === 'PC ACER VERITON X' || p.name === 'SMART TV 32 INCH');
          if (!isOldDummyData) {
            return parsed;
          }
        }
      } catch (e) {
        // fallback
      }
    }
    return initialItems;
  });

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('proyeksi_laba_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.defaultCashback === 'number') {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return initialGlobalSettings;
  });

  // Calculation History State
  const [histories, setHistories] = useState<CalculationHistory[]>(() => {
    const saved = localStorage.getItem('proyeksi_laba_histories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return initialHistories;
  });

  // Saved Financial Reports State (Arsip Laporan Bagi Hasil)
  const [savedReports, setSavedReports] = useState<SavedFinancialReport[]>(() => {
    const saved = localStorage.getItem('proyeksi_laba_saved_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Id riwayat yang sedang dimuat/diedit di kalkulator (null = sesi baru)
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);

  // Selected item for the "Detail Terpilih" sidebar card
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isEditingProjectMeta, setIsEditingProjectMeta] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Mobile sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persist current project
  useEffect(() => {
    try { localStorage.setItem('proyeksi_laba_current_project', JSON.stringify(currentProject)); } catch { /* quota exceeded */ }
  }, [currentProject]);

  // Persist items
  useEffect(() => {
    try { localStorage.setItem('proyeksi_laba_items', JSON.stringify(items)); } catch { /* quota exceeded */ }
  }, [items]);

  // Persist settings
  useEffect(() => {
    try { localStorage.setItem('proyeksi_laba_settings', JSON.stringify(globalSettings)); } catch { /* quota exceeded */ }
  }, [globalSettings]);

  // Persist histories
  useEffect(() => {
    try { localStorage.setItem('proyeksi_laba_histories', JSON.stringify(histories)); } catch { /* quota exceeded */ }
  }, [histories]);

  // Persist saved reports
  useEffect(() => {
    try { localStorage.setItem('proyeksi_laba_saved_reports', JSON.stringify(savedReports)); } catch { /* quota exceeded */ }
  }, [savedReports]);

  // Persist Auth
  useEffect(() => {
    try {
      localStorage.setItem('proyeksi_laba_auth', isAuthenticated ? 'true' : 'false');
      localStorage.setItem('proyeksi_laba_user', JSON.stringify(userProfile));
    } catch { /* quota exceeded */ }
  }, [isAuthenticated, userProfile]);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  const handleLoginSuccess = (userData?: { name: string; email: string }) => {
    if (userData) {
      setUserProfile({
        name: userData.name || 'Pengguna Proyeksi Laba',
        email: userData.email,
        username: userData.email.split('@')[0] || 'user',
        role: 'Administrator',
      });
    }
    setIsAuthenticated(true);
    showToast('Selamat datang! Berhasil masuk ke sistem.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('Berhasil keluar dari akun.');
  };

  // Launch New Project Flow (open setup modal to input name & desc)
  const handleOpenNewProjectSetup = () => {
    setIsEditingProjectMeta(false);
    setEditingHistoryId(null);
    setIsSetupModalOpen(true);
  };

  // Handle Submit from Project Setup Modal
  const handleProjectSetupSubmit = (meta: ProjectMeta) => {
    setCurrentProject(meta);
    if (!isEditingProjectMeta) {
      // Starting fresh project
      setItems([]);
      setSelectedItemId(null);
      setEditingHistoryId(null);
      showToast(`Proyek "${meta.name}" berhasil dibuat. Silakan tambahkan barang belanjaan.`);
    } else {
      showToast(`Informasi proyek "${meta.name}" berhasil diperbarui.`);
    }
    setActiveTab('calculator');
  };

  // Update a single item
  const handleUpdateItem = (updatedItem: Item) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Delete an item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
    showToast('Baris barang telah dihapus.');
  };

  // Clear all items
  const handleClearAllItems = () => {
    setItems([]);
    setSelectedItemId(null);
    showToast('Semua barang telah dihapus dari tabel.');
  };

  // Add a quick blank row
  const handleAddQuickRow = () => {
    const newItem: Item = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: '',
      buyPrice: 0,
      qty: 1,
      sellPrice: 0,
      cashbackPercent: globalSettings.defaultCashback ?? 10,
      commissionPercent: globalSettings.defaultCommission ?? 3,
      category: 'Umum',
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    showToast('Baris baru ditambahkan.');
  };

  // Add new item from modal
  const handleAddItem = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    setSelectedItemId(newItem.id);
    showToast(`Baris "${newItem.name || 'Baru'}" berhasil ditambahkan.`);
  };

  // Apply Cashback (0-20%) to all items
  const handleApplyCashbackToAll = (percent: number) => {
    const safePercent = Math.min(20, Math.max(0, percent));
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        cashbackPercent: safePercent,
      }))
    );
  };

  // Apply Commission (0-10%) to all items
  const handleApplyCommissionToAll = (commPercent: number) => {
    const safePercent = Math.min(10, Math.max(0, commPercent));
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        commissionPercent: safePercent,
      }))
    );
  };

  // Selected item reference
  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  // Unique project count for sidebar badge
  const uniqueProjectCount = useMemo(
    () => new Set(histories.map((h) => h.title)).size,
    [histories]
  );

  // Riwayat yang sedang dimuat/diedit di kalkulator
  const editingHistory = useMemo(() => {
    return histories.find((h) => h.id === editingHistoryId) || null;
  }, [histories, editingHistoryId]);

  // Overall financial calculations across all items in active calculator
  const totals = useMemo(() => {
    let totalHargaJual = 0;
    let totalHargaProdukNetto = 0;
    let totalModal = 0;
    let totalPajak = 0;
    let totalPph = 0;
    let totalCashback = 0;
    let totalKomisi = 0;
    let totalLaba = 0;

    items.forEach((item) => {
      const m = computeItemMetrics(item);
      totalHargaJual += m.totalHargaJual;
      totalHargaProdukNetto += m.totalHargaProdukNetto;
      totalModal += m.totalModal;
      totalPajak += m.totalPajak;
      totalPph += m.totalPph;
      totalCashback += m.cashbackNominal;
      totalKomisi += m.komisiNominal;
      totalLaba += m.laba;
    });

    const marginPercent = totalHargaJual > 0 ? (totalLaba / totalHargaJual) * 100 : 0;

    return {
      totalHargaJual,
      totalHargaProdukNetto,
      totalModal,
      totalPajak,
      totalPph,
      totalCashback,
      totalKomisi,
      totalLaba,
      marginPercent,
    };
  }, [items]);

  // Save current calculation session to history (update if editing existing record)
  const handleConfirmSaveToHistory = (title: string, notes?: string, selectedDate?: string) => {
    if (items.length === 0) {
      showToast('Tidak ada barang untuk disimpan ke riwayat.');
      return;
    }

    const timestamp = selectedDate || new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Update the same history record if we are editing a loaded session
    if (editingHistory) {
      const updatedHist: CalculationHistory = {
        ...editingHistory,
        title: title || editingHistory.title,
        description: currentProject.description,
        notes: notes,
        timestamp,
        totalItems: items.length,
        totalModal: totals.totalModal,
        totalHargaJual: totals.totalHargaJual,
        totalHargaProdukNetto: totals.totalHargaProdukNetto,
        totalPajak: totals.totalPajak,
        totalPph: totals.totalPph,
        totalCashback: totals.totalCashback,
        totalKomisi: totals.totalKomisi,
        totalLaba: totals.totalLaba,
        items: [...items],
        settings: { ...globalSettings },
      };

      setHistories((prev) =>
        prev.map((h) => (h.id === editingHistory.id ? updatedHist : h))
      );
      showToast(`Sesi "${updatedHist.title}" berhasil diperbarui.`);
      return;
    }

    const newHist: CalculationHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title || currentProject.name,
      description: currentProject.description,
      notes: notes,
      timestamp,
      totalItems: items.length,
      totalModal: totals.totalModal,
      totalHargaJual: totals.totalHargaJual,
      totalHargaProdukNetto: totals.totalHargaProdukNetto,
      totalPajak: totals.totalPajak,
      totalPph: totals.totalPph,
      totalCashback: totals.totalCashback,
      totalKomisi: totals.totalKomisi,
      totalLaba: totals.totalLaba,
      items: [...items],
      settings: { ...globalSettings },
    };

    setHistories((prev) => [newHist, ...prev]);
    showToast(`Sesi "${newHist.title}" berhasil disimpan ke Riwayat!`);
  };

  // Load history session back into calculation workspace
  const handleLoadHistory = (hist: CalculationHistory) => {
    setItems([...hist.items]);
    setCurrentProject({
      name: hist.title,
      description: hist.description || hist.notes || 'Sesi dimuat dari riwayat perhitungan.',
      createdAt: hist.timestamp,
    });
    if (hist.settings) {
      setGlobalSettings({ ...hist.settings });
    }
    setEditingHistoryId(hist.id);
    setActiveTab('calculator');
    showToast(`Riwayat "${hist.title}" berhasil dimuat ke Kalkulator.`);
  };

  // Delete history record
  const handleDeleteHistory = (id: string) => {
    setHistories((prev) => prev.filter((h) => h.id !== id));
    showToast('Riwayat perhitungan telah dihapus.');
  };

  // Save financial report to archive
  const handleSaveReport = (report: SavedFinancialReport) => {
    setSavedReports((prev) => [report, ...prev]);
  };

  // Delete saved report from archive
  const handleDeleteSavedReport = (id: string) => {
    setSavedReports((prev) => prev.filter((r) => r.id !== id));
    showToast('Laporan telah dihapus dari arsip.');
  };

  // Update (edit) an existing saved report in place
  const handleUpdateSavedReport = (updated: SavedFinancialReport) => {
    setSavedReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Laporan "${updated.projectName}" telah diperbarui di arsip.`);
  };

  // Load saved report back into Laporan & Bagi Hasil editor
  const [loadedReport, setLoadedReport] = useState<SavedFinancialReport | null>(null);
  const handleLoadReportToEditor = (report: SavedFinancialReport) => {
    setLoadedReport(report);
    setActiveTab('financial-report');
    showToast(`Data laporan "${report.projectName}" dimuat ke kalkulasi.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const filename = `${currentProject.name.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCSV(items, filename);
    showToast('File CSV proyek berhasil diunduh.');
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f8fb] flex flex-col font-sans antialiased text-slate-800">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 w-full relative">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            historyCount={histories.length}
            itemCount={items.length}
            savedReportsCount={savedReports.length}
            purchaseHistoryProjectCount={uniqueProjectCount}
            onNewProjectClick={handleOpenNewProjectSetup}
          />
        </div>

        {/* Mobile Left Sidebar Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                className="relative z-10 w-64 bg-white h-full shadow-2xl"
              >
                <Sidebar
                  activeTab={activeTab}
                  onSelectTab={(tab) => {
                    setActiveTab(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  historyCount={histories.length}
                  itemCount={items.length}
                  savedReportsCount={savedReports.length}
                  purchaseHistoryProjectCount={uniqueProjectCount}
                  onNewProjectClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenNewProjectSetup();
                  }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar */}
          <Header
            user={userProfile}
            onLogout={handleLogout}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Main Body Workspace */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1440px] mx-auto">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  histories={histories}
                  onStartNewProject={handleOpenNewProjectSetup}
                  onGoToCalculator={() => setActiveTab('calculator')}
                  onGoToHistory={() => setActiveTab('history')}
                  onGoToFinancialReport={() => setActiveTab('financial-report')}
                  onLoadHistoryToCalculator={handleLoadHistory}
                  activeProjectMeta={currentProject}
                  activeItemCount={items.length}
                />
              )}

              {/* TAB 2: KALKULATOR PERHITUNGAN */}
              {activeTab === 'calculator' && (
                <div>
                  {/* Active Project Header Banner */}
                  <ProjectHeaderBanner
                    projectMeta={currentProject}
                    itemCount={items.length}
                    isEditingHistory={!!editingHistory}
                    onEditMeta={() => {
                      setIsEditingProjectMeta(true);
                      setIsSetupModalOpen(true);
                    }}
                    onNewProject={handleOpenNewProjectSetup}
                    onSaveToHistory={() => {
                      if (items.length === 0) {
                        showToast('Tidak ada barang untuk disimpan ke riwayat.');
                        return;
                      }
                      setIsSaveModalOpen(true);
                    }}
                  />

                  {/* Calculator Workspace Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Left & Center: Table */}
                    <div className="xl:col-span-8 space-y-6">
                      <CalculatorTable
                        items={items}
                        selectedItemId={selectedItemId}
                        onSelectItem={(item) => setSelectedItemId(item.id)}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                        onClearAllItems={handleClearAllItems}
                        onAddQuickRow={handleAddQuickRow}
                        onOpenAddModal={() => setIsAddModalOpen(true)}
                        onExportCSV={handleExportCSV}
                      />
                    </div>

                    {/* Right Side Cards */}
                    <div className="xl:col-span-4 space-y-6">
                      {/* 1. Laporan Keuangan Card */}
                      <FinancialSummaryCard
                        totalHargaJual={totals.totalHargaJual}
                        totalModal={totals.totalModal}
                        totalPajak={totals.totalPajak}
                        totalPph={totals.totalPph}
                        totalCashback={totals.totalCashback}
                        totalKomisi={totals.totalKomisi}
                        totalLaba={totals.totalLaba}
                        marginPercent={totals.marginPercent}
                        isEditingHistory={!!editingHistory}
                        onSaveToHistory={() => {
                          if (items.length === 0) {
                            showToast('Tidak ada barang untuk disimpan ke riwayat.');
                            return;
                          }
                          setIsSaveModalOpen(true);
                        }}
                      />

                      {/* 2. Pengaturan Cepat Card */}
                      <GlobalSettingsCard
                        settings={globalSettings}
                        onUpdateSettings={setGlobalSettings}
                        onApplyCashbackToAll={handleApplyCashbackToAll}
                        onApplyCommissionToAll={handleApplyCommissionToAll}
                      />

                      {/* 3. Detail Terpilih Card */}
                      <DetailTerpilihCard
                        selectedItem={selectedItem}
                        onClose={() => setSelectedItemId(null)}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NEW LAPORAN KEUANGAN & PEMBAGIAN HASIL */}
              {activeTab === 'financial-report' && (
                <FinancialReportView
                  histories={histories}
                  activeProjectMeta={currentProject}
                  activeItems={items}
                  savedReports={savedReports}
                  onSaveReport={handleSaveReport}
                  onDeleteSavedReport={handleDeleteSavedReport}
                  onGoToCalculator={() => setActiveTab('calculator')}
                  onGoToHistory={() => setActiveTab('history')}
                  onGoToSavedReports={() => setActiveTab('saved-reports')}
                  loadedReport={loadedReport}
                />
              )}

              {/* TAB 4: RIWAYAT PERHITUNGAN */}
              {activeTab === 'history' && (
                <HistoryView
                  histories={histories}
                  onLoadHistory={handleLoadHistory}
                  onDeleteHistory={handleDeleteHistory}
                  onBackToDashboard={() => setActiveTab('dashboard')}
                />
              )}

              {/* TAB 4b: RIWAYAT BELANJA PER PROYEK */}
              {activeTab === 'purchase-history' && (
                <PurchaseHistoryView
                  histories={histories}
                  onBackToDashboard={() => setActiveTab('dashboard')}
                />
              )}

              {/* TAB 5: ARSIP LAPORAN BAGI HASIL */}
              {activeTab === 'saved-reports' && (
                <SavedReportsArchiveView
                  savedReports={savedReports}
                  histories={histories}
                  onDeleteReport={handleDeleteSavedReport}
                  onGoToNewReport={() => setActiveTab('financial-report')}
                  onLoadReportToEditor={handleLoadReportToEditor}
                  onUpdateReport={handleUpdateSavedReport}
                />
              )}
            </div>
          </main>

          {/* Bottom Footer Bar */}
          <Footer />
        </div>
      </div>

      {/* Project Setup / Edit Modal (Nama & Deskripsi Singkat) */}
      <ProjectSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSubmit={handleProjectSetupSubmit}
        initialData={currentProject}
        isEditing={isEditingProjectMeta}
      />

      {/* Add New Row Modal */}
      <AddRowModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />

      {/* Save Session to History Modal */}
      <SaveHistoryModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirmSave={handleConfirmSaveToHistory}
        itemCount={items.length}
        totalLaba={totals.totalLaba}
        totalHargaJual={totals.totalHargaJual}
        totalModal={totals.totalModal}
        editingHistory={editingHistory}
      />
    </div>
  );
}
