import React from 'react';
import { ProjectMeta } from '../types';
import { FolderGit2, Edit3, PlusCircle, BookmarkCheck, Calendar, Layers, PencilLine } from 'lucide-react';

interface ProjectHeaderBannerProps {
  projectMeta: ProjectMeta;
  itemCount: number;
  isEditingHistory?: boolean;
  onEditMeta: () => void;
  onNewProject: () => void;
  onSaveToHistory: () => void;
}

export const ProjectHeaderBanner: React.FC<ProjectHeaderBannerProps> = ({
  projectMeta,
  itemCount,
  isEditingHistory = false,
  onEditMeta,
  onNewProject,
  onSaveToHistory,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Project Meta Info */}
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#00629b]/10 text-[#00629b] flex items-center justify-center shrink-0 mt-0.5">
          <FolderGit2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
              Sesi Aktif
            </span>
            {isEditingHistory && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                <PencilLine className="w-3 h-3" />
                Mengedit Riwayat
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              {itemCount} Barang Dihitung
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
            {projectMeta.name || 'Proyek Perhitungan Tanpa Nama'}
          </h2>
          {projectMeta.description && (
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {projectMeta.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
        <button
          type="button"
          onClick={onEditMeta}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          title="Ubah nama atau deskripsi proyek ini"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
          <span>Ubah Info Proyek</span>
        </button>

        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
          title="Mulai proyek perhitungan baru dari awal"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#00629b]" />
          <span>Proyek Baru</span>
        </button>

        <button
          type="button"
          onClick={onSaveToHistory}
          disabled={itemCount === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00629b] hover:bg-[#005180] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          {isEditingHistory ? (
            <PencilLine className="w-3.5 h-3.5" />
          ) : (
            <BookmarkCheck className="w-3.5 h-3.5" />
          )}
          <span>{isEditingHistory ? 'Simpan Perubahan' : 'Simpan Sesi'}</span>
        </button>
      </div>
    </div>
  );
};
