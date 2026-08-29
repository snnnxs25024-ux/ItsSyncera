import React, { useState } from 'react';
import { Server, ArrowLeft, ShieldCheck, Activity, Cpu, HardDrive, Wifi, CheckCircle2, AlertTriangle, RefreshCw, Plus, Terminal, Copy, Check, KeyRound, Cloud, PlugZap, Trash2, Pencil } from 'lucide-react';
import { ServerItem } from '../../../types/dashboard';

interface ServersViewProps {
  servers: ServerItem[];
  selectedServer: ServerItem | null;
  onSelectServer: (server: ServerItem | null) => void;
  onRefreshServers?: () => void;
}

type ConnectionType = 'agent' | 'website' | 'proxmox' | 'ssh';

const statusClass = (status: ServerItem['status']) =>
  status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
  status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
  status === 'waiting' ? 'bg-slate-50 text-slate-700 border border-slate-200' :
  status === 'maintenance' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
  'bg-rose-50 text-rose-700 border border-rose-200';

const connectionLabel = (type?: ConnectionType) =>
  type === 'website' ? 'Website / SSL Monitor' :
  type === 'proxmox' ? 'Register Proxmox API' :
  type === 'ssh' ? 'SSH Key Connector' :
  'Linux/VPS Agent';

export const ServersView: React.FC<ServersViewProps> = ({ servers, selectedServer, onSelectServer, onRefreshServers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formError, setFormError] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'saving'>('idle');
  
  // Add Server modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>('agent');
  const [serverName, setServerName] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [sshPort, setSshPort] = useState('22');
  const [sshUsername, setSshUsername] = useState('root');
  const [serverOs, setServerOs] = useState('Ubuntu 24.04 LTS');
  const [serverProvider, setServerProvider] = useState('VPS / Dedicated Server');
  const [serverLocation, setServerLocation] = useState('Jakarta DC');
  const [createdServer, setCreatedServer] = useState<(ServerItem & { installCommand?: string }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [proxmoxToken, setProxmoxToken] = useState('');
  const [proxmoxUrlMode, setProxmoxUrlMode] = useState<'hostPort' | 'fullUrl'>('fullUrl');
  const [proxmoxPort, setProxmoxPort] = useState('8006');
  const [proxmoxStatus, setProxmoxStatus] = useState<'idle' | 'connecting' | 'ok' | 'error'>('idle');
  const [proxmoxResult, setProxmoxResult] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [editingServer, setEditingServer] = useState<ServerItem | null>(null);
  const [editForm, setEditForm] = useState({ name: '', os: '', provider: '', location: '' });
  const [editStatus, setEditStatus] = useState<'idle' | 'saving'>('idle');
  const [editError, setEditError] = useState('');

  const handleDeleteServer = async (serverId: string, serverName: string) => {
    if (!window.confirm(`Hapus server "${serverName}"? Tindakan ini permanen.`)) return;
    setDeletingId(serverId);
    setDeleteError('');
    try {
      const res = await fetch(`/api/servers?id=${encodeURIComponent(serverId)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `Gagal menghapus (${res.status})`);
      if (onRefreshServers) onRefreshServers();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus server.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (srv: ServerItem) => {
    setEditingServer(srv);
    setEditForm({ name: srv.name, os: srv.os, provider: srv.provider, location: srv.location });
    setEditError('');
    setEditStatus('idle');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer) return;
    setEditError('');
    setEditStatus('saving');
    try {
      const res = await fetch(`/api/servers?id=${encodeURIComponent(editingServer.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, os: editForm.os, provider: editForm.provider, location: editForm.location }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `Gagal mengubah (${res.status})`);
      if (onRefreshServers) onRefreshServers();
      setEditingServer(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Gagal mengubah server.');
    } finally {
      setEditStatus('idle');
    }
  };

  const allServers = servers;
  const filteredServers = allServers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.ipAddress.includes(searchTerm) || s.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const resetAddForm = () => {
    setServerName('');
    setServerIp('');
    setConnectionType('agent');
    setSshPort('22');
    setSshUsername('root');
    setServerOs('Ubuntu 24.04 LTS');
    setServerProvider('VPS / Dedicated Server');
    setServerLocation('Jakarta DC');
    setCreatedServer(null);
    setCopied(false);
    setProxmoxToken('');
    setProxmoxUrlMode('fullUrl');
    setProxmoxPort('8006');
    setProxmoxStatus('idle');
    setProxmoxResult('');
    setFormError('');
    setFormStatus('idle');
  };

  const handleAddServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!serverName.trim() || !serverIp.trim()) {
      setFormError('Nama server dan IP/domain wajib diisi.');
      return;
    }
    setFormStatus('saving');
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName,
          ipAddress: serverIp,
          os: serverOs,
          provider: serverProvider,
          location: serverLocation,
          connectionType,
          connectorKind: connectionType,
          sshPort: connectionType === 'ssh' ? sshPort : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `Gagal menyimpan server (${res.status})`);
      setCreatedServer(data.server);
      if (onRefreshServers) onRefreshServers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan server.');
    } finally {
      setFormStatus('idle');
    }
  };

  const setupReference = (serverId: string) => {
    if (connectionType === 'agent' && createdServer?.installCommand) return createdServer.installCommand;
    if (connectionType === 'website') return `Website monitor active: ${serverIp}`;
    if (connectionType === 'proxmox') return `Next: add Proxmox API token for ${serverIp}`;
    return `Next: add SSH key for ${serverIp}:${sshPort}`;
  };

  const copyAgentCommand = (serverId: string) => {
    const cmd = setupReference(serverId);
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProxmoxTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdServer) return;
    setFormError('');
    setProxmoxStatus('connecting');
    setProxmoxResult('');
    try {
      const res = await fetch('/api/connectors/proxmox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: createdServer.id, token: proxmoxToken, host: serverIp, port: proxmoxPort, urlMode: proxmoxUrlMode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menghubungkan Proxmox');
      setProxmoxStatus('ok');
      setProxmoxResult(`Connected · PVE ${data.metrics?.version || '?'} · CPU ${data.metrics?.cpuUsage ?? 0}% · RAM ${data.metrics?.memoryUsage ?? 0}%`);
      if (onRefreshServers) onRefreshServers();
    } catch (err) {
      setProxmoxStatus('error');
      setProxmoxResult(err instanceof Error ? err.message : 'Gagal menghubungkan Proxmox');
    }
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
            <span className="text-[11px] font-mono text-slate-500">Last health check: {selectedServer.lastSeen || selectedServer.lastCheck}</span>
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
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold ${statusClass(selectedServer.status)}`}>
                    {selectedServer.status === 'waiting' ? 'waiting' : selectedServer.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">IP: {selectedServer.ipAddress} • {selectedServer.provider}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-sky-50/50 border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Connection Type</span>
                <span className="font-bold text-slate-900">{connectionLabel(selectedServer.connectionType as ConnectionType)}</span>
              </div>
              <div className="p-2.5 bg-sky-50/50 border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Last Seen</span>
                <span className="font-bold text-slate-900">{selectedServer.lastSeen || selectedServer.lastCheck}</span>
              </div>
              <div className="p-2.5 bg-sky-50/50 border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Uptime 30d</span>
                <span className="font-bold text-slate-900">{selectedServer.uptime30d || '-'}</span>
              </div>
            </div>
          </div>

          {selectedServer.connectionStatus && (
            <div className="p-4 bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs">
              <span className="font-bold uppercase">Connection Status:</span> {selectedServer.connectionStatus}
            </div>
          )}

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
                  <span className="font-bold text-slate-900">{selectedServer.name}</span>
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
                  <span className="text-slate-500">Provider:</span>
                  <span className="font-bold text-slate-900">{selectedServer.provider}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-100">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-slate-900">{selectedServer.location}</span>
                </div>
              </div>
            </div>

            {/* Monitoring Metrics */}
            <div className="p-5 bg-sky-50/35 border border-sky-200 space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Resource Monitoring</span>
              </h2>
              <div className="space-y-3 font-mono text-xs">
                {[
                  ['CPU Usage', selectedServer.cpuUsage],
                  ['Memory (RAM) Usage', selectedServer.memoryUsage],
                  ['Storage Usage', selectedServer.storageUsage]
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-bold text-slate-900">{value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2">
                      <div className={`${Number(value) > 85 ? 'bg-rose-500' : Number(value) > 70 ? 'bg-amber-500' : 'bg-sky-500'} h-full`} style={{ width: `${value}%` }}></div>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 bg-white border border-sky-100">
                    <span className="text-[10px] text-slate-500 block uppercase">Backup</span>
                    <span className="font-bold text-slate-900">{selectedServer.backupStatus || 'Not configured'}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-sky-100">
                    <span className="text-[10px] text-slate-500 block uppercase">SSL</span>
                    <span className="font-bold text-slate-900">{selectedServer.sslStatus || 'Not checked'}</span>
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
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Server Fleet</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Server Fleet</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Daftar server client, tipe koneksi, status telemetry, backup, SSL, dan last seen.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => { resetAddForm(); setIsAddModalOpen(true); }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold flex items-center space-x-2 border border-sky-400 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Server</span>
          </button>
          <button
            onClick={onRefreshServers}
            className="px-4 py-2 bg-white hover:bg-sky-50 text-slate-700 font-mono text-xs uppercase font-bold flex items-center space-x-2 border border-sky-200 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
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
            <option value="waiting">Waiting</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          ['Total Server', allServers.length, 'text-slate-900'],
          ['Online', allServers.filter(s => s.status === 'active').length, 'text-emerald-600'],
          ['Warning', allServers.filter(s => s.status === 'warning').length, 'text-amber-600'],
          ['Critical', allServers.filter(s => s.status === 'critical').length, 'text-rose-600'],
          ['Waiting', allServers.filter(s => s.status === 'waiting').length, 'text-slate-600']
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white border border-sky-200 p-4 shadow-xs">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">{label}</span>
            <span className={`font-mono text-2xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Add Server Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sky-300 max-w-3xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-sky-100 pb-4">
              <div className="flex items-center space-x-2">
                <PlugZap className="w-5 h-5 text-sky-600" />
                <h3 className="font-mono font-bold uppercase text-sm text-slate-900">Add Server Connection</h3>
              </div>
              <button 
                onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                className="text-slate-400 hover:text-slate-700 font-mono text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {!createdServer ? (
              <form onSubmit={handleAddServerSubmit} className="space-y-5 font-mono text-xs">
                <div>
                  <label className="block text-slate-600 mb-2 font-bold uppercase">Connection Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { id: 'agent' as ConnectionType, label: 'Linux/VPS Agent', desc: 'Data lengkap: CPU, RAM, disk, uptime. Client jalankan 1 command.', icon: Terminal },
                      { id: 'website' as ConnectionType, label: 'Website Monitor', desc: 'Langsung cek up/down, latency, HTTPS. Tanpa akses server.', icon: Wifi },
                      { id: 'proxmox' as ConnectionType, label: 'Proxmox API', desc: 'Register endpoint dulu. Token connector aman tahap berikutnya.', icon: Cloud },
                      { id: 'ssh' as ConnectionType, label: 'SSH Key', desc: 'Register endpoint dulu. Key vault aman tahap berikutnya.', icon: KeyRound }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setConnectionType(item.id)}
                          className={`text-left p-4 border shadow-xs transition-colors ${connectionType === item.id ? 'bg-sky-500 text-white border-sky-400' : 'bg-sky-50/40 text-slate-700 border-sky-200 hover:border-sky-400'}`}
                        >
                          <Icon className="w-5 h-5 mb-3" />
                          <span className="block font-bold uppercase text-[11px]">{item.label}</span>
                          <span className={`block text-[10px] mt-1 font-sans ${connectionType === item.id ? 'text-sky-50' : 'text-slate-500'}`}>{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Server Name / Hostname</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: vps-client-01"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">IP / Domain</label>
                    <input
                      type="text"
                      required
                      placeholder={connectionType === 'website' ? 'https://example.com' : connectionType === 'proxmox' ? 'proxmox.example.com' : '123.123.123.123'}
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  {connectionType === 'ssh' && (
                    <>
                      <div>
                        <label className="block text-slate-600 mb-1 font-bold">SSH Port</label>
                        <input
                          type="number"
                          value={sshPort}
                          onChange={(e) => setSshPort(e.target.value)}
                          className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-bold">Username</label>
                        <input
                          type="text"
                          value={sshUsername}
                          onChange={(e) => setSshUsername(e.target.value)}
                          className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Operating System</label>
                    <input
                      type="text"
                      value={serverOs}
                      onChange={(e) => setServerOs(e.target.value)}
                      className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Provider</label>
                    <input
                      type="text"
                      value={serverProvider}
                      onChange={(e) => setServerProvider(e.target.value)}
                      className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold">Location</label>
                    <input
                      type="text"
                      value={serverLocation}
                      onChange={(e) => setServerLocation(e.target.value)}
                      className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 font-sans text-[11px]">
                  {connectionType === 'website'
                    ? 'Website Monitor langsung cek HTTP/HTTPS setelah disimpan.'
                    : connectionType === 'agent'
                      ? 'Setelah tersimpan, jalankan install command sekali di server. Data CPU/RAM/disk akan masuk otomatis tiap 1 menit.'
                      : 'Target disimpan dulu. Credential aman untuk Proxmox/SSH dibuat di tahap berikutnya, tidak disimpan di frontend.'}
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-sans text-[11px]">
                    {formError}
                  </div>
                )}

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 uppercase font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formStatus === 'saving'}
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white uppercase font-bold border border-sky-400 shadow-xs"
                  >
                    {formStatus === 'saving' ? 'Saving...' : 'Add Server'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connection "{createdServer.name}" berhasil dibuat.</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Connection Type: {connectionLabel(createdServer.connectionType as ConnectionType)}. {connectionType === 'website' ? 'Probe awal sudah dijalankan.' : connectionType === 'agent' ? 'Jalankan command di bawah untuk mulai telemetry real.' : 'Data tersimpan permanen di database.'}
                  </p>
                </div>

                {connectionType === 'proxmox' && (
                  <form onSubmit={handleProxmoxTokenSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setProxmoxUrlMode('fullUrl')}
                        className={`p-3 border text-left ${proxmoxUrlMode === 'fullUrl' ? 'bg-sky-500 text-white border-sky-400' : 'bg-sky-50/40 text-slate-700 border-sky-200'}`}
                      >
                        <span className="block font-bold uppercase text-[11px]">Full URL</span>
                        <span className={`block text-[10px] mt-1 font-sans ${proxmoxUrlMode === 'fullUrl' ? 'text-sky-50' : 'text-slate-500'}`}>Untuk reverse proxy: https://server.kidut.online</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProxmoxUrlMode('hostPort')}
                        className={`p-3 border text-left ${proxmoxUrlMode === 'hostPort' ? 'bg-sky-500 text-white border-sky-400' : 'bg-sky-50/40 text-slate-700 border-sky-200'}`}
                      >
                        <span className="block font-bold uppercase text-[11px]">IP/DNS + Port</span>
                        <span className={`block text-[10px] mt-1 font-sans ${proxmoxUrlMode === 'hostPort' ? 'text-sky-50' : 'text-slate-500'}`}>Default Proxmox: domain/IP + 8006</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className={proxmoxUrlMode === 'hostPort' ? 'md:col-span-2' : 'md:col-span-3'}>
                        <label className="block font-bold text-slate-700 mb-1">Proxmox API Token</label>
                        <input
                          type="password"
                          required
                          placeholder="root@pam!syncera=xxxx-xxxx-..."
                          value={proxmoxToken}
                          onChange={(e) => setProxmoxToken(e.target.value)}
                          className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      {proxmoxUrlMode === 'hostPort' && (
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Port API</label>
                          <input
                            type="text"
                            value={proxmoxPort}
                            onChange={(e) => setProxmoxPort(e.target.value)}
                            className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={proxmoxStatus === 'connecting'}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white uppercase font-bold text-[11px] border border-emerald-400 shadow-xs"
                    >
                      {proxmoxStatus === 'connecting' ? 'Menghubungkan...' : 'Test & Connect Proxmox'}
                    </button>
                    {proxmoxResult && (
                      <div className={`p-2.5 border text-[11px] font-sans ${proxmoxStatus === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                        {proxmoxResult}
                      </div>
                    )}
                  </form>
                )}

                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Setup reference:</label>
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-none font-mono text-[11px] flex items-center justify-between overflow-x-auto">
                    <code>{setupReference(createdServer.id)}</code>
                    <button
                      onClick={() => copyAgentCommand(createdServer.id)}
                      className="ml-2 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white uppercase text-[10px] flex items-center space-x-1 shrink-0"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
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
                    Selesai & Lihat Server
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs">
          {deleteError}
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
                <th className="p-4">Connection Type</th>
                <th className="p-4">IP / Domain</th>
                <th className="p-4">CPU/RAM/Disk</th>
                <th className="p-4">Uptime</th>
                <th className="p-4">Backup</th>
                <th className="p-4">SSL</th>
                <th className="p-4">Last Seen</th>
                <th className="p-4 text-right">Action</th>
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
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold ${statusClass(srv.status)}`}>
                      {srv.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-[11px]">{connectionLabel(srv.connectionType as ConnectionType)}</td>
                  <td className="p-4 text-slate-900 font-bold">{srv.ipAddress}</td>
                  <td className="p-4 text-[11px] text-slate-700">
                    CPU {srv.cpuUsage}% / RAM {srv.memoryUsage}% / Disk {srv.storageUsage}%
                  </td>
                  <td className="p-4 text-slate-600">{srv.uptime30d || '-'}</td>
                  <td className="p-4 text-slate-600">{srv.backupStatus || 'Not configured'}</td>
                  <td className="p-4 text-slate-600">{srv.sslStatus || 'Not checked'}</td>
                  <td className="p-4 text-slate-500 text-[11px]">{srv.lastSeen || srv.lastCheck}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onSelectServer(srv)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-mono uppercase text-[10px] border border-sky-400 font-bold shadow-xs"
                    >
                      View Detail
                    </button>
                    <button
                      onClick={() => openEditModal(srv)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-mono uppercase text-[10px] border border-sky-200 font-bold shadow-xs inline-flex items-center space-x-1"
                      title="Edit server"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteServer(srv.id, srv.name)}
                      disabled={deletingId === srv.id}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-mono uppercase text-[10px] border border-rose-200 font-bold shadow-xs inline-flex items-center space-x-1"
                      title="Hapus server"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{deletingId === srv.id ? '...' : 'Hapus'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Server Modal */}
      {editingServer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sky-300 max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-sky-100 pb-4">
              <div className="flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-sky-600" />
                <h3 className="font-mono font-bold uppercase text-sm text-slate-900">Edit Server</h3>
              </div>
              <button
                onClick={() => setEditingServer(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-600 mb-1 font-bold">Server Name / Hostname</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-600 mb-1 font-bold">Operating System</label>
                  <input
                    type="text"
                    value={editForm.os}
                    onChange={(e) => setEditForm({ ...editForm, os: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Provider</label>
                  <input
                    type="text"
                    value={editForm.provider}
                    onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-sky-50/50 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-sans text-[11px]">
                  {editError}
                </div>
              )}
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingServer(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 uppercase font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editStatus === 'saving'}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white uppercase font-bold border border-sky-400 shadow-xs"
                >
                  {editStatus === 'saving' ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
