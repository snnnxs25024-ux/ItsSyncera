import React from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Executive Summary</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Monthly Infrastructure Reports</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Laporan komprehensif bulanan mencakup uptime SLA, ringkasan maintenance, status backup, dan performa cluster.</p>
        </div>
        <button
          onClick={() => alert('Mengunduh laporan PDF resmi It\'s Syncera (Agustus 2026)...')}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold border border-sky-400 shadow-xs flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Monthly Report Cards */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-sky-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-slate-900 uppercase">Periode Laporan: Agustus 2026</h2>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold">Status: Verified & Signed by Lead SRE</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 font-mono text-xs font-bold uppercase">
            Official Audit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-sky-50/40 border border-sky-100 space-y-1">
            <span className="text-[10px] text-slate-500 block">Server Uptime SLA</span>
            <span className="text-xl font-bold text-slate-900">99.98%</span>
            <p className="text-[11px] text-slate-600 font-sans">0 insiden severity tinggi yang melanggar SLA.</p>
          </div>

          <div className="p-4 bg-sky-50/40 border border-sky-100 space-y-1">
            <span className="text-[10px] text-slate-500 block">Maintenance Completed</span>
            <span className="text-xl font-bold text-slate-900">3 Sesi</span>
            <p className="text-[11px] text-slate-600 font-sans">Zero downtime maintenance berhasil dijalankan.</p>
          </div>

          <div className="p-4 bg-sky-50/40 border border-sky-100 space-y-1">
            <span className="text-[10px] text-slate-500 block">Backup Success Rate</span>
            <span className="text-xl font-bold text-emerald-600">100%</span>
            <p className="text-[11px] text-slate-600 font-sans">31 snapshot harian tersimpan aman di S3.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
