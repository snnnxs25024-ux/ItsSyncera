import React from 'react';
import { HardDrive, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { BackupItem } from '../../../types/dashboard';

interface BackupViewProps {
  backups: BackupItem[];
}

export const BackupView: React.FC<BackupViewProps> = ({ backups }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Disaster Recovery</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Backup Overview & Snapshot History</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Penyimpanan snapshot otomatis, enkripsi AES-256, dan pemulihan instan kapan pun diperlukan.</p>
        </div>
        <button
          onClick={() => alert('Snapshot manual baru berhasil diinisiasi untuk seluruh server.')}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold border border-sky-400 shadow-xs"
        >
          Take Snapshot Now
        </button>
      </div>

      {/* Backup Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Last Backup</span>
          <span className="text-lg font-mono font-bold text-slate-900">Hari ini, 02:00 WIB</span>
          <p className="text-[11px] text-emerald-600 font-mono mt-1">100% Success Verified</p>
        </div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Backup Frequency</span>
          <span className="text-lg font-mono font-bold text-slate-900">Daily Incremental</span>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Retention: 30 hari</p>
        </div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Storage Usage</span>
          <span className="text-lg font-mono font-bold text-slate-900">639.0 GB</span>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Dari kuota 2.0 TB S3 Enterprise</p>
        </div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Encryption</span>
          <span className="text-lg font-mono font-bold text-emerald-600">AES-256</span>
          <p className="text-[11px] text-slate-500 font-sans mt-1">KMS Key Managed</p>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Backup & Snapshot History</h2>
        <div className="overflow-x-auto border border-sky-100">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase">
              <tr>
                <th className="p-3">Backup ID</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Server Target</th>
                <th className="p-3">Snapshot Size</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {backups.map((bk) => (
                <tr key={bk.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{bk.id}</td>
                  <td className="p-3 text-slate-600">{bk.date}</td>
                  <td className="p-3 text-slate-900 font-bold">{bk.server}</td>
                  <td className="p-3 text-slate-700">{bk.size}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {bk.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => alert(`Mengunduh tautan restore snapshot ${bk.id}...`)}
                      className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white font-mono uppercase text-[10px] border border-sky-400 flex items-center space-x-1 ml-auto"
                    >
                      <Download className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
