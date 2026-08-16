import React, { useState, useEffect } from 'react';
import { ProjectMeta } from '../types';
import { FolderPlus, X, Sparkles, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meta: ProjectMeta) => void;
  initialData?: ProjectMeta | null;
  isEditing?: boolean;
}

const TEMPLATE_SUGGESTIONS = [
  {
    name: 'Pengadaan Perangkat IT Kantor Q3',
    desc: 'Kalkulasi belanja laptop, monitor, printer, dan server kantor dengan estimasi cashback & komisi.',
  },
  {
    name: 'Tender Alat Elektronik Sekolah',
    desc: 'Rincian pengadaan Smart TV, proyektor, dan sound system untuk ruang kelas.',
  },
  {
    name: 'Restock Produk Toko Online',
    desc: 'Proyeksi margin penjualan aksesoris gadget, charger, dan kabel data marketplace.',
  },
];

export const ProjectSetupModal: React.FC<ProjectSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
      } else {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        setName(`Proyek Perhitungan - ${formattedDate}`);
        setDescription('Perhitungan budget belanja, harga jual, pajak, dan proyeksi laba bersih.');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  const handleApplyTemplate = (tmpl: { name: string; desc: string }) => {
    setName(tmpl.name);
    setDescription(tmpl.desc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00629b]/10 text-[#00629b] flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Ubah Informasi Proyek' : 'Mulai Proyek Perhitungan Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Tentukan nama dan deskripsi singkat sebelum masuk ke kalkulator
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Input Nama Proyek */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              Nama Proyek / Perhitungan *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pengadaan Laptop & PC Dinas Q3"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/10"
            />
          </div>

          {/* Input Deskripsi Singkat */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              Deskripsi Singkat Proyek
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan tujuan atau keterangan ringkas mengenai proyek belanja ini..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00629b] resize-none"
            />
          </div>

          {/* Template Suggestions */}
          {!isEditing && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00629b]" />
                <span>Pilih Template Cepat (Opsional):</span>
              </div>
              <div className="space-y-1.5">
                {TEMPLATE_SUGGESTIONS.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-[#00629b]">
                      {tmpl.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {tmpl.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#00629b] hover:bg-[#005180] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
            >
              <span>{isEditing ? 'Simpan Perubahan' : 'Lanjut ke Kalkulator'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
