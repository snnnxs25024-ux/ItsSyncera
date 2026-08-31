import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SMTP_USER = 'alerts@syncera.test';
process.env.SMTP_PASS = 'secret';
process.env.SMTP_TEST_CAPTURE = '1';

const deliveries: any[] = [];
const server = {
  id: 'srv-pve',
  name: 'SERVICE-JAKARTA',
  connection_type: 'proxmox',
  cpu_usage: 4.9,
  memory_usage: 44.8,
  storage_usage: 7.2,
  connection_status: 'Proxmox automation health OK',
  last_seen: '30/08/2026, 13.00.00',
};
const channel = {
  id: 'notif-email-srv-pve',
  server_id: 'srv-pve',
  channel: 'email',
  recipient: 'pratama@ipt.solutions',
  enabled: true,
  severity_filter: 'critical',
  cooldown_minutes: 60,
};

(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  const method = String(init.method || 'GET').toUpperCase();
  if (url.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'user-test', email: 'test@syncera.local' }), { status: 200 });
  if (url.includes('/rest/v1/servers?select=')) return new Response(JSON.stringify([server]), { status: 200 });
  if (url.includes('/rest/v1/notification_channels?select=')) return new Response(JSON.stringify([channel]), { status: 200 });
  if (url.includes('/rest/v1/notification_deliveries') && method === 'POST') { deliveries.push(JSON.parse(init.body)); return new Response('', { status: 201 }); }
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
await handler({ method: 'POST', headers: { cookie: 'syncera_session=test-session' }, body: { type: 'notification_test', serverId: 'srv-pve' } }, res);
const mails = (globalThis as any).__sentMails || [];
assert.equal(res.code, 200);
assert.equal(res.payload.sent, 1);
assert.deepEqual(mails[0].to, ['pratama@ipt.solutions']);
assert.equal(mails[0].subject, '[Syncera Test] Laporan SERVICE-JAKARTA');
assert.match(mails[0].body, /CPU: 4.9%/);
assert.equal(deliveries[0].status, 'sent');
assert.equal(deliveries[0].message, 'manual test report sent');
console.log('notification test email ok');
