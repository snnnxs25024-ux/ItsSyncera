import {
  AlertItem,
  AutomationItem,
  AutomationRule,
  AutomationRun,
  BackupItem,
  MaintenanceItem,
  MetricSnapshot,
  ServerItem,
  SupportTicket,
} from '../types/dashboard';
export interface DashboardData {
  servers: ServerItem[];
  alerts: AlertItem[];
  automations: AutomationItem[];
  automationRules: AutomationRule[];
  automationRuns: AutomationRun[];
  maintenances: MaintenanceItem[];
  backups: BackupItem[];
  tickets: SupportTicket[];
  metricSnapshots: MetricSnapshot[];
  source: 'supabase' | 'mock';
  error?: string;
}

type TableName = 'servers' | 'alerts' | 'automations' | 'automation_rules' | 'automation_runs' | 'maintenances' | 'backups' | 'support_tickets' | 'metric_snapshots';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const emptyData: DashboardData = {
  servers: [],
  alerts: [],
  automations: [],
  automationRules: [],
  automationRuns: [],
  maintenances: [],
  backups: [],
  tickets: [],
  metricSnapshots: [],
  source: 'supabase',
};

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, '').replace(/\/rest\/v1$/, '');

const readTable = async <T>(table: TableName): Promise<T[]> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const baseUrl = normalizeBaseUrl(SUPABASE_URL);
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`${table}: ${res.status}`);
  }

  return res.json();
};

const readOptionalTable = async <T>(table: TableName): Promise<T[]> => {
  try {
    return await readTable<T>(table);
  } catch (err) {
    if (err instanceof Error && ['metric_snapshots', 'automation_rules', 'automation_runs'].some((tableName) => err.message.includes(tableName))) return [];
    throw err;
  }
};

const mapServer = (row: any): ServerItem => ({
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
  connectionType: String(row.connection_status ?? '').startsWith('Website Monitor:') || row.provider === 'Website Monitor' ? 'website' : row.connection_type ?? row.connectionType ?? 'ssh',
  connectionStatus: row.connection_status ?? row.connectionStatus ?? 'Waiting for Backend',
  uptime30d: row.uptime_30d ?? row.uptime30d ?? '-',
  backupStatus: row.backup_status ?? row.backupStatus ?? 'Not configured',
  sslStatus: row.ssl_status ?? row.sslStatus ?? 'Not checked',
  lastSeen: row.last_seen ?? row.lastSeen ?? row.last_check ?? 'Never',
  services: Array.isArray(row.services) ? row.services : [],
});

const mapAlert = (row: any): AlertItem => ({
  id: String(row.id),
  severity: row.severity ?? 'information',
  title: row.title ?? 'Untitled alert',
  server: row.server ?? row.server_name ?? '-',
  detectedAt: row.detected_at ?? row.detectedAt ?? '-',
  status: row.status ?? 'Monitoring',
  actionTaken: row.action_taken ?? row.actionTaken ?? '-',
});

const mapMetricSnapshot = (row: any): MetricSnapshot => ({
  id: String(row.id),
  serverId: row.server_id ?? row.serverId ?? '',
  serverName: row.server_name ?? row.serverName ?? '',
  cpuUsage: Number(row.cpu_usage ?? row.cpuUsage ?? 0),
  memoryUsage: Number(row.memory_usage ?? row.memoryUsage ?? 0),
  storageUsage: Number(row.storage_usage ?? row.storageUsage ?? 0),
  networkTraffic: row.network_traffic ?? row.networkTraffic ?? '-',
  createdAt: row.created_at ?? row.createdAt ?? '',
});

const mapAutomation = (row: any): AutomationItem => ({
  id: String(row.id),
  name: row.name ?? 'Untitled automation',
  type: row.type ?? 'monitoring',
  status: row.status ?? 'paused',
  schedule: row.schedule ?? '-',
  lastExecution: row.last_execution ?? row.lastExecution ?? '-',
  historyCount: Number(row.history_count ?? row.historyCount ?? 0),
});

const mapAutomationRule = (row: any): AutomationRule => ({
  id: String(row.id),
  name: row.name ?? 'Untitled rule',
  metric: row.metric ?? 'cpu',
  condition: row.condition ?? '>',
  threshold: String(row.threshold ?? '-'),
  action: row.action ?? '-',
  severity: row.severity ?? 'information',
  approvalRequired: Boolean(row.approval_required ?? row.approvalRequired ?? false),
  status: row.status ?? 'paused',
  updatedAt: row.updated_at ?? row.updatedAt ?? '-',
});

const mapAutomationRun = (row: any): AutomationRun => ({
  id: String(row.id),
  automationId: row.automation_id ?? row.automationId ?? '',
  automationName: row.automation_name ?? row.automationName ?? '-',
  targetServer: row.target_server ?? row.targetServer ?? '-',
  status: row.status ?? 'blocked',
  startedAt: row.started_at ?? row.startedAt ?? '-',
  finishedAt: row.finished_at ?? row.finishedAt ?? '-',
  message: row.message ?? '-',
});

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const api = await fetch('/api/dashboard').catch(() => null);
  if (api?.ok) return api.json();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('localhost')) {
    return { ...emptyData, error: 'Supabase env belum tersedia' };
  }

  try {
    const [servers, alerts, automations, automationRules, automationRuns, maintenances, backups, tickets, metricSnapshots] = await Promise.all([
      readTable<any>('servers'),
      readTable<any>('alerts'),
      readTable<any>('automations'),
      readOptionalTable<any>('automation_rules'),
      readOptionalTable<any>('automation_runs'),
      readTable<MaintenanceItem>('maintenances'),
      readTable<BackupItem>('backups'),
      readTable<SupportTicket>('support_tickets'),
      readOptionalTable<any>('metric_snapshots'),
    ]);

    return {
      servers: servers.map(mapServer),
      alerts: alerts.map(mapAlert),
      automations: automations.map(mapAutomation),
      automationRules: automationRules.map(mapAutomationRule),
      automationRuns: automationRuns.map(mapAutomationRun),
      maintenances,
      backups,
      tickets,
      metricSnapshots: metricSnapshots.map(mapMetricSnapshot),
      source: 'supabase',
    };
  } catch (err) {
    return {
      ...emptyData,
      error: err instanceof Error ? err.message : 'Supabase connection failed',
    };
  }
};
