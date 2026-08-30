import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.SMTP_USER = 'alerts@syncera.test';
process.env.SMTP_PASS = 'secret';
process.env.SMTP_TEST_CAPTURE = '1';

const server = {
  id: 'srv-pve',
  name: 'PVE Jakarta',
  connection_type: 'proxmox',
  proxmox_token: 'root@pam!syncera=secret',
  proxmox_host: 'pve.test',
  proxmox_port: '8006',
};
const serverPatches: any[] = [];
const alertBodies: any[] = [];
const runBodies: any[] = [];
const deliveryBodies: any[] = [];

(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  const method = String(init.method || 'GET').toUpperCase();
  if (url.includes('/rest/v1/servers?select=')) return new Response(JSON.stringify([server]), { status: 200 });
  if (url.includes('/rest/v1/servers?id=') && method === 'PATCH') { serverPatches.push(JSON.parse(init.body)); return new Response(null, { status: 204 }); }
  if (url.includes('/rest/v1/notification_channels?select=')) return new Response(JSON.stringify([{ id: 'chan-1', server_id: 'srv-pve', channel: 'email', recipient: 'client@syncera.test', enabled: true, severity_filter: 'critical', cooldown_minutes: 60 }]), { status: 200 });
  if (url.includes('/rest/v1/notification_channels?id=') && method === 'PATCH') return new Response(null, { status: 204 });
  if (url.includes('/rest/v1/notification_deliveries') && method === 'POST') { deliveryBodies.push(JSON.parse(init.body)); return new Response('', { status: 201 }); }
  if (url.includes('/rest/v1/alerts') && method === 'POST') { alertBodies.push(JSON.parse(init.body)); return new Response('', { status: 201 }); }
  if (url.includes('/rest/v1/automation_runs') && method === 'POST') { const body = JSON.parse(init.body); runBodies.push(body); return new Response(JSON.stringify([body]), { status: 201 }); }
  if (url.includes('/api2/json/')) throw new Error('connect ECONNREFUSED');
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
const mails = (globalThis as any).__sentMails || [];
assert.equal(res.code, 200);
assert.equal(res.payload.run.status, 'failed');
assert.match(res.payload.run.message, /Proxmox health gagal/);
assert.equal(runBodies[0].status, 'failed');
assert.equal(serverPatches[0].status, 'critical');
assert.match(serverPatches[0].connection_status, /Proxmox unreachable/);
assert.equal(alertBodies.flat()[0].title, 'Proxmox unreachable di PVE Jakarta');
assert.equal(alertBodies.flat()[0].severity, 'critical');
assert.equal(mails[0].subject, '[Syncera Alert] 1 alert di PVE Jakarta');
assert.equal(deliveryBodies[0].status, 'sent');
console.log('automation unreachable ok');
