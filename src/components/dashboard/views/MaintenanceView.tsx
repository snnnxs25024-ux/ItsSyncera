import React from 'react';
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { MaintenanceItem } from '../../../types/dashboard';

interface MaintenanceViewProps {
  maintenances: MaintenanceItem[];
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ maintenances }) => {
  const upcoming = maintenances.filter(m => m.status === 'Scheduled' || m.status === 'In Progress');
  const history = maintenances.filter(m => m.status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs">
        <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Engineering Transparency</span>
        <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Maintenance Schedule & History</h1>
        <p className="text-xs text-slate-500 font-sans mt-1">Jadwal perawatan infrastruktur server terjadwal dan laporan pengerjaan oleh tim SRE It's Syncera.</p>
      </div>

      {/* Upcoming Maintenance */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Upcoming Maintenance</h2>
        {upcoming.map((m) => (
          <div key={m.id} className="bg-sky-50/50 border border-sky-300 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-mono text-sm font-bold text-slate-900 uppercase">{m.title}</h3>
              <span className="px-2.5 py-1 bg-sky-500 text-white text-[10px] uppercase font-mono font-bold">
                {m.status}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">Scheduled Date:</span>
                <span className="font-bold text-slate-900">{m.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Target Server:</span>
                <span className="font-bold text-slate-900">{m.targetServer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance History */}
      <div className="space-y-4 pt-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Maintenance History</h2>
        <div className="space-y-3">
          {history.map((m) => (
            <div key={m.id} className="bg-white border border-sky-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-mono text-sm font-bold text-slate-900 uppercase">{m.title}</h3>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-mono font-bold">
                  {m.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Date Executed:</span>
                  <span className="font-bold text-slate-900">{m.scheduledDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Target Server:</span>
                  <span className="font-bold text-slate-900">{m.targetServer}</span>
                </div>
              </div>
              <div className="p-3 bg-sky-50/40 border border-sky-100 text-xs font-mono space-y-1">
                <p className="font-bold text-slate-900">Engineer Action: <span className="font-normal font-sans text-slate-700">{m.engineerAction}</span></p>
                <p className="font-bold text-emerald-700">Result: <span className="font-normal font-sans text-slate-700">{m.result}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
