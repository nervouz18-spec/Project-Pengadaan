import React, { useState, useEffect } from 'react';
import { BookmarkCheck, X, FolderPlus, Sparkles, Receipt, Layers, PencilLine } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { CalculationHistory } from '../types';

interface SaveHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: (title: string, notes?: string) => void;
  itemCount: number;
  totalLaba: number;
  totalHargaJual: number;
  totalModal: number;
  editingHistory?: CalculationHistory | null;
}

export const SaveHistoryModal: React.FC<SaveHistoryModalProps> = ({
  isOpen,
  onClose,
  onConfirmSave,
  itemCount,
  totalLaba,
  totalHargaJual,
  totalModal,
  editingHistory,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingHistory) {
        setTitle(editingHistory.title);
        setNotes(editingHistory.notes || '');
      } else {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const formattedTime = now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setTitle(`Proyeksi Belanja - ${formattedDate} (${formattedTime})`);
        setNotes('');
      }
    }
  }, [isOpen, editingHistory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirmSave(title.trim(), notes.trim());
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
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00629b]/10 text-[#00629b] flex items-center justify-center">
              {editingHistory ? (
                <PencilLine className="w-4 h-4" />
              ) : (
                <FolderPlus className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {editingHistory ? 'Perbarui Sesi Riwayat' : 'Simpan Sesi ke Riwayat'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {editingHistory
                  ? 'Perubahan akan disimpan ke file riwayat yang sama, tidak membuat file baru'
                  : 'Beri nama proyek untuk memudahkan pencarian di kemudian hari'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Mini Box */}
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Total Item Barang:</span>
              <span className="font-bold text-slate-900">{itemCount} barang</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Total Omset (Harga Jual):</span>
              <span className="font-medium text-slate-900">Rp {formatRupiah(totalHargaJual)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Total Modal:</span>
              <span className="font-medium text-slate-900">Rp {formatRupiah(totalModal)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
              <span className="font-semibold text-emerald-900">Total Laba Bersih:</span>
              <span className="font-extrabold text-emerald-700 text-sm">Rp {formatRupiah(totalLaba)}</span>
            </div>
          </div>

          {/* Input Nama Proyek / Sesi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Proyek / Sesi Perhitungan *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengadaan Alat Lab Komputer Q3"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/10"
            />
            {editingHistory && (
              <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                <PencilLine className="w-3 h-3" />
                Mengedit riwayat "{editingHistory.title}" — data akan diperbarui pada record yang sama
              </p>
            )}
          </div>

          {/* Input Catatan Opsional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Tambahan <span className="font-normal text-slate-400">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Margin khusus tender instansi, cashback 15%..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00629b] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#00629b] hover:bg-[#005180] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingHistory ? (
                <PencilLine className="w-3.5 h-3.5" />
              ) : (
                <BookmarkCheck className="w-3.5 h-3.5" />
              )}
              <span>{editingHistory ? 'Simpan Perubahan' : 'Simpan ke Riwayat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
