import React, { useState } from 'react';
import { Activity, Wifi, CheckCircle2, AlertTriangle, Server, TimerReset, Database, Radio } from 'lucide-react';
import { MetricSnapshot, ServerItem } from '../../../types/dashboard';

interface MonitoringViewProps {
  servers: ServerItem[];
  metricSnapshots: MetricSnapshot[];
}

type Risk = 'Aman' | 'Warning' | 'Critical';
type Range = '1m' | '5m' | '15m' | '1h' | '6h' | '24h';
type Field = 'cpuUsage' | 'memoryUsage' | 'storageUsage';

const RANGE_OPTIONS: { value: Range; label: string; minutes: number }[] = [
  { value: '1m', label: '1m', minutes: 1 },
  { value: '5m', label: '5m', minutes: 5 },
  { value: '15m', label: '15m', minutes: 15 },
  { value: '1h', label: '1h', minutes: 60 },
  { value: '6h', label: '6h', minutes: 360 },
  { value: '24h', label: '24h', minutes: 1440 },
];

const RESOURCE_LINES: { label: string; field: Field; color: string; soft: string }[] = [
  { label: 'CPU', field: 'cpuUsage', color: '#38bdf8', soft: 'bg-sky-500/10 text-sky-700 border-sky-200' },
  { label: 'RAM', field: 'memoryUsage', color: '#22c55e', soft: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  { label: 'Disk', field: 'storageUsage', color: '#f59e0b', soft: 'bg-amber-500/10 text-amber-700 border-amber-200' },
];

const CHART = {
  width: 860,
  height: 320,
  pad: { left: 52, right: 104, top: 22, bottom: 46 },
};

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

const rangeMinutes = (range: Range) => RANGE_OPTIONS.find((item) => item.value === range)?.minutes ?? 5;

const inRange = (snapshot: MetricSnapshot, range: Range) => {
  const created = new Date(snapshot.createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return created >= Date.now() - rangeMinutes(range) * 60 * 1000;
};

const timeLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const shortTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const compact = (points: MetricSnapshot[], max = 120) => {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  return points.filter((_, i) => i % step === 0 || i === points.length - 1);
};

const percent = (value?: number) => {
  const safe = Number(value ?? 0);
  const rounded = Number.isFinite(safe) ? Math.round(safe * 10) / 10 : 0;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
};

const trend = (points: MetricSnapshot[], field: Field) => {
  const latest = Number(points.at(-1)?.[field] ?? 0);
  const prev = Number(points.at(-2)?.[field] ?? latest);
  const diff = Math.round((latest - prev) * 10) / 10;
  if (Math.abs(diff) < 0.1) return '0%';
  return `${diff > 0 ? '+' : ''}${Number.isInteger(diff) ? diff : diff.toFixed(1)}%`;
};

const statsOf = (points: MetricSnapshot[], field: Field) => {
  const values = points.map((point) => Number(point[field]) || 0);
  const total = values.reduce((acc, value) => acc + value, 0);
  return {
    latest: values.at(-1) ?? 0,
    min: Math.min(...values),
    avg: values.length ? total / values.length : 0,
    max: Math.max(...values),
  };
};

const xy = (points: MetricSnapshot[], field: Field, index: number) => {
  const chartW = CHART.width - CHART.pad.left - CHART.pad.right;
  const chartH = CHART.height - CHART.pad.top - CHART.pad.bottom;
  const x = CHART.pad.left + (index / Math.max(points.length - 1, 1)) * chartW;
  const y = CHART.pad.top + (1 - clamp(Number(points[index]?.[field] ?? 0), 0, 100) / 100) * chartH;
  return { x, y };
};

const pathFor = (points: MetricSnapshot[], field: Field) => points.map((_, i) => {
  const point = xy(points, field, i);
  return `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
}).join(' ');

const LiveLineChart = ({ server, snapshots, range }: { server?: ServerItem; snapshots: MetricSnapshot[]; range: Range }) => {
  const points = compact(snapshots, range === '1m' ? 30 : range === '5m' ? 60 : 120);
  const latest = points.at(-1);
  const rangeLabel = RANGE_OPTIONS.find((item) => item.value === range)?.label ?? range;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Live Resource Line Chart</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">{points.length} snapshot • {rangeLabel}</span>
        </div>
        <div className="h-72 border border-dashed border-sky-200 bg-sky-50/30 flex items-center justify-center text-center p-4">
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-sans">History belum cukup untuk range {rangeLabel}. Minimal 2 snapshot real untuk line chart.</p>
            {server ? <p className="text-[11px] font-mono text-slate-600">Current {server.name}: CPU {percent(server.cpuUsage)} • RAM {percent(server.memoryUsage)} • Disk {percent(server.storageUsage)}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = clamp(hoverIndex ?? points.length - 1, 0, points.length - 1);
  const active = points[activeIndex];
  const activeX = xy(points, 'cpuUsage', activeIndex).x;
  const tooltipX = clamp(activeX + 12, 58, CHART.width - 182);
  const dotStep = Math.max(1, Math.ceil(points.length / 18));

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewX = ((event.clientX - rect.left) / rect.width) * CHART.width;
    const chartW = CHART.width - CHART.pad.left - CHART.pad.right;
    const ratio = clamp((viewX - CHART.pad.left) / chartW, 0, 1);
    setHoverIndex(Math.round(ratio * (points.length - 1)));
  };

  return (
    <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Live Resource Line Chart</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-sans mt-1">Target: {server?.name || latest?.serverName || 'server'} • range {rangeLabel} • titik terbaru {timeLabel(latest?.createdAt || '')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_LINES.map((line) => (
            <div key={line.field} className={`px-3 py-2 border font-mono text-xs ${line.soft}`}>
              <span className="text-[10px] uppercase block">{line.label}</span>
              <span className="font-bold text-base">{percent(latest?.[line.field])}</span>
              <span className="text-[10px] ml-2">{trend(points, line.field)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-3 md:p-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="w-full h-[320px] cursor-crosshair select-none"
          role="img"
          aria-label="Live CPU RAM Disk line chart dengan angka detail"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <rect x="0" y="0" width={CHART.width} height={CHART.height} fill="#020617" />
          {[0, 25, 50, 75, 90, 100].map((value) => {
            const y = CHART.pad.top + (1 - value / 100) * (CHART.height - CHART.pad.top - CHART.pad.bottom);
            const guide = value === 75 || value === 90;
            return (
              <g key={value}>
                <line x1={CHART.pad.left} x2={CHART.width - CHART.pad.right} y1={y} y2={y} stroke={value === 90 ? '#ef4444' : value === 75 ? '#eab308' : '#1e293b'} strokeWidth={guide ? 1.5 : 1} strokeDasharray={guide ? '6 6' : '0'} />
                <text x="12" y={y + 4} fill={guide ? '#e2e8f0' : '#94a3b8'} fontSize="11" fontFamily="monospace" fontWeight={guide ? 700 : 400}>{value}%</text>
              </g>
            );
          })}
          {points.map((_, i) => {
            if (i % Math.max(1, Math.floor(points.length / 8)) !== 0 && i !== points.length - 1) return null;
            const point = xy(points, 'cpuUsage', i);
            return <line key={i} x1={point.x} x2={point.x} y1={CHART.pad.top} y2={CHART.height - CHART.pad.bottom} stroke="#0f172a" strokeWidth="1" />;
          })}
          {RESOURCE_LINES.map((line) => <path key={`${line.field}-glow`} d={pathFor(points, line.field)} fill="none" stroke={line.color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />)}
          {RESOURCE_LINES.map((line) => <path key={line.field} d={pathFor(points, line.field)} fill="none" stroke={line.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />)}
          {RESOURCE_LINES.map((line) => points.map((point, i) => {
            if (i % dotStep !== 0 && i !== activeIndex && i !== points.length - 1) return null;
            const pos = xy(points, line.field, i);
            const activeDot = i === activeIndex || i === points.length - 1;
            return (
              <circle key={`${line.field}-${point.id}-${i}`} cx={pos.x} cy={pos.y} r={activeDot ? 4.5 : 2.75} fill="#020617" stroke={line.color} strokeWidth={activeDot ? 2.5 : 1.5}>
                <title>{`${line.label} ${percent(point[line.field])} • ${timeLabel(point.createdAt)}`}</title>
              </circle>
            );
          }))}
          <line x1={activeX} x2={activeX} y1={CHART.pad.top} y2={CHART.height - CHART.pad.bottom} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
          {RESOURCE_LINES.map((line, index) => {
            const point = xy(points, line.field, points.length - 1);
            const labelX = CHART.width - CHART.pad.right + 14;
            const labelY = CHART.pad.top + 20 + index * 32;
            return (
              <g key={`${line.field}-latest`}>
                <line x1={point.x + 6} x2={labelX - 8} y1={point.y} y2={labelY} stroke={line.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
                <rect x={labelX} y={labelY - 14} width="84" height="26" fill="#020617" stroke={line.color} strokeWidth="1" />
                <text x={labelX + 8} y={labelY + 4} fill={line.color} fontSize="12" fontFamily="monospace" fontWeight="700">{line.label} {percent(latest?.[line.field])}</text>
              </g>
            );
          })}
          <g transform={`translate(${tooltipX} ${CHART.pad.top + 104})`}>
            <rect width="170" height="92" fill="#020617" stroke="#38bdf8" strokeWidth="1" opacity="0.96" />
            <text x="10" y="18" fill="#e2e8f0" fontSize="10" fontFamily="monospace" fontWeight="700">{timeLabel(active.createdAt)}</text>
            {RESOURCE_LINES.map((line, index) => (
              <g key={`${line.field}-tip`} transform={`translate(10 ${36 + index * 17})`}>
                <circle cx="0" cy="-4" r="3" fill={line.color} />
                <text x="10" y="0" fill="#cbd5e1" fontSize="11" fontFamily="monospace">{line.label}</text>
                <text x="96" y="0" fill={line.color} fontSize="11" fontFamily="monospace" fontWeight="700" textAnchor="end">{percent(active[line.field])}</text>
              </g>
            ))}
          </g>
          <text x={CHART.pad.left} y={CHART.height - 14} fill="#94a3b8" fontSize="11" fontFamily="monospace">{shortTime(points[0].createdAt)}</text>
          <text x={(CHART.width - CHART.pad.right + CHART.pad.left) / 2} y={CHART.height - 14} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">warning 75% • critical 90% • hover untuk detail</text>
          <text x={CHART.width - CHART.pad.right} y={CHART.height - 14} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="end">{shortTime(latest?.createdAt || '')}</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {RESOURCE_LINES.map((line) => {
          const stat = statsOf(points, line.field);
          return (
            <div key={`${line.field}-stat`} className="border border-sky-100 bg-sky-50/30 p-4 font-mono text-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="uppercase tracking-wider font-bold text-slate-700">{line.label} Detail</span>
                <span style={{ color: line.color }} className="font-bold">Latest {percent(stat.latest)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                <span>Min <b className="text-slate-900">{percent(stat.min)}</b></span>
                <span>Avg <b className="text-slate-900">{percent(stat.avg)}</b></span>
                <span>Max <b className="text-slate-900">{percent(stat.max)}</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MonitoringView: React.FC<MonitoringViewProps> = ({ servers, metricSnapshots }) => {
  const [timeRange, setTimeRange] = useState<Range>('5m');
  const services = servers.flatMap(srv => srv.services.map((svc) => ({ ...svc, serverName: srv.name, lastCheck: srv.lastCheck })));
  const onlineServices = services.filter(s => s.status === 'online').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;
  const offlineServices = services.filter(s => s.status === 'offline').length;
  const latestUpdate = servers.map(s => s.lastSeen || s.lastCheck).filter(Boolean).sort().at(-1) || 'Belum ada data';
  const activeCount = servers.filter(s => s.status === 'active').length;
  const warningCount = servers.filter(s => s.status === 'warning').length;
  const criticalCount = servers.filter(s => s.status === 'critical').length;
  const waitingCount = servers.filter(s => s.status === 'waiting').length;
  const chartServer = servers.find((server) => metricSnapshots.some((snapshot) => snapshot.serverId === server.id)) ?? servers[0];
  const filteredSnapshots = metricSnapshots
    .filter(s => inRange(s, timeRange))
    .filter(s => !chartServer || s.serverId === chartServer.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const selectedRange = RANGE_OPTIONS.find((range) => range.value === timeRange);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Monitoring Center</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Live Monitoring Chart</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Snapshot real dari metric_snapshots. UI refresh 5 detik. Range aktif {selectedRange?.label}.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range.value}
              type="button"
              aria-pressed={timeRange === range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-2 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                timeRange === range.value ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs' : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
              }`}
            >
              {range.label}
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
        <div className="bg-white border border-sky-200 p-5 shadow-xs"><span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Last Update</span><span className="text-sm font-mono font-bold text-slate-900">{latestUpdate}</span><p className="text-[11px] text-slate-500 font-sans mt-2">Range points: {filteredSnapshots.length}</p></div>
      </div>

      <LiveLineChart server={chartServer} snapshots={filteredSnapshots} range={timeRange} />

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
