import React from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs">
        <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Billing & Licensing</span>
        <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Subscription & Enterprise Plans</h1>
        <p className="text-xs text-slate-500 font-sans mt-1">Kelola paket langganan server fleet, riwayat tagihan, dan upgrade kapasitas infrastruktur.</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-sky-500 text-white p-6 shadow-xs border border-sky-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest bg-sky-600 px-2 py-0.5 text-white font-semibold inline-block mb-2">
            Current Active Plan
          </span>
          <h2 className="text-xl font-mono font-bold uppercase tracking-wider">PRO ENTERPRISE FLEET</h2>
          <p className="text-xs text-sky-100 font-sans mt-1">Rp800.000 / bulan — Diperbaharui otomatis pada 1 September 2026</p>
        </div>
        <button
          onClick={() => alert('Pilih paket upgrade (ULTIMATE) melalui modal konfirmasi billing.')}
          className="px-5 py-2.5 bg-white text-sky-900 font-mono text-xs uppercase font-bold hover:bg-sky-50 transition-colors shadow-xs"
        >
          Upgrade Package
        </button>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Starter Plan</span>
          <h3 className="font-mono text-lg font-bold text-slate-900 uppercase">BASIC</h3>
          <div className="font-mono text-xl font-bold text-sky-600">Rp350.000 <span className="text-xs text-slate-500 font-normal">/ bulan</span></div>
          <ul className="space-y-2 text-xs font-mono text-slate-600 border-t border-sky-100 pt-4">
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Hingga 5 Server</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Monitoring 60s</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Standard SRE Support</span></li>
          </ul>
          <button onClick={() => alert('Paket BASIC dipilih.')} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs uppercase font-bold">
            Pilih Basic
          </button>
        </div>

        <div className="bg-sky-50 border-2 border-sky-500 p-6 shadow-md space-y-4 relative">
          <span className="absolute -top-3 right-4 bg-sky-500 text-white text-[9px] font-mono uppercase px-2.5 py-0.5 font-bold">Active Plan</span>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold">Most Popular</span>
          <h3 className="font-mono text-lg font-bold text-slate-900 uppercase">PRO</h3>
          <div className="font-mono text-xl font-bold text-sky-600">Rp800.000 <span className="text-xs text-slate-500 font-normal">/ bulan</span></div>
          <ul className="space-y-2 text-xs font-mono text-slate-600 border-t border-sky-200 pt-4">
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Hingga 20 Server</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Real-time Monitoring (10s)</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Priority SRE 24/7 Support</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Automated Daily Backups</span></li>
          </ul>
          <button disabled className="w-full py-2.5 bg-sky-500 text-white font-mono text-xs uppercase font-bold cursor-default">
            Current Plan
          </button>
        </div>

        <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Maximum Scale</span>
          <h3 className="font-mono text-lg font-bold text-slate-900 uppercase">ULTIMATE</h3>
          <div className="font-mono text-xl font-bold text-sky-600">Rp1.500.000 <span className="text-xs text-slate-500 font-normal">/ bulan</span></div>
          <ul className="space-y-2 text-xs font-mono text-slate-600 border-t border-sky-100 pt-4">
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Unlimited Server Fleet</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Dedicated SRE Engineer</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Custom SLA & Compliance</span></li>
          </ul>
          <button onClick={() => alert('Permintaan upgrade ke Ultimate diterima. Tim billing akan menghubungi Anda.')} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs uppercase font-bold">
            Upgrade Ultimate
          </button>
        </div>
      </div>
    </div>
  );
};
