import React, { useState } from 'react';
import { CheckCircle2, Play, RefreshCw, PauseCircle, Clock, ShieldAlert, Activity, ListChecks, History, Lock } from 'lucide-react';
import { AutomationItem } from '../../../types/dashboard';

interface AutomationViewProps {
  automations: AutomationItem[];
}

type AutomationFilter = 'all' | 'active' | 'paused' | 'running';

const statusClass = (status: AutomationItem['status']) =>
  status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  status === 'running' ? 'bg-sky-50 text-sky-700 border-sky-200' :
  'bg-slate-50 text-slate-700 border-slate-200';

const typeLabel = (type: AutomationItem['type']) => ({
  backup: 'Backup',
  restart: 'Self-Healing Restart',
  cleanup: 'Cleanup',
  health_check: 'Health Check',
  monitoring: 'Monitoring',
}[type]);

const ruleOf = (type: AutomationItem['type']) => ({
  backup: 'Berjalan sesuai jadwal backup. Membaca konfigurasi backup real dari sistem.',
  restart: 'Trigger saat service down/degraded. Aksi restart perlu approval jika policy belum aktif.',
  cleanup: 'Trigger saat disk/log/cache melewati ambang batas yang dikonfigurasi.',
  health_check: 'Probe berkala untuk website, service, SSL, dan connector heartbeat.',
  monitoring: 'Mengumpulkan metrik real lalu menyimpan snapshot untuk dashboard.',
}[type]);

const safetyOf = (type: AutomationItem['type']) =>
  type === 'restart' || type === 'cleanup'
    ? 'Butuh approval/manual policy sebelum aksi berisiko dijalankan.'
    : 'Aksi aman/read-only atau berjalan sesuai jadwal terkontrol.';

const matchesFilter = (automation: AutomationItem, filter: AutomationFilter) => filter === 'all' || automation.status === filter;

export const AutomationView: React.FC<AutomationViewProps> = ({ automations }) => {
  const [selectedFilter, setSelectedFilter] = useState<AutomationFilter>('all');
  const filteredAutomations = automations.filter((automation) => matchesFilter(automation, selectedFilter));
  const activeCount = automations.filter((automation) => automation.status === 'active').length;
  const pausedCount = automations.filter((automation) => automation.status === 'paused').length;
  const runningCount = automations.filter((automation) => automation.status === 'running').length;
  const totalRuns = automations.reduce((acc, automation) => acc + Number(automation.historyCount || 0), 0);
  const filters: { id: AutomationFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'running', label: 'Running' },
    { id: 'paused', label: 'Paused' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Infrastructure Ops</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Automation Control</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Pusat automation, jadwal, trigger rule, riwayat run, dan safety approval.</p>
        </div>
        <button
          type="button"
          disabled
          title="Manual trigger belum dihubungkan ke API aksi aman."
          className="px-4 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs uppercase font-bold border border-slate-200 shadow-xs flex items-center space-x-2 cursor-not-allowed"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Manual Trigger Locked</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Active', activeCount, 'text-emerald-600', CheckCircle2],
          ['Running', runningCount, 'text-sky-600', Activity],
          ['Paused', pausedCount, 'text-slate-600', PauseCircle],
          ['Run History', totalRuns, 'text-slate-900', History],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof Activity, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{Number(value).toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-sky-600" />
            <span>Automation Queue</span>
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={selectedFilter === filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-2 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                  selectedFilter === filter.id ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs' : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredAutomations.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredAutomations.map((automation) => (
              <article key={automation.id} className="border border-sky-100 bg-sky-50/20 p-5 shadow-2xs space-y-4 hover:border-sky-300 transition-colors">
                <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 shrink-0 border flex items-center justify-center ${statusClass(automation.status)}`}>
                      {automation.status === 'running' ? <RefreshCw className="w-5 h-5 animate-spin" /> : automation.status === 'paused' ? <PauseCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-mono text-sm font-bold text-slate-900 uppercase leading-snug">{automation.name}</h2>
                      <p className="text-[10px] font-mono text-sky-600 uppercase tracking-wider mt-1">{typeLabel(automation.type)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${statusClass(automation.status)}`}>{automation.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-white border border-sky-100 p-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Schedule</span>
                    <span className="font-bold text-slate-900 block mt-1">{automation.schedule}</span>
                  </div>
                  <div className="bg-white border border-sky-100 p-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><History className="w-3 h-3" /> Last Run</span>
                    <span className="font-bold text-slate-900 block mt-1">{automation.lastExecution}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Trigger Rule</span>
                    <p className="text-slate-700 font-sans mt-2 leading-relaxed">{ruleOf(automation.type)}</p>
                  </div>
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Safety</span>
                    <p className="text-slate-700 font-sans mt-2 leading-relaxed">{safetyOf(automation.type)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-sky-100 pt-3 font-mono text-xs">
                  <span className="text-slate-500">Total executions</span>
                  <span className="font-bold text-slate-900">{Number(automation.historyCount || 0).toLocaleString('id-ID')}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <Play className="w-8 h-8 text-sky-600 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Tidak ada automation pada filter ini</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Automation baru akan muncul setelah scheduler/connector mengirim data real.</p>
          </div>
        )}
      </div>
    </div>
  );
};
