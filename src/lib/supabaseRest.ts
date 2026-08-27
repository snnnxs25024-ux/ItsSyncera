import {
  AlertItem,
  AutomationItem,
  BackupItem,
  MaintenanceItem,
  ServerItem,
  SupportTicket,
} from '../types/dashboard';
import {
  mockAlerts,
  mockAutomations,
  mockBackups,
  mockMaintenances,
  mockServers,
  mockTickets,
} from '../data/mockDashboardData';

export interface DashboardData {
  servers: ServerItem[];
  alerts: AlertItem[];
  automations: AutomationItem[];
  maintenances: MaintenanceItem[];
  backups: BackupItem[];
  tickets: SupportTicket[];
  source: 'supabase' | 'mock';
  error?: string;
}

type TableName = 'servers' | 'alerts' | 'automations' | 'maintenances' | 'backups' | 'support_tickets';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const mockData: DashboardData = {
  servers: mockServers,
  alerts: mockAlerts,
  automations: mockAutomations,
  maintenances: mockMaintenances,
  backups: mockBackups,
  tickets: mockTickets,
  source: 'mock',
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
  connectionType: row.connection_type ?? row.connectionType ?? 'ssh',
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

export const fetchDashboardData = async (): Promise<DashboardData> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('localhost')) {
    return mockData;
  }

  try {
    const [servers, alerts, automations, maintenances, backups, tickets] = await Promise.all([
      readTable<any>('servers'),
      readTable<any>('alerts'),
      readTable<AutomationItem>('automations'),
      readTable<MaintenanceItem>('maintenances'),
      readTable<BackupItem>('backups'),
      readTable<SupportTicket>('support_tickets'),
    ]);

    return {
      servers: servers.length ? servers.map(mapServer) : mockServers,
      alerts: alerts.length ? alerts.map(mapAlert) : mockAlerts,
      automations: automations.length ? automations : mockAutomations,
      maintenances: maintenances.length ? maintenances : mockMaintenances,
      backups: backups.length ? backups : mockBackups,
      tickets: tickets.length ? tickets : mockTickets,
      source: 'supabase',
    };
  } catch (err) {
    return {
      ...mockData,
      error: err instanceof Error ? err.message : 'Supabase connection failed',
    };
  }
};
