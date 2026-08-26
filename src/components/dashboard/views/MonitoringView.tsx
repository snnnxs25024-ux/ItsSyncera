import React, { useState } from 'react';
import { Activity, Cpu, HardDrive, Wifi, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { ServerItem } from '../../../types/dashboard';

interface MonitoringViewProps {
  servers: ServerItem[];
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({ servers }) => {
  const [timeRange, setTimeRange] = useState<'realtime' | '24h' | '7d' | '30d'>('realtime');

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Advanced Telemetry</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Performance & Availability Monitoring</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Real-time metrics, response times, and uptime percentage across all connected server clusters.</p>
        </div>
        <div className="flex items-center space-x-2">
          {(['realtime', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 font-mono text-xs uppercase border transition-colors ${
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

      {/* Availability Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Overall Fleet Uptime</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-emerald-600">99.98%</span>
            <span className="text-xs text-slate-500 font-mono">SLA Guaranteed</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Downtime tercatat: 0 min dalam 30 hari terakhir</p>
        </div>

        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Avg API Response Time</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-slate-900">14.2 ms</span>
            <span className="text-xs text-emerald-600 font-mono font-semibold">-2.4ms vs kemarin</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Diukur dari edge POP Singapore & Jakarta</p>
        </div>

        <div className="bg-white border border-sky-200 p-5 shadow-xs">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-2">Active Probes</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-sky-600">24 / 24</span>
            <span className="text-xs text-emerald-600 font-mono font-semibold">Online</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">HTTP, TCP, ICMP health checks running</p>
        </div>
      </div>

      {/* Performance Monitoring Visual Graphs */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-6">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <span>Performance Telemetry — CPU, Memory & Network ({timeRange.toUpperCase()})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPU & Memory Simulation Chart */}
          <div className="p-5 bg-sky-50/30 border border-sky-200 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-slate-900 uppercase">CPU Load Distribution</span>
              <span className="text-[10px] font-mono text-sky-600">Avg: 48.4%</span>
            </div>
            <div className="h-36 flex items-end space-x-2 border-b border-sky-200 pb-2">
              {[35, 42, 60, 48, 55, 70, 62, 45, 50, 42, 48, 65, 58, 44, 48].map((val, i) => (
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

      {/* Service Monitoring Table */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
          Service Monitoring & Endpoint Probes
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
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {servers.flatMap(srv => srv.services.map((svc, i) => ({ ...svc, serverName: srv.name }))).map((item, idx) => (
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
                  <td className="p-3 text-slate-500 text-[11px]">5 detik lalu</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
