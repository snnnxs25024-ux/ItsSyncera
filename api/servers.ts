import { createHmac } from 'node:crypto';

type Row = Record<string, any>;
type PublicConnectionType = 'ssh' | 'agent' | 'proxmox' | 'website';
type StoredConnectionType = 'ssh' | 'agent' | 'proxmox';

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

const now = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });
const clean = (value: unknown, max = 120) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'server';

const headers = (extra: Record<string, string> = {}) => {
  if (!supabaseKey) throw new ApiError(500, 'SUPABASE key missing');
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: 'application/json',
    ...extra,
  };
};

const readTable = async (table: string) => {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, { headers: headers() });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `${table}: ${res.status} ${body.slice(0, 160)}`.trim());
  return JSON.parse(body || '[]') as Row[];
};

const mapConnectionType = (row: Row): PublicConnectionType => {
  if (String(row.connection_status ?? '').startsWith('Website Monitor:') || row.provider === 'Website Monitor') return 'website';
  return (row.connection_type ?? row.connectionType ?? 'ssh') as PublicConnectionType;
};

const mapServer = (row: Row) => ({
  id: String(row.id),
  name: row.name ?? row.hostname ?? 'unnamed-server',
  status: row.status ?? 'waiting',
  os: row.os ?? 'Unknown OS',
  ipAddress: row.ip_address ?? row.ipAddress ?? row.host ?? '-',
  provider: row.provider ?? 'Unknown Provider',
  location: row.location ?? 'Unknown Location',
  cpuUsage: Number(row.cpu_usage ?? row.cpuUsage ?? 0),
  memoryUsage: Number(row.memory_usage ?? row.memoryUsage ?? 0),
  storageUsage: Number(row.storage_usage ?? row.storageUsage ?? 0),
  networkTraffic: row.network_traffic ?? row.networkTraffic ?? '-',
  lastCheck: row.last_check ?? row.lastCheck ?? 'Never',
  connectionType: mapConnectionType(row),
  connectionStatus: row.connection_status ?? row.connectionStatus ?? 'Waiting for Backend',
  uptime30d: row.uptime_30d ?? row.uptime30d ?? '-',
  backupStatus: row.backup_status ?? row.backupStatus ?? 'Not configured',
  sslStatus: row.ssl_status ?? row.sslStatus ?? 'Not checked',
  lastSeen: row.last_seen ?? row.lastSeen ?? row.last_check ?? 'Never',
  services: Array.isArray(row.services) ? row.services : [],
});

const normalizeHost = (value: string) => {
  const raw = value.trim();
  try {
    if (/^https?:\/\//i.test(raw)) return new URL(raw).host;
  } catch {
    throw new ApiError(400, 'IP/domain tidak valid');
  }
  return raw;
};

const normalizeWebsite = (value: string) => {
  const raw = value.trim();
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error('bad url');
    return url.href.replace(/\/$/, '');
  } catch {
    throw new ApiError(400, 'URL website tidak valid');
  }
};

const connectionStatus = (type: StoredConnectionType, host: string, port?: string) => {
  if (type === 'ssh') return `Waiting for SSH key connector: ${host}${port ? `:${port}` : ''}`;
  if (type === 'proxmox') return `Waiting for Proxmox API token: ${host}`;
  return 'Waiting for Agent heartbeat';
};

const agentToken = (serverId: string) => {
  if (!supabaseKey) throw new ApiError(500, 'SUPABASE key missing');
  return createHmac('sha256', supabaseKey).update(serverId).digest('hex').slice(0, 48);
};

const appOrigin = (req: any) => {
  const host = req.headers?.host;
  const proto = String(req.headers?.['x-forwarded-proto'] || (host?.startsWith('localhost') || host?.startsWith('127.') ? 'http' : 'https')).split(',')[0];
  if (host) return `${proto}://${host}`;
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://sync.ipt.solutions';
};

const installCommand = (req: any, serverId: string) => `curl -fsSL ${appOrigin(req)}/api/agent/install | sudo bash -s -- ${serverId} ${agentToken(serverId)}`;

const probeWebsite = async (url: string) => {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    const ms = Date.now() - started;
    res.body?.cancel().catch(() => undefined);
    const ok = res.status < 400;
    return {
      status: ok ? 'active' : 'critical',
      networkTraffic: `${ms}ms`,
      connectionStatus: `Website Monitor: HTTP ${res.status} in ${ms}ms`,
      sslStatus: new URL(res.url || url).protocol === 'https:' ? 'HTTPS OK' : 'No HTTPS',
      lastSeen: now(),
      services: [{ name: 'HTTP', status: ok ? 'online' : 'offline', response: `${res.status} ${ms}ms` }],
    };
  } catch (err) {
    const ms = Date.now() - started;
    return {
      status: 'critical',
      networkTraffic: `${ms}ms`,
      connectionStatus: `Website Monitor: ${err instanceof Error ? err.message : 'request failed'}`,
      sslStatus: url.startsWith('https://') ? 'HTTPS check failed' : 'Not checked',
      lastSeen: now(),
      services: [{ name: 'HTTP', status: 'offline', response: `failed ${ms}ms` }],
    };
  } finally {
    clearTimeout(timeout);
  }
};

const createServerRecord = async (input: Row, req: any) => {
  const name = clean(input.name, 80);
  const requestedType = clean(input.connectorKind ?? input.connectionType ?? input.connection_type, 20) as PublicConnectionType;
  const connectorKind: PublicConnectionType = requestedType || 'agent';
  const storedType: StoredConnectionType = connectorKind === 'website' ? 'agent' : connectorKind as StoredConnectionType;
  const sshPort = clean(input.sshPort, 8);

  if (name.length < 2) throw new ApiError(400, 'Nama server minimal 2 karakter');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 ._-]{1,79}$/.test(name)) throw new ApiError(400, 'Nama server hanya boleh huruf, angka, spasi, titik, dash, underscore');
  if (!['ssh', 'agent', 'proxmox', 'website'].includes(connectorKind)) throw new ApiError(400, 'Connection type tidak valid');
  if (connectorKind === 'ssh' && sshPort && (!/^\d{1,5}$/.test(sshPort) || Number(sshPort) < 1 || Number(sshPort) > 65535)) {
    throw new ApiError(400, 'SSH port tidak valid');
  }

  const ipAddress = connectorKind === 'website'
    ? normalizeWebsite(clean(input.ipAddress ?? input.ip_address, 220))
    : normalizeHost(clean(input.ipAddress ?? input.ip_address, 160));
  if (connectorKind !== 'website' && !/^[a-zA-Z0-9.-]+(?::\d{1,5})?$/.test(ipAddress)) throw new ApiError(400, 'IP/domain tidak valid');

  // ponytail: list-scan OK sampai ratusan server; upgrade ke unique index + filtered query saat multi-tenant.
  const duplicate = (await readTable('servers')).find((row) => String(row.name ?? '').toLowerCase() === name.toLowerCase() || String(row.ip_address ?? '').toLowerCase() === ipAddress.toLowerCase());
  if (duplicate) throw new ApiError(409, `Server sudah ada: ${duplicate.name}`);

  const id = `srv-${slug(name)}-${Date.now().toString(36)}`;
  const probe = connectorKind === 'website' ? await probeWebsite(ipAddress) : null;
  const stamp = now();
  const row = {
    id,
    name,
    status: probe?.status ?? 'waiting',
    os: connectorKind === 'website' ? 'HTTP endpoint' : clean(input.os, 80) || 'Unknown OS',
    ip_address: ipAddress,
    provider: connectorKind === 'website' ? 'Website Monitor' : clean(input.provider, 80) || 'Unknown Provider',
    location: connectorKind === 'website' ? 'Public Internet' : clean(input.location, 80) || 'Unknown Location',
    cpu_usage: 0,
    memory_usage: 0,
    storage_usage: 0,
    network_traffic: probe?.networkTraffic ?? '-',
    last_check: probe?.lastSeen ?? 'Never',
    connection_type: storedType,
    connection_status: probe?.connectionStatus ?? connectionStatus(storedType, ipAddress, sshPort),
    uptime_30d: '-',
    backup_status: 'Not configured',
    ssl_status: probe?.sslStatus ?? 'Not checked',
    last_seen: probe?.lastSeen ?? 'Never',
    services: probe?.services ?? [],
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${baseUrl}/rest/v1/servers`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(res.status, body || `insert failed: ${res.status}`);
  const server = mapServer(JSON.parse(body)[0]);
  return connectorKind === 'agent'
    ? { server: { ...server, installCommand: installCommand(req, server.id) }, agentToken: agentToken(server.id), installCommand: installCommand(req, server.id) }
    : { server };
};

const bodyOf = (req: any) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') return res.status(200).json({ success: true, servers: (await readTable('servers')).map(mapServer) });
    if (req.method === 'POST') {
      const out = await createServerRecord(bodyOf(req), req);
      return res.status(201).json({ success: true, ...out });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'servers request failed' });
  }
}
