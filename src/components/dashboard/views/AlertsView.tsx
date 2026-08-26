import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Clock, Filter, ArrowUpRight } from 'lucide-react';
import { AlertItem } from '../../../types/dashboard';

interface AlertsViewProps {
  alerts: AlertItem[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredAlerts = alerts.filter(a => selectedCategory === 'all' || a.severity === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Incident Management</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Alert Center & Notifications</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Pemantauan insiden real-time, status investigasi, dan riwayat tindakan perbaikan SRE.</p>
        </div>
        <div className="flex items-center space-x-2">
          {['all', 'critical', 'warning', 'information'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 font-mono text-xs uppercase border transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs'
                  : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alt) => (
          <div key={alt.id} className="bg-white border border-sky-200 p-5 shadow-xs space-y-3 hover:border-sky-400 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-sky-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold ${
                  alt.severity === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  alt.severity === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  {alt.severity}
                </span>
                <h2 className="font-mono text-sm font-bold text-slate-900 uppercase">{alt.title}</h2>
              </div>
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-slate-500">{alt.detectedAt}</span>
                <span className={`px-2.5 py-1 text-[10px] uppercase font-bold ${
                  alt.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  alt.status === 'Investigating' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-sky-50 text-sky-700 border border-sky-200'
                }`}>
                  {alt.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-sky-50/40 border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Affected Server:</span>
                <span className="font-bold text-slate-900">{alt.server}</span>
              </div>
              <div className="p-3 bg-sky-50/40 border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Action Taken by SRE / Automation:</span>
                <span className="text-slate-800 font-sans">{alt.actionTaken}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
