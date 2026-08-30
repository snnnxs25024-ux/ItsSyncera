import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.SMTP_TEST_CAPTURE = '1';

const server = {
  id: 'srv-pve',
  name: 'PVE Jakarta',
  connection_type: 'proxmox',
  proxmox_token: 'root@pam!syncera=secret',
  proxmox_host: 'pve.test',
  proxmox_port: '8006',
};
const incidentBodies: any[] = [];

(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  const method = String(init.method || 'GET').toUpperCase();
  if (url.includes('/rest/v1/servers?select=')) return new Response(JSON.stringify([server]), { status: 200 });
  if (url.includes('/rest/v1/servers?id=') && method === 'PATCH') return new Response(null, { status: 204 });
  if (url.includes('/rest/v1/notification_channels?select=')) return new Response(JSON.stringify([]), { status: 200 });
  if (url.includes('/rest/v1/alerts') && method === 'POST') return new Response('', { status: 201 });
  if (url.includes('/rest/v1/incident_events') && method === 'POST') { incidentBodies.push(JSON.parse(init.body)); return new Response('', { status: 201 }); }
  if (url.includes('/rest/v1/automation_runs') && method === 'POST') { const body = JSON.parse(init.body); return new Response(JSON.stringify([body]), { status: 201 }); }
  if (url.includes('/api2/json/')) throw new Error('fetch failed');
  throw new Error(`unexpected fetch ${method} ${url}`);
};

const { default: handler } = await import('../api/automation/run.ts');
const res = {
  code: 0,
  payload: undefined as any,
  status(code: number) { this.code = code; return this; },
  setHeader() {},
  json(payload: unknown) { this.payload = payload; return this; },
};
await handler({ method: 'POST', body: { type: 'proxmox_health_check', serverId: 'srv-pve' } }, res);

assert.equal(res.code, 200);
assert.equal(incidentBodies.length, 1);
assert.equal(incidentBodies[0][0].server_id, 'srv-pve');
assert.equal(incidentBodies[0][0].incident_key, 'proxmox-unreachable-srv-pve');
assert.equal(incidentBodies[0][0].event_type, 'detected');
assert.match(incidentBodies[0][0].detail, /fetch failed/);
console.log('incident event ok');
