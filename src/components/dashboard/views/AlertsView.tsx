import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Clock, Filter, Server, Activity, Wrench } from 'lucide-react';
import { AlertItem } from '../../../types/dashboard';

interface AlertsViewProps {
  alerts: AlertItem[];
}

type AlertFilter = 'all' | 'critical' | 'warning' | 'information' | 'active' | 'resolved';

const severityClass = (severity: AlertItem['severity']) =>
  severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
  severity === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  'bg-sky-50 text-sky-700 border-sky-200';

const statusClass = (status: AlertItem['status']) =>
  status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  status === 'Investigating' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  'bg-sky-50 text-sky-700 border-sky-200';

const impactOf = (alert: AlertItem) => {
  if (alert.severity === 'critical') return 'Risiko downtime, response lambat, atau proses client berhenti.';
  if (alert.severity === 'warning') return 'Performa menurun. Perlu dipantau sebelum naik ke critical.';
  return 'Informasi operasional. Tidak ada dampak besar saat ini.';
};

const recommendationOf = (alert: AlertItem) => {
  if (alert.status === 'Resolved') return 'Audit hasil perbaikan. Pastikan alert tidak muncul ulang.';
  if (alert.severity === 'critical') return 'Prioritaskan investigasi server, resource, service, dan log terbaru.';
  if (alert.severity === 'warning') return 'Pantau trend, siapkan cleanup, restart terkontrol, atau scaling.';
  return 'Catat event. Tidak perlu eskalasi jika kondisi stabil.';
};

const matchesFilter = (alert: AlertItem, filter: AlertFilter) => {
  if (filter === 'all') return true;
  if (filter === 'active') return alert.status !== 'Resolved';
  if (filter === 'resolved') return alert.status === 'Resolved';
  return alert.severity === filter;
};

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts }) => {
  const [selectedFilter, setSelectedFilter] = useState<AlertFilter>('active');
  const filteredAlerts = alerts.filter((alert) => matchesFilter(alert, selectedFilter));
  const activeAlerts = alerts.filter((alert) => alert.status !== 'Resolved');
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical');
  const warningAlerts = alerts.filter((alert) => alert.severity === 'warning');
  const resolvedAlerts = alerts.filter((alert) => alert.status === 'Resolved');
  const filterOptions: { id: AlertFilter; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical' },
    { id: 'warning', label: 'Warning' },
    { id: 'information', label: 'Info' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Risk Detector</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Alert Center</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Pusat risk aktif, dampak client, tindakan SRE, dan status penyelesaian.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          {filterOptions.map((filter) => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Active', activeAlerts.length, 'text-sky-600', Activity],
          ['Critical', criticalAlerts.length, 'text-rose-600', AlertTriangle],
          ['Warning', warningAlerts.length, 'text-amber-600', Clock],
          ['Resolved', resolvedAlerts.length, 'text-emerald-600', CheckCircle2],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof Activity, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{Number(value)}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Alert Queue</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Showing {filteredAlerts.length} / {alerts.length}</span>
        </div>

        {filteredAlerts.length ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <article key={alert.id} className="border border-sky-100 bg-sky-50/20 p-5 shadow-2xs space-y-4 hover:border-sky-300 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-sky-100 pb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 shrink-0 border flex items-center justify-center ${severityClass(alert.severity)}`}>
                      {alert.severity === 'critical' ? <AlertTriangle className="w-5 h-5" /> : alert.status === 'Resolved' ? <ShieldCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${severityClass(alert.severity)}`}>{alert.severity}</span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${statusClass(alert.status)}`}>{alert.status}</span>
                      </div>
                      <h2 className="font-mono text-sm font-bold text-slate-900 uppercase leading-snug">{alert.title}</h2>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">Detected: {alert.detectedAt}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-sky-100 p-3 font-mono text-xs min-w-52">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Server className="w-3 h-3" /> Affected Server</span>
                    <span className="font-bold text-slate-900 block mt-1">{alert.server}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Client Impact</span>
                    <p className="text-slate-700 font-sans mt-2 leading-relaxed">{impactOf(alert)}</p>
                  </div>
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Recommended Action</span>
                    <p className="text-slate-700 font-sans mt-2 leading-relaxed">{recommendationOf(alert)}</p>
                  </div>
                  <div className="bg-white border border-sky-100 p-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Wrench className="w-3 h-3" /> Action Taken</span>
                    <p className="text-slate-700 font-sans mt-2 leading-relaxed">{alert.actionTaken || 'Belum ada tindakan tercatat.'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Tidak ada alert pada filter ini</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Alert baru akan muncul saat connector/monitoring mengirim event real.</p>
          </div>
        )}
      </div>
    </div>
  );
};
