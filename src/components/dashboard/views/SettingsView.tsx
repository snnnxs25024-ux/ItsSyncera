import React, { useState } from 'react';
import { Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [companyName, setCompanyName] = useState('PT Solusi Infrastruktur Utama');
  const [email, setEmail] = useState('admin@enterprise.co.id');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs">
        <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Account Management</span>
        <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Account Settings & Company Profile</h1>
        <p className="text-xs text-slate-500 font-sans mt-1">Kelola profil perusahaan, manajemen pengguna (RBAC), dan preferensi notifikasi alert sistem.</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Perubahan profil akun perusahaan berhasil disimpan!</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-5">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <Settings className="w-4 h-4 text-sky-600" />
          <span>Company Profile Information</span>
        </h2>
        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nama Perusahaan</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-sky-50/40 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Email Administrator Utama</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-sky-50/40 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nomor Telepon PIC</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-sky-50/40 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold border border-sky-400 shadow-xs"
          >
            Simpan Perubahan Profil
          </button>
        </form>
      </div>
    </div>
  );
};
