import React from 'react';
import { Server, Activity, AlertTriangle, ShieldCheck, ArrowUpRight, CheckCircle2, Clock, Cpu, Wifi, Database, Globe2, PlugZap, TimerReset } from 'lucide-react';
import { ServerItem, AlertItem, BackupItem } from '../../../types/dashboard';

interface OverviewViewProps {
  servers: ServerItem[];
  alerts: AlertItem[];
  backups: BackupItem[];
  onNavigateTab: (tab: any) => void;
  onSelectServer: (server: ServerItem) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ servers, alerts, backups, onNavigateTab, onSelectServer }) => {
  const activeCount = servers.filter(s => s.status === 'active').length;
  const warningCount = servers.filter(s => s.status === 'warning').length;
  const criticalCount = servers.filter(s => s.status === 'critical').length;
  const activeAlerts = alerts.filter(a => a.status !== 'Resolved');
  const criticalAlertCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningAlertCount = activeAlerts.filter(a => a.severity === 'warning').length;
  const services = servers.flatMap(s => s.services);
  const onlineServices = services.filter(s => s.status === 'online').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;
  const offlineServices = services.filter(s => s.status === 'offline').length;
  const criticalSignalCount = criticalCount + offlineServices + criticalAlertCount;
  const warningSignalCount = warningCount + degradedServices + warningAlertCount;
  const primaryServer = servers[0];
  const latestBackup = backups[0];
  const overallStatus = servers.length === 0 ? 'Belum Ada Data' : criticalSignalCount > 0 ? 'Perlu Tindakan' : warningSignalCount > 0 ? 'Perlu Perhatian' : 'Aman';
  const overallTone = servers.length === 0 ? 'bg-slate-600' : criticalSignalCount > 0 ? 'bg-rose-600' : warningSignalCount > 0 ? 'bg-amber-500' : 'bg-emerald-600';
  const backupStatus = primaryServer?.backupStatus || (latestBackup ? `${latestBackup.status} • ${latestBackup.date}` : 'Belum ada backup terdeteksi');
  const backupDetail = latestBackup ? `${latestBackup.server} • ${latestBackup.size}` : 'Diambil dari Proxmox storage/tasks.';
  const sslStatus = primaryServer?.sslStatus || 'Belum dicek';
  const uptimeStatus = primaryServer?.uptime30d || '-';
  const connectionStatus = primaryServer?.connectionStatus || 'Belum ada koneksi server';
  const lastUpdated = primaryServer?.lastCheck || 'Belum ada data';
  const avgOf = (field: 'cpuUsage' | 'memoryUsage' | 'storageUsage') => servers.length
    ? Math.round(servers.reduce((acc, s) => acc + s[field], 0) / servers.length)
    : 0;

  const avgCpu = avgOf('cpuUsage');
  const avgMemory = avgOf('memoryUsage');
  const avgStorage = avgOf('storageUsage');
  const riskServers = servers
    .filter(s => s.status !== 'active' || s.cpuUsage > 80 || s.memoryUsage > 85 || s.storageUsage > 80)
    .slice(0, 3);
  const riskAlerts = activeAlerts.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Top Welcome Banner */}
      <div className="bg-sky-500 text-white p-4 rounded-none border border-sky-400 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest bg-sky-600 px-2 py-1 text-white font-semibold inline-block mb-2">
            Enterprise Client Portal • It's Syncera
          </span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide">
            Infrastructure Health & Fleet Overview
          </h1>
          <p className="text-xs text-sky-100 font-sans mt-1">
            Ringkasan status server, uptime, backup, SSL, alert, dan rekomendasi tindakan dalam satu layar.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('servers')}
            className="px-4 py-2.5 bg-white text-sky-900 font-mono text-xs uppercase font-bold hover:bg-sky-50 transition-colors shadow-xs"
          >
            Kelola Server ({servers.length})
          </button>
          <button
            onClick={() => onNavigateTab('monitoring')}
            className="px-4 py-2.5 bg-sky-600 text-white font-mono text-xs uppercase font-bold hover:bg-sky-700 transition-colors border border-sky-400 shadow-xs"
          >
            Live Monitoring
          </button>
        </div>
      </div>

      {/* Decision Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className={`border p-4 shadow-xs text-white ${overallTone}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold opacity-90">Overall Status</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold uppercase">{overallStatus}</div>
          <p className="text-[11px] font-sans mt-2 opacity-90">
            {criticalSignalCount > 0 ? 'Ada sinyal critical yang butuh follow-up.' : warningSignalCount > 0 ? 'Ada warning aktif, layanan tetap berjalan.' : 'Semua server terpantau normal.'}
          </p>
        </div>

        <div className="bg-white border border-sky-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Uptime Node</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">{uptimeStatus}</div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Uptime node dari Proxmox API.</p>
        </div>

        <div className="bg-white border border-sky-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Last Updated</span>
            <TimerReset className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">{lastUpdated}</div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Dashboard refresh otomatis setiap beberapa detik.</p>
        </div>
      </div>

      {/* Health Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-sky-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Backup Terakhir</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-sm font-bold text-slate-900">{backupStatus}</div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">{backupDetail}</p>
        </div>

        <div className="bg-white border border-sky-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">SSL / Domain</span>
            <Globe2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-mono text-sm font-bold text-slate-900">{sslStatus}</div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Status koneksi domain/API dari sinkronisasi terakhir.</p>
        </div>

        <div onClick={() => onNavigateTab('alerts')} className="bg-white border border-sky-200 p-4 shadow-xs hover:border-sky-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Alert Aktif</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-sm font-bold text-slate-900">{activeAlerts.length} issue dipantau</div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">Critical: {criticalAlertCount}, Warning: {warningAlertCount}</p>
        </div>

        <div onClick={() => onNavigateTab('servers')} className="bg-white border border-sky-200 p-4 shadow-xs hover:border-sky-400 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Koneksi Monitoring</span>
            <PlugZap className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-mono text-sm font-bold text-slate-900">{primaryServer?.connectionType || '-'}</div>
          <p className="text-[11px] text-slate-500 font-sans mt-2">{connectionStatus}</p>
        </div>
      </div>

      {/* Infrastructure Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigateTab('servers')}
          className="bg-white border border-sky-200 p-4 shadow-xs hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Server Fleet</span>
            <div className="w-8 h-8 bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-slate-900">{servers.length}</span>
            <span className="text-[11px] text-emerald-600 font-mono font-semibold">Provisioned</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-sans">
            Server terdaftar dalam monitoring
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('servers')}
          className="bg-white border border-sky-200 p-4 shadow-xs hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Server Aktif</span>
            <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-slate-900">{activeCount}</span>
            <span className="text-[11px] text-emerald-600 font-mono font-semibold">Online</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-sans">
            Reachable dan respons normal
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('alerts')}
          className="bg-white border border-sky-200 p-4 shadow-xs hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Warning / Degraded</span>
            <div className="w-8 h-8 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-slate-900">{warningSignalCount}</span>
            <span className="text-[11px] text-amber-600 font-mono font-semibold">Investigating</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-sans">
            Perlu dipantau, belum down
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('alerts')}
          className="bg-white border border-sky-200 p-4 shadow-xs hover:border-sky-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Critical Issues</span>
            <div className="w-8 h-8 bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-slate-900">{criticalSignalCount}</span>
            <span className="text-[11px] text-rose-600 font-mono font-semibold">Action Required</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-sans">
            Butuh tindakan teknis cepat
          </div>
        </div>
      </div>

      {/* Risk & Service Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white border border-sky-200 p-4 shadow-xs lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Top Risks & Recommended Actions</span>
            </h2>
            <button onClick={() => onNavigateTab('alerts')} className="text-[11px] text-sky-600 hover:underline font-mono flex items-center space-x-1">
              <span>Lihat Alerts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {riskAlerts.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {riskAlerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-sky-50/40 border border-sky-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-900 truncate">{alert.server}</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 ${alert.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{alert.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans">{alert.title}</p>
                  <p className="text-[10px] text-slate-500 font-sans">{alert.actionTaken}</p>
                </div>
              ))}
            </div>
          ) : riskServers.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {riskServers.map((srv) => (
              <div key={srv.id} className="p-4 bg-sky-50/40 border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 truncate">{srv.name}</span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 ${srv.status === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{srv.status}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans">
                  CPU {srv.cpuUsage}% • RAM {srv.memoryUsage}% • Disk {srv.storageUsage}%
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  Rekomendasi: cek service, bersihkan log/cache, jadwalkan optimasi resource.
                </p>
                <button
                  onClick={() => {
                    onSelectServer(srv);
                    onNavigateTab('servers');
                  }}
                  className="text-[10px] text-sky-600 hover:underline font-mono uppercase font-bold"
                >
                  View Detail
                </button>
              </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono text-xs">
              Tidak ada risk aktif. CPU {avgCpu}% • RAM {avgMemory}% • Disk {avgStorage}%.
            </div>
          )}
        </div>

        <div className="bg-white border border-sky-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-sky-600" />
              <span>Service Health</span>
            </h2>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span>Online Services</span>
              <span className="font-bold">{onlineServices}</span>
            </div>
            <div className="flex justify-between p-3 bg-amber-50 border border-amber-100 text-amber-700">
              <span>Degraded Services</span>
              <span className="font-bold">{degradedServices}</span>
            </div>
            <div className="flex justify-between p-3 bg-rose-50 border border-rose-100 text-rose-700">
              <span>Offline Services</span>
              <span className="font-bold">{offlineServices}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Server Performance Summary & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Resource Usage Summary */}
        <div className="bg-white border border-sky-200 p-4 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>Server Performance Summary (Fleet Average)</span>
            </h2>
            <button
              onClick={() => onNavigateTab('monitoring')}
              className="text-[11px] text-sky-600 hover:underline font-mono flex items-center space-x-1"
            >
              <span>Detail Monitoring</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-sky-50/40 border border-sky-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600">CPU Usage</span>
                <span className="font-bold text-slate-900">{avgCpu}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-none overflow-hidden">
                <div 
                  className={`h-full ${avgCpu > 80 ? 'bg-rose-500' : avgCpu > 60 ? 'bg-amber-500' : 'bg-sky-500'}`}
                  style={{ width: `${avgCpu}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">Rata-rata beban prosesor seluruh server</p>
            </div>

            <div className="p-4 bg-sky-50/40 border border-sky-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600">Memory (RAM)</span>
                <span className="font-bold text-slate-900">{avgMemory}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-none overflow-hidden">
                <div 
                  className={`h-full ${avgMemory > 80 ? 'bg-rose-500' : avgMemory > 60 ? 'bg-amber-500' : 'bg-sky-500'}`}
                  style={{ width: `${avgMemory}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">RAM tinggi bisa membuat aplikasi melambat</p>
            </div>

            <div className="p-4 bg-sky-50/40 border border-sky-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600">Storage</span>
                <span className="font-bold text-slate-900">{avgStorage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-none overflow-hidden">
                <div 
                  className={`h-full ${avgStorage > 80 ? 'bg-rose-500' : avgStorage > 60 ? 'bg-amber-500' : 'bg-sky-500'}`}
                  style={{ width: `${avgStorage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">Disk penuh berisiko mengganggu log, upload, dan database</p>
            </div>
          </div>

          {/* Quick Server List Table */}
          <div className="pt-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-3">
              Status Server Terkini
            </h3>
            <div className="overflow-x-auto border border-sky-100">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Server Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">CPU</th>
                    <th className="p-3">RAM</th>
                    <th className="p-3">Disk</th>
                    <th className="p-3">Last Check</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100">
                  {servers.map((srv) => (
                    <tr key={srv.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center space-x-2">
                        <Server className="w-3.5 h-3.5 text-sky-600" />
                        <span>{srv.name}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${
                          srv.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          srv.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {srv.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{srv.ipAddress}</td>
                      <td className="p-3 text-slate-900">{srv.cpuUsage}%</td>
                      <td className="p-3 text-slate-900">{srv.memoryUsage}%</td>
                      <td className="p-3 text-slate-900">{srv.storageUsage}%</td>
                      <td className="p-3 text-slate-600">{srv.lastCheck}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            onSelectServer(srv);
                            onNavigateTab('servers');
                          }}
                          className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white font-mono uppercase text-[10px] border border-sky-400"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Connection Status */}
        <div className="bg-white border border-sky-200 p-4 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-sky-100 pb-3 mb-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Recent Activity</span>
              </h2>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-[11px] text-sky-600 hover:underline font-mono"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3.5 font-mono text-xs">
              {alerts.slice(0, 4).map((alt) => (
                <div key={alt.id} className="p-3 bg-sky-50/40 border border-sky-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 ${
                      alt.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                      alt.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-sky-100 text-sky-800'
                    }`}>
                      {alt.severity}
                    </span>
                    <span className="text-[10px] text-slate-400">{alt.detectedAt}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-[11px]">{alt.title}</p>
                  <p className="text-[10px] text-slate-600 font-sans">Server: {alt.server} — Status: {alt.status}</p>
                  <p className="text-[10px] text-slate-500 font-sans">Tindakan: {alt.actionTaken}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-sky-900 text-white space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Monitoring Sinkron Aktif</span>
            </div>
            <p className="text-[11px] text-sky-200 font-sans">
              {connectionStatus}. Update terakhir: {lastUpdated}. Services: {onlineServices} online, {degradedServices} degraded, {offlineServices} offline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
