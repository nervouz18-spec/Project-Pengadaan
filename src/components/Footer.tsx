import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-14 bg-[#f4f7fb] border-t border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
      {/* Left indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-slate-700">Sistem Aktif</span>
      </div>

      {/* Right copyright */}
      <div className="text-slate-500 text-[11px] sm:text-xs">
        © 2026 Proyeksi Laba. Semua Hak Dilindungi.
      </div>
    </footer>
  );
};
