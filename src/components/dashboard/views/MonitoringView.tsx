import React, { useState } from 'react';
import { Activity, Cpu, HardDrive, Wifi, CheckCircle2, AlertTriangle, Clock, Server, ArrowUpRight } from 'lucide-react';
import { ServerItem } from '../../../types/dashboard';

interface MonitoringViewProps {
  servers: ServerItem[];
}

type Risk = 'Aman' | 'Warning' | 'Critical';

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
  return 'Layanan berjalan normal.';
};

export const MonitoringView: React.FC<MonitoringViewProps> = ({ servers }) => {
  const [timeRange, setTimeRange] = useState<'realtime' | '24h' | '7d' | '30d'>('realtime');
  const services = servers.flatMap(srv => srv.services.map((svc) => ({ ...svc, serverName: srv.name, lastCheck: srv.lastCheck })));
  const onlineServices = services.filter(s => s.status === 'online').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;
  const offlineServices = services.filter(s => s.status === 'offline').length;
  const riskyServers = servers.filter(s => riskOf(s) !== 'Aman').length;
  const avgCpu = Math.round(servers.reduce((acc, s) => acc + s.cpuUsage, 0) / servers.length);
  const avgMemory = Math.round(servers.reduce((acc, s) => acc + s.memoryUsage, 0) / servers.length);
  const avgStorage = Math.round(servers.reduce((acc, s) => acc + s.storageUsage, 0) / servers.length);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Monitoring Center</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Server Performance Monitoring</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Pantau CPU, RAM, disk, network, service health, dan dampaknya ke operasional client.</p>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full">
          {(['realtime', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                timeRange === range
                  ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs'
                  : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
              }`}
            >
              {range === 'realtime' ? 'Real-time' : range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7d' : 'Last 30d'}
            </button>
          ))}
        </div>
      </div>

      {/* Monitoring Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Fleet Uptime</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-emerald-600">99.82%</span>
            <span className="text-xs text-slate-500 font-mono">30 hari</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Masih di atas target SLA 99.5%.</p>
        </div>

        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Server Risk Level</span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-mono font-bold ${riskyServers > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{riskyServers}</span>
            <span className="text-xs text-slate-500 font-mono">perlu perhatian</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Server dengan CPU/RAM/disk/status tidak normal.</p>
        </div>

        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Service Health</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-sky-600">{onlineServices}</span>
            <span className="text-xs text-slate-500 font-mono">online</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Degraded: {degradedServices} • Offline: {offlineServices}</p>
        </div>

        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Last Probe</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-slate-900">5s</span>
            <span className="text-xs text-emerald-600 font-mono font-semibold">fresh</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Probe monitoring berjalan berkala.</p>
        </div>
      </div>

      {/* Client Explanation */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>Apa arti angka monitoring?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ['CPU tinggi', 'Server sedang bekerja berat. Jika terlalu lama, aplikasi bisa lambat.'],
            ['RAM tinggi', 'Memori hampir penuh. Risiko aplikasi freeze atau restart.'],
            ['Disk hampir penuh', 'Upload, log, backup, atau database bisa terganggu.'],
            ['Network spike', 'Traffic naik mendadak. Bisa normal, bisa tanda abuse/serangan.']
          ].map(([title, desc]) => (
            <div key={title} className="p-4 bg-sky-50/40 border border-sky-100">
              <span className="font-mono text-[11px] font-bold uppercase text-slate-900">{title}</span>
              <p className="text-[11px] text-slate-600 font-sans mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Monitoring Visual Graphs */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-6">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <span>Performance Telemetry — CPU, RAM, Disk & Network ({timeRange.toUpperCase()})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['CPU Usage', avgCpu, Cpu],
            ['RAM Usage', avgMemory, Activity],
            ['Disk Usage', avgStorage, HardDrive]
          ].map(([label, value, Icon]) => (
            <div key={String(label)} className="p-5 bg-sky-50/30 border border-sky-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-slate-900 uppercase flex items-center space-x-2">
                  {React.createElement(Icon as typeof Cpu, { className: 'w-4 h-4 text-sky-600' })}
                  <span>{String(label)}</span>
                </span>
                <span className={`text-xs font-mono font-bold ${Number(value) > 85 ? 'text-rose-600' : Number(value) > 70 ? 'text-amber-600' : 'text-sky-600'}`}>{Number(value)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2">
                <div className={`${Number(value) > 85 ? 'bg-rose-500' : Number(value) > 70 ? 'bg-amber-500' : 'bg-sky-500'} h-full`} style={{ width: `${Number(value)}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">Rata-rata seluruh server.</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-sky-50/30 border border-sky-200 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-slate-900 uppercase">CPU Load Trend</span>
              <span className="text-[10px] font-mono text-sky-600">Avg: {avgCpu}%</span>
            </div>
            <div className="h-36 flex items-end space-x-2 border-b border-sky-200 pb-2">
              {[35, 42, 60, 48, 55, 70, 62, 45, 50, 42, 48, 65, 58, avgCpu, Math.min(100, avgCpu + 8)].map((val, i) => (
                <div key={i} className="flex-1 bg-sky-500 hover:bg-sky-600 transition-all rounded-t-xs relative group" style={{ height: `${val}%` }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val}%
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>00:00 WIB</span>
              <span>12:00 WIB</span>
              <span>Now</span>
            </div>
          </div>

          <div className="p-5 bg-sky-50/30 border border-sky-200 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-slate-900 uppercase">Network Bandwidth I/O</span>
              <span className="text-[10px] font-mono text-emerald-600">Peak: 2.4 GB/s</span>
            </div>
            <div className="h-36 flex items-end space-x-2 border-b border-sky-200 pb-2">
              {[20, 30, 45, 60, 50, 40, 75, 85, 65, 40, 55, 70, 50, 42, 58].map((val, i) => (
                <div key={i} className="flex-1 bg-emerald-500 hover:bg-emerald-600 transition-all rounded-t-xs relative group" style={{ height: `${val}%` }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val * 30} MB/s
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>00:00 WIB</span>
              <span>12:00 WIB</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Server Risk Table */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Server Risk Level & Client Impact</span>
        </h2>
        <div className="overflow-x-auto border border-sky-100">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase">
              <tr>
                <th className="p-3">Server</th>
                <th className="p-3">Risk</th>
                <th className="p-3">CPU</th>
                <th className="p-3">RAM</th>
                <th className="p-3">Disk</th>
                <th className="p-3">Client Impact</th>
                <th className="p-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {servers.map((srv) => {
                const risk = riskOf(srv);
                return (
                  <tr key={srv.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                      <Server className="w-3.5 h-3.5 text-sky-600" />
                      <span>{srv.name}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${riskClass(risk)}`}>{risk}</span>
                    </td>
                    <td className="p-3 text-slate-900">{srv.cpuUsage}%</td>
                    <td className="p-3 text-slate-900">{srv.memoryUsage}%</td>
                    <td className="p-3 text-slate-900">{srv.storageUsage}%</td>
                    <td className="p-3 text-slate-600 font-sans text-[11px] min-w-56">{impactOf(srv)}</td>
                    <td className="p-3 text-slate-600 font-sans text-[11px] min-w-56">
                      {risk === 'Critical' ? 'Prioritaskan investigasi resource dan service down.' : risk === 'Warning' ? 'Pantau trend, siapkan cleanup/optimasi.' : 'Tidak perlu tindakan.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Monitoring Table */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-sky-600" />
          <span>Service Monitoring & Endpoint Probes</span>
        </h2>
        <div className="overflow-x-auto border border-sky-100">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Target Server</th>
                <th className="p-3">Status</th>
                <th className="p-3">Response Time</th>
                <th className="p-3">Last Checked</th>
                <th className="p-3">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {services.map((item, idx) => (
                <tr key={idx} className="hover:bg-sky-50/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{item.name}</td>
                  <td className="p-3 text-slate-600">{item.serverName}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${
                      item.status === 'online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'degraded' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-900 font-bold">{item.response}</td>
                  <td className="p-3 text-slate-500 text-[11px]">{item.lastCheck}</td>
                  <td className="p-3 text-slate-600 text-[11px] font-sans">
                    {item.status === 'online' ? 'Normal' : item.status === 'degraded' ? 'Lambat, perlu dipantau' : 'Tidak merespons'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
