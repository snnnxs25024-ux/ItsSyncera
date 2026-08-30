import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, FileText, Server, Wrench } from 'lucide-react';
import { AlertItem, AutomationRun, IncidentEvent } from '../../../types/dashboard';

interface IncidentsViewProps {
  incidents: IncidentEvent[];
  alerts: AlertItem[];
  automationRuns: AutomationRun[];
}

const severityClass = (severity: IncidentEvent['severity']) =>
  severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
  severity === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  'bg-sky-50 text-sky-700 border-sky-200';

const timeLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '-';
  return date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const fallbackEvents = (alerts: AlertItem[], runs: AutomationRun[]): IncidentEvent[] => [
  ...alerts.filter((item) => item.status !== 'Resolved').map((item) => ({
    id: `alert-${item.id}`,
    serverId: '',
    serverName: item.server,
    incidentKey: `alert-${item.id}`,
    severity: item.severity,
    eventType: 'detected' as const,
    title: item.title,
    detail: item.actionTaken || 'Alert aktif. Belum ada tindakan tercatat.',
    actor: 'Syncera Alert',
    occurredAt: item.detectedAt,
  })),
  ...runs.filter((item) => item.status === 'failed').map((item) => ({
    id: `run-${item.id}`,
    serverId: '',
    serverName: item.targetServer,
    incidentKey: `run-${item.id}`,
    severity: 'critical' as const,
    eventType: 'detected' as const,
    title: item.automationName,
    detail: item.message,
    actor: 'Automation Run',
    occurredAt: item.startedAt,
  })),
].slice(0, 30);

export const IncidentsView: React.FC<IncidentsViewProps> = ({ incidents, alerts, automationRuns }) => {
  const events = (incidents.length ? incidents : fallbackEvents(alerts, automationRuns)).slice(0, 50);
  const critical = events.filter((item) => item.severity === 'critical').length;
  const warning = events.filter((item) => item.severity === 'warning').length;
  const affectedServers = new Set(events.map((item) => item.serverName).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Incident Timeline</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Incident Timeline</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Kronologi error, gejala, service terdampak, tindakan, dan hasil. Dibuat dari monitoring real.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-xs w-full md:w-auto">
          <div className="bg-rose-50 border border-rose-200 p-3 text-rose-700"><span className="block text-[10px] uppercase">Critical</span><b className="text-lg">{critical}</b></div>
          <div className="bg-amber-50 border border-amber-200 p-3 text-amber-700"><span className="block text-[10px] uppercase">Warning</span><b className="text-lg">{warning}</b></div>
          <div className="bg-sky-50 border border-sky-200 p-3 text-sky-700"><span className="block text-[10px] uppercase">Server</span><b className="text-lg">{affectedServers}</b></div>
        </div>
      </div>

      {events.length ? (
        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <div className="space-y-4">
            {events.map((event, index) => (
              <article key={event.id} className="grid grid-cols-[28px_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span className={`w-7 h-7 border flex items-center justify-center ${severityClass(event.severity)}`}>
                    {event.eventType === 'resolved' ? <CheckCircle2 className="w-4 h-4" /> : event.eventType === 'action' ? <Wrench className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </span>
                  {index < events.length - 1 && <span className="w-px flex-1 bg-sky-100" />}
                </div>
                <div className="border border-sky-100 bg-sky-50/20 p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${severityClass(event.severity)}`}>{event.severity}</span>
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold border bg-white text-slate-600 border-sky-200">{event.eventType}</span>
                      </div>
                      <h2 className="font-mono text-sm font-bold text-slate-900 uppercase leading-snug">{event.title}</h2>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeLabel(event.occurredAt)}</div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white border border-sky-100 p-3"><span className="font-mono text-[10px] text-slate-500 uppercase flex items-center gap-1"><Server className="w-3 h-3" /> Service terdampak</span><p className="text-slate-800 font-bold mt-1">{event.serverName || '-'}</p></div>
                    <div className="bg-white border border-sky-100 p-3 lg:col-span-2"><span className="font-mono text-[10px] text-slate-500 uppercase">Gejala / tindakan</span><p className="text-slate-700 font-sans mt-1 leading-relaxed">{event.detail}</p></div>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">Actor: {event.actor}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-sky-200 p-8 text-center shadow-xs">
          <FileText className="w-8 h-8 text-sky-600 mx-auto mb-3" />
          <p className="font-mono text-sm font-bold uppercase text-slate-900">Belum ada incident</p>
          <p className="text-xs text-slate-500 font-sans mt-1">Incident muncul otomatis saat alert/failure real terjadi.</p>
        </div>
      )}
    </div>
  );
};
