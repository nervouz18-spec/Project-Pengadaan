import React, { useState } from 'react';
import { LogOut, User, Menu, X, ShieldCheck, Mail, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenMobileMenu,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-sm md:text-base font-semibold text-slate-700">
          Pusat Navigasi Keuangan
        </h2>
      </div>

      {/* Right controls: KELUAR and Profile Avatar */}
      <div className="flex items-center gap-4 md:gap-6">
        <button
          type="button"
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>KELUAR</span>
        </button>

        <button
          type="button"
          id="btn-user-avatar"
          onClick={() => setShowProfileModal(true)}
          className="w-8 h-8 rounded-full bg-[#00629b] text-white flex items-center justify-center hover:ring-2 hover:ring-[#00629b]/30 transition-all cursor-pointer shadow-xs"
          title={`Profil: ${user.name}`}
        >
          <User className="w-4 h-4" />
        </button>
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#00629b] text-white flex items-center justify-center font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email Akun:</span>
                <span className="font-medium text-slate-800">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="font-medium text-slate-800">{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Sesi:</span>
                <span className="font-medium text-emerald-600">Aktif & Terautentikasi</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  onLogout();
                }}
                className="flex-1 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
              >
                Keluar Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
