import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, Server, Wrench } from 'lucide-react';
import { MaintenanceItem } from '../../../types/dashboard';

interface MaintenanceViewProps {
  maintenances: MaintenanceItem[];
}

type MaintenanceFilter = 'all' | 'Scheduled' | 'In Progress' | 'Completed';

const statusClass = (status: MaintenanceItem['status']) =>
  status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  status === 'In Progress' ? 'bg-sky-50 text-sky-700 border-sky-200' :
  'bg-amber-50 text-amber-700 border-amber-200';

const impactOf = (maintenance: MaintenanceItem) => {
  if (maintenance.status === 'Completed') return maintenance.result || 'Maintenance selesai. Tidak ada result detail tercatat.';
  if (/kernel|firewall|database|storage|network/i.test(maintenance.title)) return 'Potensi perubahan performa/akses selama maintenance window. Client perlu info jadwal.';
  return 'Dampak rendah. Tetap pantau service utama selama pengerjaan.';
};

const actionOf = (maintenance: MaintenanceItem) => {
  if (maintenance.status === 'Completed') return maintenance.engineerAction || 'Engineer action belum tercatat.';
  if (maintenance.status === 'In Progress') return 'Pantau progress, service health, dan rollback point.';
  return 'Siapkan approval, jadwal eksekusi, PIC, dan rencana rollback.';
};

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ maintenances }) => {
  const [filter, setFilter] = useState<MaintenanceFilter>('all');
  const filtered = maintenances.filter((item) => filter === 'all' || item.status === filter);
  const scheduled = maintenances.filter((item) => item.status === 'Scheduled').length;
  const progress = maintenances.filter((item) => item.status === 'In Progress').length;
  const completed = maintenances.filter((item) => item.status === 'Completed').length;
  const nextMaintenance = maintenances.find((item) => item.status !== 'Completed');
  const filters: MaintenanceFilter[] = ['all', 'Scheduled', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Engineering Transparency</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Maintenance Planner</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Jadwal pekerjaan teknis, target server, dampak client, action engineer, dan hasil maintenance.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={`px-3 py-2 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                filter === item ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs' : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Scheduled', scheduled, 'text-amber-600', Clock],
          ['In Progress', progress, 'text-sky-600', Wrench],
          ['Completed', completed, 'text-emerald-600', CheckCircle2],
          ['Total Plans', maintenances.length, 'text-slate-900', ShieldCheck],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof Clock, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{Number(value)}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Next Maintenance Window</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Real schedule data</span>
        </div>
        {nextMaintenance ? (
          <div className="border border-amber-200 bg-amber-50/40 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <span className={`inline-flex px-2 py-0.5 mb-2 text-[10px] uppercase font-mono font-bold border ${statusClass(nextMaintenance.status)}`}>{nextMaintenance.status}</span>
              <h3 className="font-mono text-sm font-bold text-slate-900 uppercase">{nextMaintenance.title}</h3>
              <p className="text-xs text-slate-600 font-sans mt-2">{impactOf(nextMaintenance)}</p>
            </div>
            <div className="bg-white border border-amber-100 p-4 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Server className="w-3 h-3" /> Target</span>
              <b className="block text-slate-900 mt-1">{nextMaintenance.targetServer}</b>
              <span className="block text-[10px] text-slate-500 uppercase mt-3">Window</span>
              <b className="block text-slate-900 mt-1">{nextMaintenance.scheduledDate}</b>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Tidak ada maintenance aktif</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Jadwal baru akan muncul dari table maintenances.</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-600" />
            <span>Maintenance Queue</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Showing {filtered.length} / {maintenances.length}</span>
        </div>

        {filtered.length ? (
          <div className="space-y-4">
            {filtered.map((item) => (
              <article key={item.id} className="border border-sky-100 bg-sky-50/20 p-5 shadow-2xs space-y-4 hover:border-sky-300 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-sky-100 pb-4">
                  <div className="min-w-0">
                    <span className={`inline-flex px-2 py-0.5 mb-2 text-[10px] uppercase font-mono font-bold border ${statusClass(item.status)}`}>{item.status}</span>
                    <h3 className="font-mono text-sm font-bold text-slate-900 uppercase leading-snug">{item.title}</h3>
                  </div>
                  <div className="bg-white border border-sky-100 p-3 font-mono text-xs min-w-60">
                    <span className="text-[10px] text-slate-500 uppercase">Maintenance Window</span>
                    <b className="block text-slate-900 mt-1">{item.scheduledDate}</b>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Target Server</span>
                    <p className="text-slate-900 font-mono font-bold mt-2">{item.targetServer}</p>
                  </div>
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Engineer Action</span>
                    <p className="text-slate-700 font-sans mt-2 leading-relaxed">{actionOf(item)}</p>
                  </div>
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Client Impact / Result</span>
                    <p className="text-slate-700 font-sans mt-2 leading-relaxed">{impactOf(item)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Tidak ada maintenance pada filter ini</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Data akan tampil setelah table maintenances terisi.</p>
          </div>
        )}
      </div>
    </div>
  );
};
