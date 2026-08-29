import fs from 'fs';

export type Row = Record<string, any>;
export type ConnectionType = 'ssh' | 'agent' | 'proxmox';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const localEnv = (key: string) => {
  try {
    const text = fs.readFileSync('/opt/data/scripts/proxmox_sync_env.sh', 'utf8');
    return text.match(new RegExp(`^export\\s+${key}=(['\"]?)(.*?)\\1$`, 'm'))?.[2];
  } catch {
    return undefined;
  }
};

const baseUrl = (process.env.SUPABASE_URL || localEnv('SUPABASE_URL') || 'https://aulljwxosjdaixtzcqjx.supabase.co')
  .replace(/\/$/, '')
  .replace(/\/rest\/v1$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || localEnv('SUPABASE_SERVICE_KEY');

const headers = (extra: Record<string, string> = {}) => {
  if (!supabaseKey) throw new ApiError(500, 'SUPABASE key missing');
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: 'application/json',
    ...extra,
  };
};

export const readTable = async (table: string) => {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, { headers: headers() });
  if (!res.ok) throw new ApiError(502, `${table}: ${res.status}`);
  return res.json() as Promise<Row[]>;
};

export const mapServer = (row: Row) => ({
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

export const mapAlert = (row: Row) => ({
  id: String(row.id),
  severity: row.severity ?? 'information',
  title: row.title ?? 'Untitled alert',
  server: row.server ?? row.server_name ?? '-',
  detectedAt: row.detected_at ?? row.detectedAt ?? '-',
  status: row.status ?? 'Monitoring',
  actionTaken: row.action_taken ?? row.actionTaken ?? '-',
});

export const dashboardData = async () => {
  const [servers, alerts, automations, maintenances, backups, tickets] = await Promise.all([
    readTable('servers'),
    readTable('alerts'),
    readTable('automations'),
    readTable('maintenances'),
    readTable('backups'),
    readTable('support_tickets'),
  ]);
  return {
    servers: servers.map(mapServer),
    alerts: alerts.map(mapAlert),
    automations,
    maintenances,
    backups,
    tickets,
    source: 'supabase',
  };
};

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

export const createServerRecord = async (input: Row) => {
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
  const existing = await readTable('servers');
  const duplicate = existing.find((row) => String(row.name).toLowerCase() === name.toLowerCase() || String(row.ip_address).toLowerCase() === ipAddress.toLowerCase());
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

export const listServers = async () => (await readTable('servers')).map(mapServer);
