import { proxmoxBaseUrl } from '../connectors/proxmox';

type Row = Record<string, any>;

type ProxmoxMetrics = {
  nodeName?: string;
  version?: string;
  services?: unknown[];
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage?: number;
};

const isProxmox = (server: Row) => String(server.connection_type ?? server.connectionType ?? '') === 'proxmox';
const hasToken = (server: Row) => Boolean(String(server.proxmox_token ?? server.proxmoxToken ?? '').trim());

export const findProxmoxServer = (servers: Row[], serverId?: string) => {
  const candidates = serverId ? servers.filter((server) => String(server.id) === serverId) : servers;
  const server = candidates.find(isProxmox);
  if (!server) throw new Error('Server Proxmox tidak ditemukan');
  if (!hasToken(server)) throw new Error('Server Proxmox belum punya token. Connect Proxmox dulu di menu Servers.');
  return server;
};

export const proxmoxServerBase = (server: Row) => proxmoxBaseUrl({
  urlMode: server.proxmox_url_mode === 'fullUrl' ? 'fullUrl' : 'hostPort',
  host: String(server.proxmox_host || server.ip_address || server.ipAddress || ''),
  port: String(server.proxmox_port || '8006'),
});

export const proxmoxAutomationMessage = (serverName: string, metrics: ProxmoxMetrics) =>
  `Proxmox health OK: ${serverName} · node ${metrics.nodeName || 'node'} · PVE ${metrics.version || '?'} · VM/CT ${(metrics.services || []).length} · CPU ${metrics.cpuUsage ?? 0}% · RAM ${metrics.memoryUsage ?? 0}% · Disk ${metrics.storageUsage ?? 0}%`;
