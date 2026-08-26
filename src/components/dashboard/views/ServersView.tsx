import React, { useState } from 'react';
import { Server, ArrowLeft, ShieldCheck, Activity, Cpu, HardDrive, Wifi, CheckCircle2, AlertTriangle, RefreshCw, Plus, Terminal, Copy, Check } from 'lucide-react';
import { ServerItem } from '../../../types/dashboard';

interface ServersViewProps {
  servers: ServerItem[];
  selectedServer: ServerItem | null;
  onSelectServer: (server: ServerItem | null) => void;
  onRefreshServers?: () => void;
}

export const ServersView: React.FC<ServersViewProps> = ({ servers, selectedServer, onSelectServer, onRefreshServers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Add Server & Test Agent Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverIp, setServerIp] = useState('127.0.0.1');
  const [serverOs, setServerOs] = useState('Ubuntu 24.04 LTS');
  const [serverProvider, setServerProvider] = useState('Local PC / On-Premise');
  const [submitting, setSubmitting] = useState(false);
  const [createdServer, setCreatedServer] = useState<ServerItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredServers = servers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.ipAddress.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName || !serverIp) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName,
          ipAddress: serverIp,
          os: serverOs,
          provider: serverProvider
        })
      });
      const data = await res.json();
      if (data.success) {
        setCreatedServer(data.server);
        if (onRefreshServers) onRefreshServers();
      }
    } catch (err) {
      console.error('Failed to add server', err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyAgentCommand = (serverId: string) => {
    const cmd = `curl -sSL http://localhost:3000/api/agent-script/${serverId} -o agent.js && node agent.js`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (selectedServer) {
    return (
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectServer(null)}
            className="px-3.5 py-2 bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 font-mono text-xs uppercase flex items-center space-x-2 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Server</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-500">Last health check: {selectedServer.lastCheck}</span>
            <button 
              onClick={() => alert(`Memulai health check manual untuk ${selectedServer.name}...`)}
              className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase border border-sky-400 flex items-center space-x-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Probe Now</span>
            </button>
          </div>
        </div>

        {/* Server Detail Card */}
        <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-sky-100 pb-5 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-sky-500 flex items-center justify-center text-white border border-sky-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-mono font-bold uppercase tracking-wide text-slate-900">{selectedServer.name}</h1>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                    selectedServer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    selectedServer.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {selectedServer.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">IP: {selectedServer.ipAddress} • {selectedServer.provider}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-sky-50/50 border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Location</span>
                <span className="font-bold text-slate-900">{selectedServer.location}</span>
              </div>
              <div className="p-2.5 bg-sky-50/50 border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Traffic</span>
                <span className="font-bold text-slate-900">{selectedServer.networkTraffic}</span>
              </div>
            </div>
          </div>

          {/* System Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-sky-50/35 border border-sky-200 space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Server Information</span>
              </h2>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-slate-500">Hostname:</span>
                  <span className="font-bold text-slate-900">{selectedServer.name}.syncera.internal</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-slate-500">Operating System:</span>
                  <span className="font-bold text-slate-900">{selectedServer.os}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="font-bold text-slate-900">{selectedServer.ipAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-slate-500">Infrastructure Provider:</span>
                  <span className="font-bold text-slate-900">{selectedServer.provider}</span>
                </div>
              </div>
            </div>

            {/* Monitoring Metrics */}
            <div className="p-5 bg-sky-50/35 border border-sky-200 space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Real-time Resource Monitoring</span>
              </h2>
              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">CPU Usage</span>
                    <span className="font-bold text-slate-900">{selectedServer.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2">
                    <div className="bg-sky-500 h-full" style={{ width: `${selectedServer.cpuUsage}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Memory (RAM) Usage</span>
                    <span className="font-bold text-slate-900">{selectedServer.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2">
                    <div className="bg-sky-500 h-full" style={{ width: `${selectedServer.memoryUsage}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Storage (NVMe) Usage</span>
                    <span className="font-bold text-slate-900">{selectedServer.storageUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2">
                    <div className="bg-sky-500 h-full" style={{ width: `${selectedServer.storageUsage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Statuses */}
          <div className="space-y-3 pt-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              Active Services & Containers Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedServer.services.map((svc, idx) => (
                <div key={idx} className="p-4 bg-sky-50/50 border border-sky-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      svc.status === 'online' ? 'bg-emerald-500' :
                      svc.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></span>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">{svc.status}</span>
                  </div>
                  <p className="font-mono font-bold text-slate-900 text-xs">{svc.name}</p>
                  <p className="font-mono text-[11px] text-slate-600">Response time: {svc.response}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-sky-200 p-6 shadow-xs">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Infrastructure Management</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">My Servers Fleet</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Daftar seluruh virtual private server dan dedicated cluster milik perusahaan Anda.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => { setCreatedServer(null); setIsAddModalOpen(true); }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold flex items-center space-x-2 border border-sky-400 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Server & Test Local Agent</span>
          </button>
          <input
            type="text"
            placeholder="Cari server / IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-sky-50/40 border border-sky-200 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500 w-full sm:w-56"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-sky-50/40 border border-sky-200 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Add Server & Test Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sky-300 max-w-lg w-full p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-sky-100 pb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-sky-600" />
                <h3 className="font-mono font-bold uppercase text-sm text-slate-900">Hubungkan Server / PC Lokal untuk Test Real</h3>
              </div>
              <button 
                onClick={() => { setIsAddModalOpen(false); setCreatedServer(null); }}
                className="text-slate-400 hover:text-slate-700 font-mono text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {!createdServer ? (
              <form onSubmit={handleAddServerSubmit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Nama Server / Hostname</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: my-local-macbook atau vps-sg-01"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Alamat IP / Host</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: 127.0.0.1"
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Sistem Operasi</label>
                    <input
                      type="text"
                      value={serverOs}
                      onChange={(e) => setServerOs(e.target.value)}
                      className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Provider / Lokasi</label>
                    <input
                      type="text"
                      value={serverProvider}
                      onChange={(e) => setServerProvider(e.target.value)}
                      className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 uppercase font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white uppercase font-bold border border-sky-400 shadow-xs"
                  >
                    {submitting ? 'Mendaftarkan...' : 'Daftarkan & Generate Agent'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Server "{createdServer.name}" Berhasil Didaftarkan!</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Untuk mulai mengirim data telemetri real (CPU & RAM) dari komputer/server Anda ke dashboard ini, jalankan perintah berikut di terminal komputer Anda:
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Perintah Agent Test (Node.js):</label>
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-none font-mono text-[11px] flex items-center justify-between overflow-x-auto">
                    <code>curl -sSL http://localhost:3000/api/agent-script/{createdServer.id} -o agent.js && node agent.js</code>
                    <button
                      onClick={() => copyAgentCommand(createdServer.id)}
                      className="ml-2 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white uppercase text-[10px] flex items-center space-x-1 shrink-0"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    * Pastikan Node.js terinstal di mesin Anda. Script ini akan mengirim metrik CPU dan RAM secara real-time setiap 5 detik.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCreatedServer(null);
                      if (onRefreshServers) onRefreshServers();
                    }}
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white uppercase font-bold shadow-xs"
                  >
                    Selesai & Lihat Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Servers Table */}
      <div className="bg-white border border-sky-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase">
              <tr>
                <th className="p-4">Server Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Operating System</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Resource (CPU/RAM)</th>
                <th className="p-4">Last Check</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {filteredServers.map((srv) => (
                <tr key={srv.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="p-4 font-bold text-slate-900 flex items-center space-x-2.5">
                    <Server className="w-4 h-4 text-sky-600" />
                    <span>{srv.name}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${
                      srv.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      srv.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {srv.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{srv.os}</td>
                  <td className="p-4 text-slate-900 font-bold">{srv.ipAddress}</td>
                  <td className="p-4 text-slate-600">{srv.provider}</td>
                  <td className="p-4">
                    <div className="text-[11px] text-slate-700 font-mono">
                      CPU: {srv.cpuUsage}% | RAM: {srv.memoryUsage}%
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 text-[11px]">{srv.lastCheck}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onSelectServer(srv)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-mono uppercase text-[10px] border border-sky-400 font-bold shadow-xs"
                    >
                      View Detail
                    </button>
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
