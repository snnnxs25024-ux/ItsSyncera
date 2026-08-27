import React, { useState } from 'react';
import { Activity, Wifi, CheckCircle2, AlertTriangle, Server, TimerReset, Database, Radio } from 'lucide-react';
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
  const created = new Date(snapshot.createdAt).getTime();
  if (!created) return false;
  const hours = range === 'realtime' ? 1 : range === '1h' ? 1 : range === '24h' ? 24 : range === '7d' ? 168 : 720;
  return created >= Date.now() - hours * 60 * 60 * 1000;
};

const timeLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const shortTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const compact = (points: MetricSnapshot[], max = 96) => {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  return points.filter((_, i) => i % step === 0 || i === points.length - 1);
};

const trend = (points: MetricSnapshot[], field: Field) => {
  const latest = points.at(-1)?.[field] ?? 0;
  const prev = points.at(-2)?.[field] ?? latest;
  const diff = latest - prev;
  return `${diff > 0 ? '+' : ''}${diff}%`;
};

const xy = (points: MetricSnapshot[], field: Field, index: number) => {
  const width = 760;
  const height = 280;
  const pad = { left: 46, right: 18, top: 18, bottom: 34 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const x = pad.left + (index / Math.max(points.length - 1, 1)) * chartW;
  const y = pad.top + (1 - clamp(points[index][field], 0, 100) / 100) * chartH;
  return { x, y };
};

const pathFor = (points: MetricSnapshot[], field: Field) => points.map((_, i) => {
  const point = xy(points, field, i);
  return `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
}).join(' ');

const LiveLineChart = ({ server, snapshots }: { server?: ServerItem; snapshots: MetricSnapshot[] }) => {
  const points = compact(snapshots.slice(-120));
  const latest = points.at(-1);
  const lines: { label: string; field: Field; color: string; soft: string }[] = [
    { label: 'CPU', field: 'cpuUsage', color: '#38bdf8', soft: 'bg-sky-500/10 text-sky-700 border-sky-200' },
    { label: 'RAM', field: 'memoryUsage', color: '#22c55e', soft: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    { label: 'Disk', field: 'storageUsage', color: '#f59e0b', soft: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  ];

  if (points.length < 2) {
    return (
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Live Resource Line Chart</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">{points.length} snapshot</span>
        </div>
        <div className="h-64 border border-dashed border-sky-200 bg-sky-50/30 flex items-center justify-center text-center p-4">
          <p className="text-xs text-slate-500 font-sans">History belum cukup. Minimal 2 snapshot untuk line chart real.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Live Resource Line Chart</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Target: {server?.name || latest?.serverName || 'server'} • titik terbaru {timeLabel(latest?.createdAt || '')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lines.map((line) => (
            <div key={line.field} className={`px-3 py-2 border font-mono text-xs ${line.soft}`}>
              <span className="text-[10px] uppercase block">{line.label}</span>
              <span className="font-bold text-base">{latest?.[line.field] ?? 0}%</span>
              <span className="text-[10px] ml-2">{trend(points, line.field)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-3 md:p-4 overflow-hidden">
        <svg viewBox="0 0 760 280" className="w-full h-[280px]" role="img" aria-label="Live CPU RAM Disk line chart">
          <rect x="0" y="0" width="760" height="280" fill="#020617" />
          {[0, 25, 50, 75, 100].map((value) => {
            const y = 18 + (1 - value / 100) * 228;
            return (
              <g key={value}>
                <line x1="46" x2="742" y1={y} y2={y} stroke={value === 75 ? '#eab308' : value === 100 ? '#ef4444' : '#1e293b'} strokeWidth="1" strokeDasharray={value === 75 ? '6 6' : '0'} />
                <text x="10" y={y + 4} fill="#94a3b8" fontSize="11" fontFamily="monospace">{value}%</text>
              </g>
            );
          })}
          {points.map((_, i) => {
            if (i % Math.max(1, Math.floor(points.length / 8)) !== 0 && i !== points.length - 1) return null;
            const point = xy(points, 'cpuUsage', i);
            return <line key={i} x1={point.x} x2={point.x} y1="18" y2="246" stroke="#0f172a" strokeWidth="1" />;
          })}
          {lines.map((line) => <path key={line.field} d={pathFor(points, line.field)} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
          {lines.map((line) => {
            const point = xy(points, line.field, points.length - 1);
            return (
              <g key={line.field + '-dot'}>
                <circle cx={point.x} cy={point.y} r="8" fill={line.color} opacity="0.16" className="animate-pulse" />
                <circle cx={point.x} cy={point.y} r="4" fill={line.color} />
                <text x={point.x - 12} y={point.y - 12} fill={line.color} fontSize="11" fontFamily="monospace" fontWeight="700">{latest?.[line.field]}%</text>
              </g>
            );
          })}
          <text x="46" y="272" fill="#94a3b8" fontSize="11" fontFamily="monospace">{shortTime(points[0].createdAt)}</text>
          <text x="360" y="272" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">warning 75% • critical 90%</text>
          <text x="742" y="272" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="end">{shortTime(latest?.createdAt || '')}</text>
        </svg>
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
  const activeCount = servers.filter(s => s.status === 'active').length;
  const warningCount = servers.filter(s => s.status === 'warning').length;
  const criticalCount = servers.filter(s => s.status === 'critical').length;
  const waitingCount = servers.filter(s => s.status === 'waiting').length;
  const chartServer = servers[0];
  const filteredSnapshots = metricSnapshots
    .filter(s => inRange(s, timeRange))
    .filter(s => !chartServer || s.serverId === chartServer.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Monitoring Center</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Live Monitoring Chart</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Grafik gabungan CPU/RAM/Disk. Snapshot real tiap 1 menit, UI cek data tiap 5 detik.</p>
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
        <div className="bg-white border border-sky-200 p-5 shadow-xs"><span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Last Update</span><span className="text-sm font-mono font-bold text-slate-900">{latestUpdate}</span><p className="text-[11px] text-slate-500 font-sans mt-2">Live points: {filteredSnapshots.length}</p></div>
      </div>

      <LiveLineChart server={chartServer} snapshots={filteredSnapshots} />

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
