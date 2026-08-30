import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

const healthyServer = {
  id: 'srv-healthy',
  name: 'Healthy PVE',
  status: 'active',
  os: 'Debian',
  ip_address: '10.0.0.10',
  provider: 'Proxmox',
  location: 'Jakarta',
  cpu_usage: 12,
  memory_usage: 30,
  storage_usage: 40,
  network_traffic: '-',
  last_check: 'now',
  connection_type: 'proxmox',
  connection_status: 'Proxmox automation health OK',
  backup_status: 'Trusted',
  ssl_status: 'Valid',
  services: [{ name: 'VM 100 · App', status: 'online', response: 'running' }],
};
const riskyServer = {
  id: 'srv-risky',
  name: 'Risky PVE',
  status: 'critical',
  os: 'Debian',
  ip_address: '10.0.0.20',
  provider: 'Proxmox',
  location: 'Jakarta',
  cpu_usage: 95,
  memory_usage: 92,
  storage_usage: 91,
  network_traffic: '-',
  last_check: 'now',
  connection_type: 'proxmox',
  connection_status: 'Proxmox unreachable · fetch failed',
  backup_status: 'Not configured',
  ssl_status: 'Not checked',
  services: [{ name: 'VM 101 · DB', status: 'offline', response: 'stopped' }],
};
const incidents = [{
  id: 'incident-1',
  server_id: 'srv-risky',
  server_name: 'Risky PVE',
  incident_key: 'proxmox-unreachable-srv-risky',
  severity: 'critical',
  event_type: 'detected',
  title: 'Proxmox unreachable di Risky PVE',
  detail: 'Gejala: fetch failed. Tindakan: alert, email, failed run.',
  actor: 'Syncera',
  occurred_at: '2026-08-30T07:00:00Z',
}];

(globalThis as any).fetch = async (input: unknown) => {
  const url = String(input);
  const table = url.match(/\/rest\/v1\/([^?]+)/)?.[1];
  const rows: Record<string, unknown[]> = {
    servers: [healthyServer, riskyServer],
    alerts: [{ id: 'alert-risky', severity: 'critical', title: 'Proxmox unreachable di Risky PVE', server: 'Risky PVE', status: 'Monitoring' }],
    automations: [],
    automation_rules: [],
    automation_runs: [],
    billing_accounts: [],
    billing_plans: [],
    billing_invoices: [],
    billing_plan_requests: [],
    maintenances: [],
    backups: [],
    support_tickets: [],
    metric_snapshots: [],
    incident_events: incidents,
  };
  if (table && table in rows) return new Response(JSON.stringify(rows[table]), { status: 200 });
  throw new Error(`unexpected fetch ${url}`);
};

const { default: handler } = await import('../api/dashboard.ts');
const res = {
  code: 0,
  payload: undefined as any,
  status(code: number) { this.code = code; return this; },
  json(payload: unknown) { this.payload = payload; return this; },
};
await handler({}, res);

assert.equal(res.code, 200);
assert.equal(res.payload.servers[0].healthScore, 100);
assert.equal(res.payload.servers[0].healthLevel, 'healthy');
assert.equal(res.payload.servers[1].healthScore, 0);
assert.equal(res.payload.servers[1].healthLevel, 'critical');
assert.ok(res.payload.servers[1].riskReasons.includes('Proxmox unreachable'));
assert.ok(res.payload.servers[1].riskReasons.includes('CPU critical'));
assert.equal(res.payload.incidentEvents[0].title, 'Proxmox unreachable di Risky PVE');
assert.equal(res.payload.incidentEvents[0].eventType, 'detected');
console.log('health score dashboard ok');
