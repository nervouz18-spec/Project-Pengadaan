import React, { useState } from 'react';
import { Eye, EyeOff, Calculator, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (userData?: { name: string; email: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('admin@proyeksilaba.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Administrator Keuangan');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password.trim()) {
      setErrorMsg('Harap isi semua kolom.');
      return;
    }
    setErrorMsg('');
    onLoginSuccess({
      name: isRegisterMode ? fullName || 'Pengguna Baru' : 'Admin Proyeksi Laba',
      email: emailOrUsername,
    });
  };

  const handleQuickDemoLogin = () => {
    setEmailOrUsername('admin@proyeksilaba.com');
    setPassword('admin123');
    onLoginSuccess({
      name: 'Admin Proyeksi Laba',
      email: 'admin@proyeksilaba.com',
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7fb] flex flex-col items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[440px] flex flex-col items-center"
      >
        {/* App Calculator Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#00629b] text-white flex items-center justify-center shadow-md mb-6 transition-transform hover:scale-105">
          <div className="grid grid-cols-2 gap-0.5 p-1.5 w-8 h-8 rounded border border-white/40">
            <span className="text-[11px] font-bold text-center leading-none text-white flex items-center justify-center">−</span>
            <span className="text-[11px] font-bold text-center leading-none text-white flex items-center justify-center">×</span>
            <span className="text-[11px] font-bold text-center leading-none text-white flex items-center justify-center">+</span>
            <span className="text-[11px] font-bold text-center leading-none text-white flex items-center justify-center">=</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d2137] tracking-tight mb-2 text-center">
          {isRegisterMode ? 'Daftar Akun' : 'Masuk'}
        </h1>
        <p className="text-slate-500 text-sm mb-8 text-center">
          {isRegisterMode
            ? 'Buat akun untuk mengelola proyeksi laba & riwayat Anda'
            : 'Akses kalkulator dan riwayat Anda'}
        </p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
              {errorMsg}
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="register-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00629b]/20 focus:border-[#00629b] transition-all shadow-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email atau Username
            </label>
            <input
              id="login-email"
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="Masukkan email Anda"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00629b]/20 focus:border-[#00629b] transition-all shadow-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              {!isRegisterMode && (
                <button
                  type="button"
                  id="btn-lupa-password"
                  onClick={() => {
                    setShowForgotPasswordModal(true);
                    setResetSubmitted(false);
                    setResetEmail(emailOrUsername);
                  }}
                  className="text-xs font-semibold text-[#00629b] hover:text-[#004e7c] transition-colors"
                >
                  Lupa password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
                className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00629b]/20 focus:border-[#00629b] transition-all shadow-xs"
              />
              <button
                type="button"
                id="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="btn-submit-masuk"
              className="w-full py-3 px-4 bg-[#00629b] hover:bg-[#005180] active:bg-[#00456d] text-white text-sm font-semibold rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#00629b]/30 active:scale-[0.99] cursor-pointer"
            >
              {isRegisterMode ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </div>
        </form>

        {/* Switch Register/Login */}
        <div className="mt-8 text-center text-xs text-slate-600">
          {isRegisterMode ? (
            <span>
              Sudah punya akun?{' '}
              <button
                type="button"
                id="btn-toggle-to-login"
                onClick={() => setIsRegisterMode(false)}
                className="font-semibold text-[#00629b] hover:underline cursor-pointer ml-1"
              >
                Masuk sekarang
              </button>
            </span>
          ) : (
            <span>
              Belum punya akun?{' '}
              <button
                type="button"
                id="btn-toggle-to-register"
                onClick={() => setIsRegisterMode(true)}
                className="font-semibold text-[#00629b] hover:underline cursor-pointer ml-1"
              >
                Daftar sekarang
              </button>
            </span>
          )}
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 w-full flex items-center justify-center">
          <button
            type="button"
            id="btn-quick-demo"
            onClick={handleQuickDemoLogin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#00629b] font-medium transition-colors"
          >
            <span>Masuk Cepat Mode Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative border border-slate-100"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Pemulihan Kata Sandi
              </h3>
              {resetSubmitted ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-700 font-medium mb-1">
                    Tautan Pemulihan Telah Dikirim!
                  </p>
                  <p className="text-xs text-slate-500 mb-5">
                    Instruksi reset password telah dikirimkan ke <strong>{resetEmail || 'email Anda'}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 bg-[#00629b] text-white text-xs font-semibold rounded-md hover:bg-[#005180] transition-colors"
                  >
                    Kembali ke Halaman Masuk
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-500 mb-4">
                    Masukkan alamat email yang terdaftar untuk menerima petunjuk pengaturan ulang password.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Terdaftar
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="contoh@domain.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-[#00629b]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(false)}
                        className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (resetEmail) setResetSubmitted(true);
                        }}
                        className="px-4 py-2 bg-[#00629b] text-white text-xs font-semibold rounded-md hover:bg-[#005180] transition-colors"
                      >
                        Kirim Link Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
