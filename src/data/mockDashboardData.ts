import { ServerItem, AlertItem, AutomationItem, MaintenanceItem, BackupItem, SupportTicket } from '../types/dashboard';

export const mockServers: ServerItem[] = [
  {
    id: 'srv-01',
    name: 'prod-cluster-sg-01',
    status: 'active',
    os: 'Ubuntu 24.04 LTS x86_64',
    ipAddress: '103.245.18.92',
    provider: 'AWS Singapore (ap-southeast-1)',
    location: 'Singapore DC-2',
    cpuUsage: 42,
    memoryUsage: 68,
    storageUsage: 54,
    networkTraffic: '1.2 GB/s',
    lastCheck: '10 detik lalu',
    services: [
      { name: 'Nginx Web Server', status: 'online', response: '12ms' },
      { name: 'PostgreSQL Primary DB', status: 'online', response: '4ms' },
      { name: 'Docker Engine', status: 'online', response: '8ms' },
      { name: 'Node.js App Cluster', status: 'online', response: '18ms' }
    ]
  },
  {
    id: 'srv-02',
    name: 'prod-cluster-sg-02',
    status: 'active',
    os: 'Ubuntu 24.04 LTS x86_64',
    ipAddress: '103.245.18.93',
    provider: 'AWS Singapore (ap-southeast-1)',
    location: 'Singapore DC-2',
    cpuUsage: 38,
    memoryUsage: 62,
    storageUsage: 51,
    networkTraffic: '950 MB/s',
    lastCheck: '12 detik lalu',
    services: [
      { name: 'Nginx Web Server', status: 'online', response: '14ms' },
      { name: 'PostgreSQL Replica', status: 'online', response: '6ms' },
      { name: 'Docker Engine', status: 'online', response: '9ms' },
      { name: 'Node.js App Cluster', status: 'online', response: '16ms' }
    ]
  },
  {
    id: 'srv-03',
    name: 'staging-api-node',
    status: 'warning',
    os: 'Debian 12 Bookworm',
    ipAddress: '202.162.44.11',
    provider: 'TelkomCloud Jakarta',
    location: 'Jakarta DC-1',
    cpuUsage: 89,
    memoryUsage: 91,
    storageUsage: 78,
    networkTraffic: '420 MB/s',
    lastCheck: '5 detik lalu',
    services: [
      { name: 'Nginx Web Server', status: 'online', response: '22ms' },
      { name: 'Redis Cache', status: 'degraded', response: '85ms' },
      { name: 'Docker Engine', status: 'online', response: '11ms' },
      { name: 'API Gateway', status: 'online', response: '29ms' }
    ]
  },
  {
    id: 'srv-04',
    name: 'analytics-worker-01',
    status: 'critical',
    os: 'Ubuntu 22.04 LTS',
    ipAddress: '194.31.88.15',
    provider: 'Google Cloud Jakarta',
    location: 'Jakarta DC-3',
    cpuUsage: 98,
    memoryUsage: 95,
    storageUsage: 92,
    networkTraffic: '2.4 GB/s',
    lastCheck: '2 detik lalu',
    services: [
      { name: 'Kafka Stream', status: 'degraded', response: '140ms' },
      { name: 'ClickHouse DB', status: 'online', response: '24ms' },
      { name: 'Python Worker Pool', status: 'offline', response: 'Timeout' },
      { name: 'Prometheus Exporter', status: 'online', response: '15ms' }
    ]
  },
  {
    id: 'srv-05',
    name: 'cache-redis-cluster',
    status: 'active',
    os: 'Alpine Linux 3.20',
    ipAddress: '103.245.19.04',
    provider: 'AWS Singapore (ap-southeast-1)',
    location: 'Singapore DC-2',
    cpuUsage: 22,
    memoryUsage: 45,
    storageUsage: 28,
    networkTraffic: '3.1 GB/s',
    lastCheck: '15 detik lalu',
    services: [
      { name: 'Redis Sentinel', status: 'online', response: '2ms' },
      { name: 'Redis Master', status: 'online', response: '1ms' },
      { name: 'Node Exporter', status: 'online', response: '5ms' }
    ]
  }
];

export const mockAlerts: AlertItem[] = [
  {
    id: 'alt-101',
    severity: 'critical',
    title: 'High CPU & Memory Exhaustion detected',
    server: 'analytics-worker-01',
    detectedAt: 'Hari ini, 09:41 WIB',
    status: 'Monitoring',
    actionTaken: 'Auto-scaling policy triggered. Engineer notified via PagerDuty.'
  },
  {
    id: 'alt-102',
    severity: 'warning',
    title: 'Redis Cache latency spike above 80ms',
    server: 'staging-api-node',
    detectedAt: 'Hari ini, 08:15 WIB',
    status: 'Investigating',
    actionTaken: 'Memory flush scheduled by automated cron worker.'
  },
  {
    id: 'alt-103',
    severity: 'information',
    title: 'SSL Certificate auto-renewed successfully',
    server: 'prod-cluster-sg-01',
    detectedAt: 'Kemarin, 23:00 WIB',
    status: 'Resolved',
    actionTaken: 'Let\'s Encrypt ACME challenge verified and applied.'
  },
  {
    id: 'alt-104',
    severity: 'warning',
    title: 'Disk storage utilization reached 78%',
    server: 'staging-api-node',
    detectedAt: '2 hari lalu',
    status: 'Resolved',
    actionTaken: 'Old Docker build cache pruned automatically (Saved 42 GB).'
  }
];

export const mockAutomations: AutomationItem[] = [
  {
    id: 'auto-01',
    name: 'Automatic Daily Snapshot Backup',
    type: 'backup',
    status: 'active',
    schedule: 'Setiap hari pukul 02:00 WIB',
    lastExecution: 'Hari ini, 02:00 WIB (Sukses)',
    historyCount: 184
  },
  {
    id: 'auto-02',
    name: 'Staging Service Auto-Restart on Crash',
    type: 'restart',
    status: 'active',
    schedule: 'Real-time (Health probe interval 10s)',
    lastExecution: 'Kemarin, 14:22 WIB',
    historyCount: 12
  },
  {
    id: 'auto-03',
    name: 'System Log Rotation & Cleanup',
    type: 'cleanup',
    status: 'active',
    schedule: 'Setiap Minggu pukul 04:00 WIB',
    lastExecution: '2 hari lalu',
    historyCount: 52
  },
  {
    id: 'auto-04',
    name: 'Full Infrastructure Health Probe & Ping',
    type: 'health_check',
    status: 'active',
    schedule: 'Setiap 30 detik',
    lastExecution: '10 detik lalu',
    historyCount: 104920
  }
];

export const mockMaintenances: MaintenanceItem[] = [
  {
    id: 'maint-01',
    title: 'Kernel Upgrade & Security Patching (Ubuntu 24.04.2)',
    scheduledDate: '29 Agustus 2026, 01:00 - 03:00 WIB',
    targetServer: 'prod-cluster-sg-01 & prod-cluster-sg-02',
    status: 'Scheduled',
  },
  {
    id: 'maint-02',
    title: 'Database Storage Expansion & IOPS Upgrade',
    scheduledDate: '15 Agustus 2026',
    targetServer: 'prod-cluster-sg-01',
    status: 'Completed',
    engineerAction: 'Resized EBS volume from 500GB to 2TB gp4 SSD without downtime.',
    result: 'Server optimization completed successfully. I/O latency reduced by 44%.'
  },
  {
    id: 'maint-03',
    title: 'Firewall Rule Hardening & DDoS Mitigation Update',
    scheduledDate: '02 Agustus 2026',
    targetServer: 'All Fleet Servers',
    status: 'Completed',
    engineerAction: 'Applied AWS Shield Advanced rate-limiting rules and Cloudflare Enterprise WAF sync.',
    result: 'Zero false positives reported. Security score upgraded to A+.'
  }
];

export const mockBackups: BackupItem[] = [
  { id: 'bk-901', date: 'Hari ini, 02:00 WIB', server: 'prod-cluster-sg-01', size: '142.8 GB', status: 'Success' },
  { id: 'bk-902', date: 'Hari ini, 02:00 WIB', server: 'prod-cluster-sg-02', size: '138.4 GB', status: 'Success' },
  { id: 'bk-903', date: 'Hari ini, 02:00 WIB', server: 'staging-api-node', size: '45.2 GB', status: 'Success' },
  { id: 'bk-904', date: 'Kemarin, 02:00 WIB', server: 'analytics-worker-01', size: '310.5 GB', status: 'Success' },
  { id: 'bk-905', date: 'Kemarin, 02:00 WIB', server: 'cache-redis-cluster', size: '12.1 GB', status: 'Success' }
];

export const mockTickets: SupportTicket[] = [
  {
    id: 'tkt-401',
    ticketNumber: 'INC-88219',
    subject: 'High CPU spike on analytics-worker-01 during peak hours',
    category: 'Server Issue',
    status: 'In Progress',
    lastUpdated: '15 menit lalu',
    messages: [
      { sender: 'Client', text: 'Halo tim Syncera, worker analytics kami mengalami lonjakan CPU hingga 98%. Mohon bantuannya untuk investigasi.', time: '09:15 WIB' },
      { sender: 'Support Engineer', text: 'Halo Pak Budi, tim SRE kami sedang memeriksa log Kafka stream pada server tersebut. Kami akan update segera.', time: '09:22 WIB' }
    ]
  },
  {
    id: 'tkt-402',
    ticketNumber: 'REQ-77412',
    subject: 'Request additional SSL wildcard certificate for subdomain',
    category: 'Configuration Request',
    status: 'Resolved',
    lastUpdated: '2 hari lalu',
    messages: [
      { sender: 'Client', text: 'Mohon bantu pasang SSL wildcard untuk *.syncera-client.co.id', time: '14:00 WIB' },
      { sender: 'Support Engineer', text: 'SSL wildcard telah berhasil di-deploy ke load balancer Nginx Anda.', time: '15:30 WIB' }
    ]
  }
];
