import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.SMTP_USER = 'alerts@syncera.test';
process.env.SMTP_PASS = 'secret';
process.env.ALERT_EMAIL_TO = 'owner@syncera.test';
process.env.SMTP_TEST_CAPTURE = '1';

const server = {
  id: 'srv-pve',
  name: 'PVE Jakarta',
  connection_type: 'proxmox',
  proxmox_token: 'root@pam!syncera=secret',
  proxmox_host: 'pve.test',
  proxmox_port: '8006',
};
const alertBodies: any[] = [];

(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  const method = String(init.method || 'GET').toUpperCase();
  if (url.includes('/rest/v1/servers?select=')) return new Response(JSON.stringify([server]), { status: 200 });
  if (url.includes('/rest/v1/servers?id=')) return new Response('[]', { status: 200 });
  if (url.includes('/rest/v1/metric_snapshots')) return new Response('', { status: 201 });
  if (url.includes('/rest/v1/automation_runs')) return new Response(init.body || '[]', { status: 201 });
  if (url.includes('/rest/v1/alerts') && method === 'POST') { alertBodies.push(JSON.parse(init.body)); return new Response('', { status: 201 }); }
  if (url.includes('/rest/v1/alerts') && method === 'PATCH') return new Response('', { status: 204 });
  if (url.endsWith('/api2/json/version')) return new Response(JSON.stringify({ data: { version: '9.2.10' } }), { status: 200 });
  if (url.endsWith('/api2/json/nodes')) return new Response(JSON.stringify({ data: [{ node: 'pve' }] }), { status: 200 });
  if (url.endsWith('/api2/json/nodes/pve/status')) return new Response(JSON.stringify({ data: { cpu: 0.95, memory: { used: 91, total: 100 }, rootfs: { used: 86, total: 100 } } }), { status: 200 });
  if (url.endsWith('/api2/json/nodes/pve/qemu')) return new Response(JSON.stringify({ data: [{ vmid: 100, name: 'App', status: 'stopped' }] }), { status: 200 });
  if (url.endsWith('/api2/json/nodes/pve/lxc')) return new Response(JSON.stringify({ data: [] }), { status: 200 });
  throw new Error(`unexpected fetch ${method} ${url}`);
};

const { default: handler } = await import('../api/automation/run.ts');
const req = { method: 'POST', body: { type: 'proxmox_health_check', serverId: 'srv-pve' } };
const res = {
  code: 0,
  payload: undefined as any,
  status(code: number) { this.code = code; return this; },
  setHeader() {},
  json(payload: unknown) { this.payload = payload; return this; },
};
await handler(req, res);
assert.equal(res.code, 200);
const titles = alertBodies.flat().map((row) => row.title).sort();
assert.deepEqual(titles, [
  'CPU tinggi di PVE Jakarta',
  'Disk hampir penuh di PVE Jakarta',
  'RAM tinggi di PVE Jakarta',
  'VM/CT offline di PVE Jakarta',
].sort());
const mails = (globalThis as any).__sentMails || [];
assert.equal(mails.length, 1);
assert.equal(mails[0].subject, '[Syncera Alert] 4 alert di PVE Jakarta');
assert.match(mails[0].body, /CPU tinggi di PVE Jakarta/);
assert.match(mails[0].body, /VM\/CT offline di PVE Jakarta/);
console.log('automation alert ok');
