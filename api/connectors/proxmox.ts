import { createHmac } from 'node:crypto';

type Row = Record<string, any>;

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const baseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aulljwxosjdaixtzcqjx.supabase.co')
  .replace(/\/$/, '')
  .replace(/\/rest\/v1$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const headers = (extra: Record<string, string> = {}) => {
  if (!supabaseKey) throw new ApiError(500, 'SUPABASE key missing');
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: 'application/json',
    ...extra,
  };
};

const bodyOf = (req: any) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
};

// Normalize "root@pam!syncera=SECRET" -> "root@pam!syncera=SECRET" (already valid)
// Accept plain token: "root@pam!syncera=SECRET" or "PVEAPIToken=SECRET"
const normalizeToken = (token: string) => {
  const t = token.trim();
  if (!t) throw new ApiError(400, 'Token Proxmox wajib diisi');
  if (t.includes('=')) return t;
  // if just secret without user!tokenid= prefix, cannot authenticate
  throw new ApiError(400, 'Format token harus berupa user@realm!tokenid=secret');
};

// Build Authorization header for Proxmox API
const proxmoxAuth = (token: string) => `PVEAPIToken=${token}`;

// Fetch from Proxmox API with timeout
const proxmoxFetch = async (host: string, port: string, token: string, path: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const base = `https://${host}:${port}`;
    const res = await fetch(`${base}${path}`, {
      headers: { Authorization: proxmoxAuth(token), Accept: 'application/json' },
      signal: controller.signal,
    });
    if (res.status === 401) throw new ApiError(401, 'Token Proxmox tidak valid (401)');
    if (!res.ok) throw new ApiError(res.status, `Proxmox API ${res.status}`);
    const text = await res.text();
    return JSON.parse(text || '{}');
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, `Tidak dapat terhubung ke Proxmox: ${err instanceof Error ? err.message : 'unknown'}`);
  } finally {
    clearTimeout(timeout);
  }
};

// Get Proxmox node status + VM/LXC metrics
const collectProxmoxMetrics = async (host: string, port: string, token: string) => {
  const version = await proxmoxFetch(host, port, token, '/api2/json/version');
  const nodesRes = await proxmoxFetch(host, port, token, '/api2/json/nodes');
  const nodes = Array.isArray(nodesRes.data) ? nodesRes.data : [];
  const nodeName = nodes[0]?.node;
  if (!nodeName) return { version: version?.data?.version || 'unknown', services: [], status: 'active', cpuUsage: 0, memoryUsage: 0, storageUsage: 0 };

  const statusRes = await proxmoxFetch(host, port, token, `/api2/json/nodes/${nodeName}/status`);
  const status = statusRes?.data || {};
  const cpuUsage = Number(status.cpu ?? 0) * 100;
  const memoryUsage = status.memory && status.memory.total ? (status.memory.used / status.memory.total) * 100 : 0;
  const storageUsage = status.rootfs && status.rootfs.total ? (status.rootfs.used / status.rootfs.total) * 100 : 0;

  const qemuRes = await proxmoxFetch(host, port, token, `/api2/json/nodes/${nodeName}/qemu`);
  const qemu = Array.isArray(qemuRes?.data) ? qemuRes.data : [];
  const lxcRes = await proxmoxFetch(host, port, token, `/api2/json/nodes/${nodeName}/lxc`);
  const lxc = Array.isArray(lxcRes?.data) ? lxcRes.data : [];
  const services = [
    ...qemu.map((vm: Row) => ({
      name: `VM ${vm.vmid} · ${vm.name || 'unnamed'}`,
      status: vm.status === 'running' ? 'online' : 'offline',
      response: vm.status || 'unknown',
    })),
    ...lxc.map((ct: Row) => ({
      name: `CT ${ct.vmid} · ${ct.name || 'unnamed'}`,
      status: ct.status === 'running' ? 'online' : 'offline',
      response: ct.status || 'unknown',
    })),
  ];

  return {
    version: version?.data?.version || 'unknown',
    nodeName,
    cpuUsage: Math.round(cpuUsage * 10) / 10,
    memoryUsage: Math.round(memoryUsage * 10) / 10,
    storageUsage: Math.round(storageUsage * 10) / 10,
    services: services.slice(0, 12),
    uptime: status.uptime ? Math.round(status.uptime / 86400) + 'd' : '-',
  };
};

const now = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });

const readTable = async (table: string) => {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, { headers: headers() });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `${table}: ${res.status} ${body.slice(0, 160)}`.trim());
  return JSON.parse(body || '[]') as Row[];
};

const patchServer = async (id: string, patch: Row) => {
  const out = await fetch(`${baseUrl}/rest/v1/servers?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  const text = await out.text();
  if (!out.ok) throw new ApiError(out.status, text || `patch failed: ${out.status}`);
  return JSON.parse(text || '[]')[0] as Row | undefined;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const servers = await readTable('servers');
      const proxmoxServers = servers.filter((s: Row) => s.connection_type === 'proxmox');
      return res.status(200).json({
        success: true,
        servers: proxmoxServers.map((s: Row) => ({
          id: s.id,
          name: s.name,
          host: s.proxmox_host || '',
          port: s.proxmox_port || '8006',
          hasToken: Boolean(s.proxmox_token),
          status: s.status,
          connectionStatus: s.connection_status || 'Waiting for Proxmox API token',
        })),
      });
    }

    if (req.method === 'POST') {
      const body = bodyOf(req);
      const serverId = String(body.serverId || '').trim();
      const token = String(body.token || '').trim();
      const host = String(body.host || '').trim();
      const port = String(body.port || '8006').trim();
      if (!serverId) throw new ApiError(400, 'serverId wajib diisi');
      const normalized = normalizeToken(token);

      // Test connection first
      const metrics = await collectProxmoxMetrics(host || 'localhost', port, normalized);

      const patched = await patchServer(serverId, {
        proxmox_token: normalized,
        proxmox_host: host,
        proxmox_port: port,
        status: 'active',
        connection_status: `Proxmox connected · ${metrics.nodeName || 'node'} · PVE ${metrics.version}`,
        cpu_usage: metrics.cpuUsage,
        memory_usage: metrics.memoryUsage,
        storage_usage: metrics.storageUsage,
        uptime_30d: metrics.uptime,
        services: metrics.services,
        last_seen: now(),
        last_check: now(),
      });

      return res.status(200).json({ success: true, server: patched, metrics });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'proxmox connector failed' });
  }
}