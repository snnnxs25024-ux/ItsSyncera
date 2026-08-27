type Row = Record<string, any>;

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

const now = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });
const tokenFor = async (serverId: string) => {
  const { createHmac } = await import('node:crypto');
  if (!supabaseKey) throw new ApiError(500, 'SUPABASE key missing');
  return createHmac('sha256', supabaseKey).update(serverId).digest('hex').slice(0, 48);
};
const number = (value: unknown, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const serviceStatus = (value: unknown) => ['online', 'degraded', 'offline'].includes(String(value)) ? String(value) : 'offline';

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
  connectionType: row.connection_type ?? row.connectionType ?? 'agent',
  connectionStatus: row.connection_status ?? row.connectionStatus ?? 'Agent online',
  uptime30d: row.uptime_30d ?? row.uptime30d ?? '-',
  backupStatus: row.backup_status ?? row.backupStatus ?? 'Not configured',
  sslStatus: row.ssl_status ?? row.sslStatus ?? 'Not checked',
  lastSeen: row.last_seen ?? row.lastSeen ?? row.last_check ?? 'Never',
  services: Array.isArray(row.services) ? row.services : [],
});

const bodyOf = (req: any) => typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    const body = bodyOf(req);
    const serverId = String(body.serverId || body.server_id || '').trim();
    const token = String(body.token || '').trim();
    if (!serverId || token !== await tokenFor(serverId)) throw new ApiError(401, 'Agent token tidak valid');

    const cpu = number(body.cpuUsage ?? body.cpu_usage);
    const mem = number(body.memoryUsage ?? body.memory_usage);
    const disk = number(body.storageUsage ?? body.storage_usage);
    const status = cpu > 90 || mem > 90 || disk > 90 ? 'critical' : cpu > 75 || mem > 75 || disk > 80 ? 'warning' : 'active';
    const stamp = now();
    const services = Array.isArray(body.services) ? body.services.slice(0, 12).map((svc: Row) => ({
      name: String(svc.name || 'service').slice(0, 60),
      status: serviceStatus(svc.status),
      response: String(svc.response || '-').slice(0, 80),
    })) : [];

    const patch = {
      status,
      os: String(body.os || 'Unknown OS').slice(0, 80),
      cpu_usage: cpu,
      memory_usage: mem,
      storage_usage: disk,
      network_traffic: String(body.networkTraffic || body.network_traffic || '-').slice(0, 80),
      last_check: stamp,
      connection_type: 'agent',
      connection_status: 'Agent online',
      uptime_30d: String(body.uptime || body.uptime30d || '-').slice(0, 80),
      last_seen: stamp,
      services,
      updated_at: new Date().toISOString(),
    };

    const out = await fetch(`${baseUrl}/rest/v1/servers?id=eq.${encodeURIComponent(serverId)}`, {
      method: 'PATCH',
      headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify(patch),
    });
    const text = await out.text();
    if (!out.ok) throw new ApiError(out.status, text || `heartbeat failed: ${out.status}`);
    const rows = JSON.parse(text || '[]');
    if (!rows[0]) throw new ApiError(404, 'Server tidak ditemukan');
    return res.status(200).json({ success: true, server: mapServer(rows[0]) });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'heartbeat failed' });
  }
}
