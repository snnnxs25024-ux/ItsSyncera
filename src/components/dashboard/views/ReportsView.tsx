import React from 'react';
import { Download, FileText, CheckCircle2, AlertTriangle, Server, ShieldCheck, Wrench, Activity, Archive, Lock } from 'lucide-react';
import { AlertItem, AutomationItem, AutomationRun, BackupItem, MaintenanceItem, ServerItem } from '../../../types/dashboard';

interface ReportsViewProps {
  servers: ServerItem[];
  alerts: AlertItem[];
  automations: AutomationItem[];
  automationRuns: AutomationRun[];
  maintenances: MaintenanceItem[];
  backups: BackupItem[];
}

const backupSuccessRate = (backups: BackupItem[]) => backups.length
  ? Math.round((backups.filter((backup) => backup.status === 'Success').length / backups.length) * 100)
  : null;

const healthScore = (servers: ServerItem[], alerts: AlertItem[], backups: BackupItem[]) => {
  if (!servers.length && !alerts.length && !backups.length) return null;
  const serverPenalty = servers.reduce((score, server) => score + (server.status === 'critical' ? 18 : server.status === 'warning' ? 8 : 0), 0);
  const alertPenalty = alerts.reduce((score, alert) => score + (alert.status === 'Resolved' ? 0 : alert.severity === 'critical' ? 12 : alert.severity === 'warning' ? 6 : 2), 0);
  const backupPenalty = backups.filter((backup) => backup.status === 'Failed').length * 12;
  return Math.max(0, 100 - serverPenalty - alertPenalty - backupPenalty);
};

const statusTone = (value: number | null) => value === null ? 'text-slate-900' : value >= 90 ? 'text-emerald-600' : value >= 70 ? 'text-amber-600' : 'text-rose-600';

export const ReportsView: React.FC<ReportsViewProps> = ({ servers, alerts, automations, automationRuns, maintenances, backups }) => {
  const activeServers = servers.filter((server) => server.status === 'active').length;
  const criticalServers = servers.filter((server) => server.status === 'critical').length;
  const activeAlerts = alerts.filter((alert) => alert.status !== 'Resolved').length;
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical' && alert.status !== 'Resolved').length;
  const completedMaintenances = maintenances.filter((maintenance) => maintenance.status === 'Completed').length;
  const failedBackups = backups.filter((backup) => backup.status === 'Failed').length;
  const successRate = backupSuccessRate(backups);
  const score = healthScore(servers, alerts, backups);
  const hasData = Boolean(servers.length || alerts.length || automations.length || automationRuns.length || maintenances.length || backups.length);
  const events = [
    ...alerts.slice(0, 4).map((item) => ({ id: `alert-${item.id}`, type: 'Alert', title: item.title, status: item.status, detail: item.server, time: item.detectedAt })),
    ...automationRuns.slice(0, 4).map((item) => ({ id: `run-${item.id}`, type: 'Automation', title: item.automationName, status: item.status, detail: item.targetServer, time: item.startedAt })),
    ...maintenances.slice(0, 4).map((item) => ({ id: `maintenance-${item.id}`, type: 'Maintenance', title: item.title, status: item.status, detail: item.targetServer, time: item.scheduledDate })),
    ...backups.slice(0, 4).map((item) => ({ id: `backup-${item.id}`, type: 'Backup', title: item.id, status: item.status, detail: item.server, time: item.date })),
  ].slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Client Report</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Infrastructure Reports</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Ringkasan real dari server, alert, automation, backup, dan maintenance. Tidak memakai angka dummy.</p>
        </div>
        <button
          type="button"
          disabled
          title="Export PDF/CSV belum dihubungkan ke API report."
          className="px-4 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs uppercase font-bold border border-slate-200 shadow-xs flex items-center space-x-2 cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          <span>Export Locked</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Health Score', score === null ? 'N/A' : `${score}%`, statusTone(score), ShieldCheck],
          ['Total Servers', servers.length, 'text-slate-900', Server],
          ['Active Alerts', activeAlerts, activeAlerts ? 'text-amber-600' : 'text-emerald-600', AlertTriangle],
          ['Backup Success', successRate === null ? 'N/A' : `${successRate}%`, statusTone(successRate), Archive],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof Server, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{String(value)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-sky-200 p-5 shadow-xs space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><Server className="w-4 h-4 text-sky-600" /> Server Health</h2>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-sky-50/40 border border-sky-100 p-3"><span className="text-slate-500 block text-[10px] uppercase">Active</span><b className="text-emerald-600 text-xl">{activeServers}</b></div>
            <div className="bg-sky-50/40 border border-sky-100 p-3"><span className="text-slate-500 block text-[10px] uppercase">Critical</span><b className="text-rose-600 text-xl">{criticalServers}</b></div>
          </div>
          <p className="text-xs text-slate-600 font-sans">Status dihitung dari table servers.</p>
        </div>

        <div className="bg-white border border-sky-200 p-5 shadow-xs space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><Activity className="w-4 h-4 text-sky-600" /> Operations</h2>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-sky-50/40 border border-sky-100 p-3"><span className="text-slate-500 block text-[10px] uppercase">Automations</span><b className="text-slate-900 text-xl">{automations.length}</b></div>
            <div className="bg-sky-50/40 border border-sky-100 p-3"><span className="text-slate-500 block text-[10px] uppercase">Run Logs</span><b className="text-sky-600 text-xl">{automationRuns.length}</b></div>
          </div>
          <p className="text-xs text-slate-600 font-sans">Run logs berasal dari automation_runs.</p>
        </div>

        <div className="bg-white border border-sky-200 p-5 shadow-xs space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><Wrench className="w-4 h-4 text-sky-600" /> Maintenance</h2>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-sky-50/40 border border-sky-100 p-3"><span className="text-slate-500 block text-[10px] uppercase">Completed</span><b className="text-emerald-600 text-xl">{completedMaintenances}</b></div>
            <div className="bg-sky-50/40 border border-sky-100 p-3"><span className="text-slate-500 block text-[10px] uppercase">Backup Failed</span><b className="text-rose-600 text-xl">{failedBackups}</b></div>
          </div>
          <p className="text-xs text-slate-600 font-sans">Maintenance dan backup dihitung dari data real.</p>
        </div>
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Report Narrative</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Generated from current dashboard data</span>
        </div>
        {hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="border border-sky-100 bg-sky-50/20 p-4">
              <h3 className="font-mono text-sm font-bold uppercase text-slate-900">Executive Summary</h3>
              <p className="font-sans text-slate-700 leading-relaxed mt-2">Fleet saat ini memiliki {servers.length} server, {activeAlerts} alert aktif, {automations.length} automation terdaftar, {backups.length} backup record, dan {maintenances.length} maintenance record.</p>
            </div>
            <div className="border border-sky-100 bg-sky-50/20 p-4">
              <h3 className="font-mono text-sm font-bold uppercase text-slate-900">Recommended Focus</h3>
              <p className="font-sans text-slate-700 leading-relaxed mt-2">{criticalAlerts || criticalServers ? 'Prioritaskan critical server/alert sebelum maintenance atau backup lanjutan.' : failedBackups ? 'Review backup gagal sebelum restore readiness dianggap aman.' : 'Kondisi tidak menunjukkan critical blocker dari data saat ini.'}</p>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <FileText className="w-8 h-8 text-sky-600 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Data belum cukup untuk report</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Tambahkan server, alert, automation, backup, atau maintenance agar report terisi.</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span>Recent Operational Events</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase">{events.length} entries</span>
        </div>
        {events.length ? (
          <div className="overflow-x-auto border border-sky-100">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase">
                <tr><th className="p-3">Type</th><th className="p-3">Event</th><th className="p-3">Target</th><th className="p-3">Status</th><th className="p-3">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="p-3 text-sky-700 font-bold">{event.type}</td>
                    <td className="p-3 text-slate-900 font-bold">{event.title}</td>
                    <td className="p-3 text-slate-600">{event.detail}</td>
                    <td className="p-3 text-slate-700">{event.status}</td>
                    <td className="p-3 text-slate-500">{event.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <Download className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Belum ada event operasional</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Events akan muncul dari alert, automation run, maintenance, dan backup.</p>
          </div>
        )}
      </div>
    </div>
  );
};
