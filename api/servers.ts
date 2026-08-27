type Row = Record<string, any>;
type ConnectionType = 'ssh' | 'agent' | 'proxmox';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const baseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://Supa.kidut.online')
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

const readTable = async (table: string) => {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, { headers: headers() });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `${table}: ${res.status} ${body.slice(0, 160)}`.trim());
  return JSON.parse(body || '[]') as Row[];
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
  connectionType: row.connection_type ?? row.connectionType ?? 'ssh',
  connectionStatus: row.connection_status ?? row.connectionStatus ?? 'Waiting for Backend',
  uptime30d: row.uptime_30d ?? row.uptime30d ?? '-',
  backupStatus: row.backup_status ?? row.backupStatus ?? 'Not configured',
  sslStatus: row.ssl_status ?? row.sslStatus ?? 'Not checked',
  lastSeen: row.last_seen ?? row.lastSeen ?? row.last_check ?? 'Never',
  services: Array.isArray(row.services) ? row.services : [],
});

const clean = (value: unknown, max = 120) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'server';

const normalizeHost = (value: string) => {
  const raw = value.trim();
  try {
    if (/^https?:\/\//i.test(raw)) return new URL(raw).host;
  } catch {
    throw new ApiError(400, 'IP/domain tidak valid');
  }
  return raw;
};

const connectionStatus = (type: ConnectionType, host: string, port?: string) => {
  if (type === 'ssh') return `Waiting for Backend: SSH ${host}${port ? `:${port}` : ''}`;
  if (type === 'proxmox') return `Waiting for Backend: Proxmox API ${host}`;
  return 'Waiting for Agent: install belum dijalankan';
};

const createServerRecord = async (input: Row) => {
  const name = clean(input.name, 80);
  const ipAddress = normalizeHost(clean(input.ipAddress ?? input.ip_address, 160));
  const connectionType = clean(input.connectionType ?? input.connection_type, 20) as ConnectionType;
  const sshPort = clean(input.sshPort, 8);

  if (name.length < 2) throw new ApiError(400, 'Nama server minimal 2 karakter');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 ._-]{1,79}$/.test(name)) throw new ApiError(400, 'Nama server hanya boleh huruf, angka, spasi, titik, dash, underscore');
  if (!/^[a-zA-Z0-9.-]+(?::\d{1,5})?$/.test(ipAddress)) throw new ApiError(400, 'IP/domain tidak valid');
  if (!['ssh', 'agent', 'proxmox'].includes(connectionType)) throw new ApiError(400, 'Connection type tidak valid');
  if (connectionType === 'ssh' && sshPort && (!/^\d{1,5}$/.test(sshPort) || Number(sshPort) < 1 || Number(sshPort) > 65535)) {
    throw new ApiError(400, 'SSH port tidak valid');
  }

  // ponytail: list-scan OK sampai ratusan server; upgrade ke unique index + filtered query saat multi-tenant.
  const duplicate = (await readTable('servers')).find((row) => String(row.name ?? '').toLowerCase() === name.toLowerCase() || String(row.ip_address ?? '').toLowerCase() === ipAddress.toLowerCase());
  if (duplicate) throw new ApiError(409, `Server sudah ada: ${duplicate.name}`);

  const row = {
    id: `srv-${slug(name)}-${Date.now().toString(36)}`,
    name,
    status: 'waiting',
    os: clean(input.os, 80) || 'Unknown OS',
    ip_address: ipAddress,
    provider: clean(input.provider, 80) || 'Unknown Provider',
    location: clean(input.location, 80) || 'Unknown Location',
    cpu_usage: 0,
    memory_usage: 0,
    storage_usage: 0,
    network_traffic: '-',
    last_check: 'Never',
    connection_type: connectionType,
    connection_status: connectionStatus(connectionType, ipAddress, sshPort),
    uptime_30d: '-',
    backup_status: 'Not configured',
    ssl_status: 'Not checked',
    last_seen: 'Never',
    services: [],
  };

  const res = await fetch(`${baseUrl}/rest/v1/servers`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(res.status, body || `insert failed: ${res.status}`);
  return mapServer(JSON.parse(body)[0]);
};

const bodyOf = (req: any) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') return res.status(200).json({ success: true, servers: (await readTable('servers')).map(mapServer) });
    if (req.method === 'POST') return res.status(201).json({ success: true, server: await createServerRecord(bodyOf(req)) });
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'servers request failed' });
  }
}
