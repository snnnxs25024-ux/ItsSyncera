import React, { useState } from 'react';
import { Activity, Wifi, CheckCircle2, AlertTriangle, Server, TimerReset, Database } from 'lucide-react';
import { MetricSnapshot, ServerItem } from '../../../types/dashboard';

interface MonitoringViewProps {
  servers: ServerItem[];
  metricSnapshots: MetricSnapshot[];
}

type Risk = 'Aman' | 'Warning' | 'Critical';
type Range = 'realtime' | '1h' | '24h' | '7d' | '30d';

type Field = 'cpuUsage' | 'memoryUsage' | 'storageUsage';

const riskOf = (server: ServerItem): Risk => {
  if (server.status === 'critical' || server.cpuUsage >= 90 || server.memoryUsage >= 90 || server.storageUsage >= 90) return 'Critical';
  if (server.status === 'warning' || server.cpuUsage >= 75 || server.memoryUsage >= 80 || server.storageUsage >= 80) return 'Warning';
  return 'Aman';
};

const riskClass = (risk: Risk) =>
  risk === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
  risk === 'Warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
  'bg-emerald-50 text-emerald-700 border border-emerald-200';

const impactOf = (server: ServerItem) => {
  if (server.cpuUsage >= 90 || server.memoryUsage >= 90) return 'Aplikasi bisa lambat atau timeout saat traffic tinggi.';
  if (server.storageUsage >= 85) return 'Disk hampir penuh, risiko upload/log/database terganggu.';
  if (server.status === 'warning') return 'Performa menurun, perlu dipantau sebelum jadi critical.';
  if (server.status === 'waiting') return 'Menunggu koneksi agent/API pertama.';
  return 'Layanan berjalan normal.';
};

const actionOf = (risk: Risk, server: ServerItem) => {
  if (server.status === 'waiting') return 'Selesaikan connector setup.';
  if (risk === 'Critical') return 'Prioritaskan investigasi resource dan service down.';
  if (risk === 'Warning') return 'Pantau trend, siapkan cleanup/optimasi.';
  return 'Tidak perlu tindakan.';
};

const avgOf = (servers: ServerItem[], field: Field) => servers.length
  ? Math.round(servers.reduce((acc, s) => acc + s[field], 0) / servers.length)
  : 0;

const inRange = (snapshot: MetricSnapshot, range: Range) => {
  if (range === 'realtime') return true;
  const created = new Date(snapshot.createdAt).getTime();
  if (!created) return false;
  const hours = range === '1h' ? 1 : range === '24h' ? 24 : range === '7d' ? 168 : 720;
  return created >= Date.now() - hours * 60 * 60 * 1000;
};

const timeLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const compact = (points: MetricSnapshot[], max = 80) => {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  return points.filter((_, i) => i % step === 0 || i === points.length - 1);
};

const pointsPath = (points: MetricSnapshot[], field: Field, width: number, height: number) => {
  const n = Math.max(points.length - 1, 1);
  return points.map((point, i) => {
    const x = (i / n) * width;
    const y = height - (clamp(point[field], 0, 100) / 100) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
};

const LineChart = ({ title, field, snapshots, color, softColor }: { title: string; field: Field; snapshots: MetricSnapshot[]; color: string; softColor: string }) => {
  const points = compact(snapshots.slice(-240));
  const latest = points.at(-1)?.[field] ?? 0;
  if (points.length < 2) {
    return (
      <div className="p-5 bg-sky-50/30 border border-sky-200 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs font-bold text-slate-900 uppercase">{title}</span>
          <span className="text-[10px] font-mono text-slate-500">{points.length} snapshot</span>
        </div>
        <div className="h-44 border border-dashed border-sky-200 bg-white flex items-center justify-center text-center p-4">
          <p className="text-[11px] text-slate-500 font-sans">History belum cukup. Minimal 2 snapshot untuk line chart real.</p>
        </div>
      </div>
    );
  }
  const path = pointsPath(points, field, 360, 140);
  const fill = `${path} L 360 140 L 0 140 Z`;
  return (
    <div className="p-5 bg-sky-50/30 border border-sky-200 space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs font-bold text-slate-900 uppercase">{title}</span>
        <span className="text-[10px] font-mono text-sky-600">Latest: {latest}% • {points.length} pts</span>
      </div>
      <div className="relative bg-white border border-sky-100 p-3">
        <svg viewBox="0 0 360 160" className="w-full h-48" role="img" aria-label={`${title} line chart`}>
          {[25, 50, 75].map((line) => <line key={line} x1="0" x2="360" y1={140 - line * 1.4} y2={140 - line * 1.4} stroke="#e2e8f0" strokeWidth="1" />)}
          <line x1="0" x2="360" y1="35" y2="35" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="0" x2="360" y1="14" y2="14" stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1" />
          <path d={fill} fill={softColor} opacity="0.18" />
          <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, i) => {
            const x = (i / Math.max(points.length - 1, 1)) * 360;
            const y = 140 - (clamp(point[field], 0, 100) / 100) * 140;
            return <circle key={point.id + field} cx={x} cy={y} r={i === points.length - 1 ? 4 : 2} fill={color} opacity={i === points.length - 1 ? 1 : .55} />;
          })}
        </svg>
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>{timeLabel(points[0].createdAt)}</span>
          <span>warning 75% • critical 90%</span>
          <span>{timeLabel(points.at(-1)?.createdAt || '')}</span>
        </div>
      </div>
    </div>
  );
};

export const MonitoringView: React.FC<MonitoringViewProps> = ({ servers, metricSnapshots }) => {
  const [timeRange, setTimeRange] = useState<Range>('realtime');
  const services = servers.flatMap(srv => srv.services.map((svc) => ({ ...svc, serverName: srv.name, lastCheck: srv.lastCheck })));
  const onlineServices = services.filter(s => s.status === 'online').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;
  const offlineServices = services.filter(s => s.status === 'offline').length;
  const latestUpdate = servers.map(s => s.lastSeen || s.lastCheck).filter(Boolean).sort().at(-1) || 'Belum ada data';
  const filteredSnapshots = metricSnapshots.filter(s => inRange(s, timeRange));
  const activeCount = servers.filter(s => s.status === 'active').length;
  const warningCount = servers.filter(s => s.status === 'warning').length;
  const criticalCount = servers.filter(s => s.status === 'critical').length;
  const waitingCount = servers.filter(s => s.status === 'waiting').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Monitoring Center</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Live Monitoring Chart</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Line chart bergerak dari snapshot real. Data baru masuk tiap 1 menit, UI refresh otomatis.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          {(['realtime', '1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                timeRange === range ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs' : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
              }`}
            >
              {range === 'realtime' ? 'Live' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          ['Total Server', servers.length, 'text-slate-900', Server],
          ['Online', activeCount, 'text-emerald-600', CheckCircle2],
          ['Warning', warningCount, 'text-amber-600', AlertTriangle],
          ['Critical', criticalCount, 'text-rose-600', AlertTriangle],
          ['Waiting', waitingCount, 'text-slate-600', TimerReset],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof Server, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{Number(value)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-sky-200 p-5 shadow-xs"><span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Avg CPU</span><span className="text-3xl font-mono font-bold text-sky-600">{avgOf(servers, 'cpuUsage')}%</span></div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs"><span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Avg RAM</span><span className="text-3xl font-mono font-bold text-emerald-600">{avgOf(servers, 'memoryUsage')}%</span></div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs"><span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Avg Disk</span><span className="text-3xl font-mono font-bold text-amber-600">{avgOf(servers, 'storageUsage')}%</span></div>
        <div className="bg-white border border-sky-200 p-5 shadow-xs"><span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Last Update</span><span className="text-sm font-mono font-bold text-slate-900">{latestUpdate}</span><p className="text-[11px] text-slate-500 font-sans mt-2">Snapshot: {filteredSnapshots.length}</p></div>
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <span>Live Resource Line Chart ({timeRange.toUpperCase()})</span>
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <LineChart title="CPU History" field="cpuUsage" snapshots={filteredSnapshots} color="#0ea5e9" softColor="#0ea5e9" />
          <LineChart title="RAM History" field="memoryUsage" snapshots={filteredSnapshots} color="#10b981" softColor="#10b981" />
          <LineChart title="Disk History" field="storageUsage" snapshots={filteredSnapshots} color="#f59e0b" softColor="#f59e0b" />
        </div>
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><Database className="w-4 h-4 text-sky-600" /><span>Resource Usage Table</span></h2>
        <div className="overflow-x-auto border border-sky-100">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase"><tr><th className="p-3">Server</th><th className="p-3">Status</th><th className="p-3">CPU</th><th className="p-3">RAM</th><th className="p-3">Disk</th><th className="p-3">Network</th><th className="p-3">Uptime</th><th className="p-3">Last Seen</th><th className="p-3">Connector</th></tr></thead>
            <tbody className="divide-y divide-sky-100">
              {servers.map((srv) => <tr key={srv.id} className="hover:bg-sky-50/30 transition-colors"><td className="p-3 font-bold text-slate-900">{srv.name}</td><td className="p-3"><span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${riskClass(riskOf(srv))}`}>{srv.status}</span></td><td className="p-3 text-slate-900">{srv.cpuUsage}%</td><td className="p-3 text-slate-900">{srv.memoryUsage}%</td><td className="p-3 text-slate-900">{srv.storageUsage}%</td><td className="p-3 text-slate-600">{srv.networkTraffic}</td><td className="p-3 text-slate-600">{srv.uptime30d || '-'}</td><td className="p-3 text-slate-500 text-[11px]">{srv.lastSeen || srv.lastCheck}</td><td className="p-3 text-slate-600">{srv.connectionType || '-'}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><Wifi className="w-4 h-4 text-sky-600" /><span>Service / Website / SSL Health</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-sky-50/40 border border-sky-100"><span className="font-mono text-[10px] text-slate-500 uppercase">Online</span><div className="text-2xl font-mono font-bold text-emerald-600">{onlineServices}</div></div>
          <div className="p-4 bg-sky-50/40 border border-sky-100"><span className="font-mono text-[10px] text-slate-500 uppercase">Degraded</span><div className="text-2xl font-mono font-bold text-amber-600">{degradedServices}</div></div>
          <div className="p-4 bg-sky-50/40 border border-sky-100"><span className="font-mono text-[10px] text-slate-500 uppercase">Offline</span><div className="text-2xl font-mono font-bold text-rose-600">{offlineServices}</div></div>
        </div>
        <div className="overflow-x-auto border border-sky-100">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase"><tr><th className="p-3">Service</th><th className="p-3">Server</th><th className="p-3">Status</th><th className="p-3">Response</th><th className="p-3">Last Checked</th></tr></thead>
            <tbody className="divide-y divide-sky-100">
              {services.length ? services.map((item, idx) => <tr key={idx} className="hover:bg-sky-50/30 transition-colors"><td className="p-3 font-bold text-slate-900">{item.name}</td><td className="p-3 text-slate-600">{item.serverName}</td><td className="p-3 text-slate-900">{item.status}</td><td className="p-3 text-slate-900 font-bold">{item.response}</td><td className="p-3 text-slate-500 text-[11px]">{item.lastCheck}</td></tr>) : <tr><td className="p-4 text-slate-500" colSpan={5}>Belum ada service/endpoint terdeteksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /><span>Risk & Impact</span></h2>
        <div className="overflow-x-auto border border-sky-100">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase"><tr><th className="p-3">Server</th><th className="p-3">Risk</th><th className="p-3">Reason</th><th className="p-3">Client Impact</th><th className="p-3">Recommended Action</th></tr></thead>
            <tbody className="divide-y divide-sky-100">
              {servers.map((srv) => { const risk = riskOf(srv); return <tr key={srv.id} className="hover:bg-sky-50/30 transition-colors"><td className="p-3 font-bold text-slate-900">{srv.name}</td><td className="p-3"><span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${riskClass(risk)}`}>{risk}</span></td><td className="p-3 text-slate-600">CPU {srv.cpuUsage}% / RAM {srv.memoryUsage}% / Disk {srv.storageUsage}% / {srv.status}</td><td className="p-3 text-slate-600 font-sans text-[11px] min-w-56">{impactOf(srv)}</td><td className="p-3 text-slate-600 font-sans text-[11px] min-w-56">{actionOf(risk, srv)}</td></tr>; })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
