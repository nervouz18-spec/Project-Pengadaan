import React, { useState } from 'react';
import { GlobalSettings } from '../types';
import { Percent, Check, SlidersHorizontal, ArrowRight, Sparkles } from 'lucide-react';

interface GlobalSettingsCardProps {
  settings: GlobalSettings;
  onUpdateSettings: (newSettings: GlobalSettings) => void;
  onApplyCashbackToAll: (choice: number) => void;
  onApplyCommissionToAll: (commPercent: number) => void;
}

export const GlobalSettingsCard: React.FC<GlobalSettingsCardProps> = ({
  settings,
  onUpdateSettings,
  onApplyCashbackToAll,
  onApplyCommissionToAll,
}) => {
  const [toastMsg, setToastMsg] = useState('');
  const [customCb, setCustomCb] = useState<number>(settings.defaultCashback ?? 10);
  const [customComm, setCustomComm] = useState<number>(settings.defaultCommission ?? 3);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSelectCbPreset = (val: number) => {
    setCustomCb(val);
    onApplyCashbackToAll(val);
    onUpdateSettings({ ...settings, defaultCashback: val });
    triggerToast(`Cashback ${val}% diterapkan ke semua barang!`);
  };

  const handleApplyCustomCb = () => {
    const safeVal = Math.min(20, Math.max(0, customCb));
    onApplyCashbackToAll(safeVal);
    onUpdateSettings({ ...settings, defaultCashback: safeVal });
    triggerToast(`Cashback ${safeVal}% diterapkan ke semua barang!`);
  };

  const handleSelectCommPreset = (val: number) => {
    setCustomComm(val);
    onApplyCommissionToAll(val);
    onUpdateSettings({ 
      ...settings, 
      defaultCommission: val,
    });
    triggerToast(val === 0 ? 'Komisi dinonaktifkan (0%) untuk semua barang!' : `Komisi ${val}% diterapkan ke semua barang!`);
  };

  const handleApplyCustomComm = () => {
    const safeVal = Math.min(10, Math.max(0, customComm));
    onApplyCommissionToAll(safeVal);
    onUpdateSettings({ 
      ...settings, 
      defaultCommission: safeVal,
    });
    triggerToast(`Komisi ${safeVal}% diterapkan ke semua barang!`);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#00629b]" />
          <h3 className="font-bold text-slate-900 text-base">Pengaturan Cepat</h3>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
          Terapkan Massal
        </span>
      </div>

      {toastMsg && (
        <div className="p-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-1.5 font-medium animate-in fade-in">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Pilihan Cashback Global (0% - 20%) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Cashback Massal (0% – 20%)
          </label>
          <span className="text-[11px] font-bold text-[#00629b]">
            Saat ini: {settings.defaultCashback}%
          </span>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {[0, 5, 10, 15, 20].map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => handleSelectCbPreset(percent)}
              className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                settings.defaultCashback === percent
                  ? 'bg-[#00629b] text-white border-[#00629b] shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              max="20"
              value={customCb}
              onChange={(e) => setCustomCb(Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 0)))}
              className="w-full px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00629b]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              %
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplyCustomCb}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Terapkan
          </button>
        </div>
      </div>

      {/* Pilihan Komisi Global (0% - 10%) */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Komisi Massal (0% – 10%)
          </label>
          <span className="text-[11px] font-bold text-slate-900">
            Saat ini: {settings.defaultCommission ?? 0}%
          </span>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-6 gap-1 mb-2">
          {[0, 1, 2, 3, 5, 10].map((percent) => {
            const isCurrent = settings.defaultCommission === percent;
            return (
              <button
                key={percent}
                type="button"
                onClick={() => handleSelectCommPreset(percent)}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {percent}%
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              max="10"
              value={customComm}
              onChange={(e) => setCustomComm(Math.min(10, Math.max(0, parseInt(e.target.value, 10) || 0)))}
              className="w-full px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00629b]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              %
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplyCustomComm}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};
