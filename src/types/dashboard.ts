export type DashboardTab = 
  | 'overview' 
  | 'servers' 
  | 'monitoring' 
  | 'alerts' 
  | 'automation' 
  | 'maintenance' 
  | 'backup' 
  | 'reports' 
  | 'subscription' 
  | 'support' 
  | 'settings';

export interface ServerItem {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'critical' | 'maintenance' | 'waiting';
  os: string;
  ipAddress: string;
  provider: string;
  location: string;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkTraffic: string;
  lastCheck: string;
  connectionType?: 'ssh' | 'agent' | 'proxmox' | 'website';
  connectionStatus?: string;
  uptime30d?: string;
  backupStatus?: string;
  sslStatus?: string;
  lastSeen?: string;
  services: {
    name: string;
    status: 'online' | 'degraded' | 'offline';
    response: string;
  }[];
}

export interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'information';
  title: string;
  server: string;
  detectedAt: string;
  status: 'Monitoring' | 'Resolved' | 'Investigating';
  actionTaken: string;
}

export interface AutomationItem {
  id: string;
  name: string;
  type: 'backup' | 'restart' | 'cleanup' | 'health_check' | 'monitoring';
  status: 'active' | 'paused' | 'running';
  schedule: string;
  lastExecution: string;
  historyCount: number;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  scheduledDate: string;
  targetServer: string;
  status: 'Scheduled' | 'Completed' | 'In Progress';
  engineerAction?: string;
  result?: string;
}

export interface BackupItem {
  id: string;
  date: string;
  server: string;
  size: string;
  status: 'Success' | 'Failed' | 'Verifying';
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'Server Issue' | 'Maintenance Request' | 'Configuration Request' | 'General Question';
  status: 'Open' | 'In Progress' | 'Resolved';
  lastUpdated: string;
  messages: {
    sender: 'Client' | 'Support Engineer';
    text: string;
    time: string;
  }[];
}
