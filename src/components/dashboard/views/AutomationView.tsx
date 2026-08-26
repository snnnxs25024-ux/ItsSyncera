import React from 'react';
import { Cpu, CheckCircle2, Play, RefreshCw } from 'lucide-react';
import { AutomationItem } from '../../../types/dashboard';

interface AutomationViewProps {
  automations: AutomationItem[];
}

export const AutomationView: React.FC<AutomationViewProps> = ({ automations }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Infrastructure Ops</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">System Automation & Cron Tasks</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Daftar automasi background, auto-backup harian, self-healing reboot, dan health probes.</p>
        </div>
        <button
          onClick={() => alert('Automasi baru berhasil didaftarkan ke scheduler cluster.')}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold border border-sky-400 shadow-xs flex items-center space-x-2"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Run Manual Trigger</span>
        </button>
      </div>

      {/* Automations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {automations.map((auto) => (
          <div key={auto.id} className="bg-white border border-sky-200 p-6 shadow-xs space-y-4 hover:border-sky-400 transition-colors">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h2 className="font-mono text-sm font-bold text-slate-900 uppercase">{auto.name}</h2>
                  <span className="text-[10px] font-mono text-sky-600 uppercase tracking-widest font-semibold">Type: {auto.type}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-mono font-bold">
                {auto.status}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-sky-100">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-bold text-slate-900">{auto.schedule}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-sky-100">
                <span className="text-slate-500">Last Execution:</span>
                <span className="font-bold text-slate-900">{auto.lastExecution}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Executions:</span>
                <span className="font-bold text-slate-900">{auto.historyCount} kali sukses</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
