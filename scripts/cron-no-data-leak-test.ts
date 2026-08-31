import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test';
process.env.SMTP_TEST_CAPTURE = '1';

(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  const method = String(init.method || 'GET').toUpperCase();
  if (url.includes('/rest/v1/servers?select=')) return new Response(JSON.stringify([{ id: 'srv-secret', owner_user_id: 'user-a', name: 'Tenant Secret Server', connection_type: 'proxmox', proxmox_token: 'root@pam!t=s', proxmox_host: 'pve.test' }]), { status: 200 });
  if (url.includes('/rest/v1/servers?') && method === 'PATCH') return new Response('', { status: 204 });
  if (url.includes('/rest/v1/metric_snapshots') && method === 'POST') return new Response('', { status: 201 });
  if (url.includes('/rest/v1/alerts') && method === 'POST') return new Response('', { status: 201 });
  if (url.includes('/rest/v1/incident_events') && method === 'POST') return new Response('', { status: 201 });
  if (url.includes('/rest/v1/notification_channels?select=')) return new Response(JSON.stringify([]), { status: 200 });
  if (url.includes('/rest/v1/automation_runs') && method === 'POST') return new Response(init.body || '[]', { status: 201 });
  if (url.endsWith('/api2/json/version')) return new Response(JSON.stringify({ data: { version: '9.2.10' } }), { status: 200 });
  if (url.endsWith('/api2/json/nodes')) return new Response(JSON.stringify({ data: [{ node: 'pve' }] }), { status: 200 });
  if (url.endsWith('/api2/json/nodes/pve/status')) return new Response(JSON.stringify({ data: { cpu: 0.01, memory: { used: 1, total: 10 }, rootfs: { used: 1, total: 10 } } }), { status: 200 });
  if (url.endsWith('/api2/json/nodes/pve/qemu')) return new Response(JSON.stringify({ data: [] }), { status: 200 });
  if (url.endsWith('/api2/json/nodes/pve/lxc')) return new Response(JSON.stringify({ data: [] }), { status: 200 });
  throw new Error(`unexpected fetch ${method} ${url}`);
};

const { default: handler } = await import('../api/automation/run.ts');
const res: any = { code: 0, body: null, headers: {}, setHeader(k: string, v: string) { this.headers[k] = v; }, status(code: number) { this.code = code; return this; }, json(body: unknown) { this.body = body; return this; } };
await handler({ method: 'GET', headers: { 'x-vercel-cron': '1' } }, res);
assert.equal(res.code, 200);
assert.equal(res.body.success, true);
assert.equal(res.body.checked, 1);
assert.equal(res.body.results, undefined, 'cron response must not expose tenant run rows');
assert.doesNotMatch(JSON.stringify(res.body), /Tenant Secret Server|srv-secret/);
console.log('cron no data leak ok');
