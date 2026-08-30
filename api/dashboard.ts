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

const readOptionalTable = async (table: string) => {
  try {
    return await readTable(table);
  } catch (err) {
    if (err instanceof ApiError && (err.message.includes("Could not find the table") || err.message.includes('PGRST205') || ['metric_snapshots', 'automation_rules', 'automation_runs', 'billing_accounts', 'billing_plans', 'billing_invoices', 'billing_plan_requests', 'incident_events'].some((name) => err.message.includes(name)))) return [];
    throw err;
  }
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const healthOf = (row: Row) => {
  const reasons: string[] = [];
  let score = 100;
  const status = String(row.status || 'waiting');
  const connection = String(row.connection_status ?? '').toLowerCase();
  const cpu = Number(row.cpu_usage ?? row.cpuUsage ?? 0);
  const memory = Number(row.memory_usage ?? row.memoryUsage ?? 0);
  const storage = Number(row.storage_usage ?? row.storageUsage ?? 0);
  const services = Array.isArray(row.services) ? row.services : [];
  const offline = services.filter((service) => service?.status === 'offline').length;
  const degraded = services.filter((service) => service?.status === 'degraded').length;
  if (status === 'critical') { score -= 35; reasons.push('Server critical'); }
  else if (status === 'warning') { score -= 18; reasons.push('Server warning'); }
  else if (status === 'waiting') { score -= 10; reasons.push('Monitoring belum lengkap'); }
  if (/unreachable|fetch failed|timeout|down|gagal/.test(connection)) { score -= 45; reasons.push('Proxmox unreachable'); }
  if (cpu >= 90) { score -= 25; reasons.push('CPU critical'); }
  else if (cpu >= 75) { score -= 10; reasons.push('CPU warning'); }
  if (memory >= 90) { score -= 20; reasons.push('RAM critical'); }
  else if (memory >= 80) { score -= 8; reasons.push('RAM warning'); }
  if (storage >= 90) { score -= 25; reasons.push('Disk critical'); }
  else if (storage >= 80) { score -= 10; reasons.push('Disk warning'); }
  if (offline) { score -= Math.min(35, offline * 18); reasons.push(`${offline} service offline`); }
  if (degraded) { score -= Math.min(18, degraded * 8); reasons.push(`${degraded} service degraded`); }
  const healthScore = clamp(score);
  return {
    healthScore,
    healthLevel: healthScore >= 85 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
    riskReasons: reasons.length ? reasons : ['Tidak ada risk aktif'],
  };
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
  connectionType: String(row.connection_status ?? '').startsWith('Website Monitor:') || row.provider === 'Website Monitor' ? 'website' : row.connection_type ?? row.connectionType ?? 'ssh',
  connectionStatus: row.connection_status ?? row.connectionStatus ?? 'Waiting for Backend',
  uptime30d: row.uptime_30d ?? row.uptime30d ?? '-',
  backupStatus: row.backup_status ?? row.backupStatus ?? 'Not configured',
  sslStatus: row.ssl_status ?? row.sslStatus ?? 'Not checked',
  lastSeen: row.last_seen ?? row.lastSeen ?? row.last_check ?? 'Never',
  ...healthOf(row),
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

const mapMetricSnapshot = (row: Row) => ({
  id: String(row.id),
  serverId: row.server_id ?? '',
  serverName: row.server_name ?? '',
  cpuUsage: Number(row.cpu_usage ?? 0),
  memoryUsage: Number(row.memory_usage ?? 0),
  storageUsage: Number(row.storage_usage ?? 0),
  networkTraffic: row.network_traffic ?? '-',
  createdAt: row.created_at ?? '',
});

const mapAutomation = (row: Row) => ({
  id: String(row.id),
  name: row.name ?? 'Untitled automation',
  type: row.type ?? 'monitoring',
  status: row.status ?? 'paused',
  schedule: row.schedule ?? '-',
  lastExecution: row.last_execution ?? row.lastExecution ?? '-',
  historyCount: Number(row.history_count ?? row.historyCount ?? 0),
});

const mapAutomationRule = (row: Row) => ({
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

const mapAutomationRun = (row: Row) => ({
  id: String(row.id),
  automationId: row.automation_id ?? row.automationId ?? '',
  automationName: row.automation_name ?? row.automationName ?? '-',
  targetServer: row.target_server ?? row.targetServer ?? '-',
  status: row.status ?? 'blocked',
  startedAt: row.started_at ?? row.startedAt ?? '-',
  finishedAt: row.finished_at ?? row.finishedAt ?? '-',
  message: row.message ?? '-',
});

const mapIncidentEvent = (row: Row) => ({
  id: String(row.id),
  serverId: row.server_id ?? row.serverId ?? '',
  serverName: row.server_name ?? row.serverName ?? row.server ?? '-',
  incidentKey: row.incident_key ?? row.incidentKey ?? '',
  severity: row.severity ?? 'information',
  eventType: row.event_type ?? row.eventType ?? 'note',
  title: row.title ?? 'Incident event',
  detail: row.detail ?? '-',
  actor: row.actor ?? 'Syncera',
  occurredAt: row.occurred_at ?? row.occurredAt ?? row.created_at ?? '',
});

const mapBillingAccount = (row: Row) => ({
  id: String(row.id),
  companyName: row.company_name ?? row.companyName ?? '-',
  planId: row.plan_id ?? row.planId ?? '',
  planName: row.plan_name ?? row.planName ?? 'No active plan',
  status: row.status ?? 'not_configured',
  billingCycle: row.billing_cycle ?? row.billingCycle ?? 'manual',
  price: row.price ?? '-',
  currency: row.currency ?? 'IDR',
  renewalDate: row.renewal_date ?? row.renewalDate ?? '-',
  serverLimit: row.server_limit ?? row.serverLimit ?? null,
  paymentProvider: row.payment_provider ?? row.paymentProvider ?? 'not configured',
  paymentStatus: row.payment_status ?? row.paymentStatus ?? 'not_configured',
  updatedAt: row.updated_at ?? row.updatedAt ?? '-',
});

const mapBillingPlan = (row: Row) => ({
  id: String(row.id),
  name: row.name ?? 'Untitled plan',
  price: row.price ?? '-',
  currency: row.currency ?? 'IDR',
  billingCycle: row.billing_cycle ?? row.billingCycle ?? 'manual',
  serverLimit: row.server_limit ?? row.serverLimit ?? null,
  monitoringInterval: row.monitoring_interval ?? row.monitoringInterval ?? '-',
  supportLevel: row.support_level ?? row.supportLevel ?? '-',
  backupRetention: row.backup_retention ?? row.backupRetention ?? '-',
  features: Array.isArray(row.features) ? row.features : [],
  status: row.status ?? 'active',
});

const mapBillingInvoice = (row: Row) => ({
  id: String(row.id),
  invoiceNumber: row.invoice_number ?? row.invoiceNumber ?? String(row.id),
  date: row.date ?? '-',
  dueDate: row.due_date ?? row.dueDate ?? '-',
  amount: row.amount ?? '-',
  currency: row.currency ?? 'IDR',
  status: row.status ?? 'unpaid',
});

const mapBillingPlanRequest = (row: Row) => ({
  id: String(row.id),
  currentPlan: row.current_plan ?? row.currentPlan ?? '-',
  requestedPlan: row.requested_plan ?? row.requestedPlan ?? '-',
  status: row.status ?? 'pending',
  requestedAt: row.requested_at ?? row.requestedAt ?? '-',
  note: row.note ?? '-',
});

const sortByNewest = (a: Row, b: Row) => String(b.started_at ?? b.created_at ?? '').localeCompare(String(a.started_at ?? a.created_at ?? ''));

export default async function handler(_req: any, res: any) {
  try {
    const [servers, alerts, automations, automationRules, automationRuns, billingAccounts, billingPlans, billingInvoices, billingPlanRequests, maintenances, backups, tickets, metricSnapshots, incidentEvents] = await Promise.all([
      readTable('servers'),
      readTable('alerts'),
      readTable('automations'),
      readOptionalTable('automation_rules'),
      readOptionalTable('automation_runs'),
      readOptionalTable('billing_accounts'),
      readOptionalTable('billing_plans'),
      readOptionalTable('billing_invoices'),
      readOptionalTable('billing_plan_requests'),
      readTable('maintenances'),
      readTable('backups'),
      readTable('support_tickets'),
      readOptionalTable('metric_snapshots'),
      readOptionalTable('incident_events'),
    ]);
    return res.status(200).json({
      servers: servers.map(mapServer),
      alerts: alerts.map(mapAlert),
      automations: automations.map(mapAutomation),
      automationRules: automationRules.map(mapAutomationRule),
      automationRuns: automationRuns.sort(sortByNewest).slice(0, 50).map(mapAutomationRun),
      billingAccount: billingAccounts[0] ? mapBillingAccount(billingAccounts[0]) : null,
      billingPlans: billingPlans.map(mapBillingPlan),
      billingInvoices: billingInvoices.map(mapBillingInvoice),
      billingPlanRequests: billingPlanRequests.map(mapBillingPlanRequest),
      maintenances,
      backups,
      tickets,
      metricSnapshots: metricSnapshots.map(mapMetricSnapshot),
      incidentEvents: incidentEvents
        .sort((a, b) => String(b.occurred_at ?? b.created_at ?? '').localeCompare(String(a.occurred_at ?? a.created_at ?? '')))
        .slice(0, 100)
        .map(mapIncidentEvent),
      source: 'supabase',
    });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ error: err instanceof Error ? err.message : 'dashboard fetch failed' });
  }
}
