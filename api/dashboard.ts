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

const headers = () => {
  if (!supabaseKey) throw new ApiError(500, 'SUPABASE key missing');
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: 'application/json',
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

const mapAlert = (row: Row) => ({
  id: String(row.id),
  severity: row.severity ?? 'information',
  title: row.title ?? 'Untitled alert',
  server: row.server ?? row.server_name ?? '-',
  detectedAt: row.detected_at ?? row.detectedAt ?? '-',
  status: row.status ?? 'Monitoring',
  actionTaken: row.action_taken ?? row.actionTaken ?? '-',
});

export default async function handler(_req: any, res: any) {
  try {
    const [servers, alerts, automations, maintenances, backups, tickets] = await Promise.all([
      readTable('servers'),
      readTable('alerts'),
      readTable('automations'),
      readTable('maintenances'),
      readTable('backups'),
      readTable('support_tickets'),
    ]);
    return res.status(200).json({
      servers: servers.map(mapServer),
      alerts: alerts.map(mapAlert),
      automations,
      maintenances,
      backups,
      tickets,
      source: 'supabase',
    });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ error: err instanceof Error ? err.message : 'dashboard fetch failed' });
  }
}
