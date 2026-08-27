import React from 'react';
import { HardDrive, CheckCircle2, ShieldCheck, Lock, AlertTriangle, Archive, Database, RefreshCw } from 'lucide-react';
import { BackupItem } from '../../../types/dashboard';

interface BackupViewProps {
  backups: BackupItem[];
}

const statusClass = (status: BackupItem['status']) =>
  status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  status === 'Verifying' ? 'bg-sky-50 text-sky-700 border-sky-200' :
  'bg-rose-50 text-rose-700 border-rose-200';

const parseSizeGb = (size: string) => {
  const value = Number(String(size).replace(',', '.').match(/[0-9.]+/)?.[0] ?? 0);
  if (/TB/i.test(size)) return value * 1024;
  if (/MB/i.test(size)) return value / 1024;
  return value;
};

const formatGb = (value: number) => value >= 1024 ? `${(value / 1024).toFixed(1)} TB` : `${Math.round(value * 10) / 10} GB`;

export const BackupView: React.FC<BackupViewProps> = ({ backups }) => {
  const success = backups.filter((item) => item.status === 'Success').length;
  const failed = backups.filter((item) => item.status === 'Failed').length;
  const verifying = backups.filter((item) => item.status === 'Verifying').length;
  const totalSize = backups.reduce((acc, item) => acc + parseSizeGb(item.size), 0);
  const successRate = backups.length ? Math.round((success / backups.length) * 100) : 0;
  const lastBackup = backups[0];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Disaster Recovery</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Backup Health</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Status backup real, ukuran snapshot, restore readiness, dan keamanan aksi restore.</p>
        </div>
        <div className="px-4 py-2.5 bg-sky-50 text-sky-700 font-mono text-xs uppercase font-bold border border-sky-200 shadow-xs flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Restore Locked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Success Rate', `${successRate}%`, 'text-emerald-600', ShieldCheck],
          ['Successful', success, 'text-emerald-600', CheckCircle2],
          ['Failed', failed, 'text-rose-600', AlertTriangle],
          ['Total Size', formatGb(totalSize), 'text-slate-900', Database],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof Database, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{String(value)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-sky-200 p-5 shadow-xs space-y-2">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Last Backup</span>
          <p className="text-sm font-mono font-bold text-slate-900">{lastBackup?.date || 'Belum ada backup'}</p>
          <p className="text-xs text-slate-500 font-sans">{lastBackup ? `${lastBackup.server} • ${lastBackup.status}` : 'Data backup akan muncul dari table backups.'}</p>
        </div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs space-y-2">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Retention Policy</span>
          <p className="text-sm font-mono font-bold text-slate-900">Belum dikonfigurasi</p>
          <p className="text-xs text-slate-500 font-sans">Tambahkan kolom policy jika ingin retention per client.</p>
        </div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs space-y-2">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Restore Readiness</span>
          <p className={`text-sm font-mono font-bold ${failed ? 'text-rose-600' : backups.length ? 'text-emerald-600' : 'text-slate-900'}`}>{failed ? 'Needs Review' : backups.length ? 'Ready to Verify' : 'No Data'}</p>
          <p className="text-xs text-slate-500 font-sans">Restore tetap dikunci sampai approval flow tersedia.</p>
        </div>
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Archive className="w-4 h-4 text-sky-600" />
            <span>Backup Snapshot History</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase">{backups.length} real records</span>
        </div>

        {backups.length ? (
          <div className="overflow-x-auto border border-sky-100">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase">
                <tr><th className="p-3">Backup ID</th><th className="p-3">Date</th><th className="p-3">Server</th><th className="p-3">Size</th><th className="p-3">Status</th><th className="p-3">Safe Action</th></tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{backup.id}</td>
                    <td className="p-3 text-slate-600">{backup.date}</td>
                    <td className="p-3 text-slate-900 font-bold">{backup.server}</td>
                    <td className="p-3 text-slate-700">{backup.size}</td>
                    <td className="p-3"><span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold border ${statusClass(backup.status)}`}>{backup.status}</span></td>
                    <td className="p-3">
                      <button type="button" disabled className="px-2.5 py-1 bg-slate-100 text-slate-500 font-mono uppercase text-[10px] border border-slate-200 flex items-center space-x-1 cursor-not-allowed">
                        {backup.status === 'Verifying' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                        <span>{backup.status === 'Verifying' ? 'Verifying' : 'Restore Locked'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <HardDrive className="w-8 h-8 text-sky-600 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Belum ada backup record</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Data akan tampil setelah table backups berisi snapshot real.</p>
          </div>
        )}
      </div>
    </div>
  );
};
