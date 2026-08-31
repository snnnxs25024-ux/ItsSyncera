import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

const writes: any[] = [];
(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  const method = String(init.method || 'GET').toUpperCase();
  if (url.includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'user-test', email: 'test@syncera.local' }), { status: 200 });
  if (url.includes('/rest/v1/servers?select=')) return new Response(JSON.stringify([{ id: 'srv-pve', owner_user_id: 'user-test' }]), { status: 200 });
  if (url.includes('/rest/v1/notification_channels?select=')) return new Response(JSON.stringify([]), { status: 200 });
  if (url.includes('/rest/v1/notification_channels?on_conflict=id') && method === 'POST') {
    writes.push(JSON.parse(init.body));
    return new Response(JSON.stringify([JSON.parse(init.body)]), { status: 201 });
  }
  throw new Error(`unexpected fetch ${method} ${url}`);
};

const { default: handler } = await import('../api/automation/run.ts');
const listRes = {
  code: 0,
  payload: undefined as any,
  status(code: number) { this.code = code; return this; },
  setHeader() {},
  json(payload: unknown) { this.payload = payload; return this; },
};
await handler({ method: 'GET', headers: { cookie: 'syncera_session=test-session' }, query: { type: 'notification_channels' } }, listRes);
assert.equal(listRes.code, 200);
assert.deepEqual(listRes.payload, { success: true, channels: [] });
const res = {
  code: 0,
  payload: undefined as any,
  status(code: number) { this.code = code; return this; },
  setHeader() {},
  json(payload: unknown) { this.payload = payload; return this; },
};
await handler({ method: 'POST', headers: { cookie: 'syncera_session=test-session' }, body: { type: 'notification_channel', serverId: 'srv-pve', recipient: 'ops@example.com', enabled: true, severityFilter: 'critical', cooldownMinutes: 60 } }, res);
assert.equal(res.code, 200);
assert.equal(writes.length, 1);
assert.equal(writes[0].server_id, 'srv-pve');
assert.equal(writes[0].owner_user_id, 'user-test');
assert.equal(writes[0].recipient, 'ops@example.com');
assert.equal(writes[0].enabled, true);
assert.equal(writes[0].severity_filter, 'critical');
assert.equal(writes[0].cooldown_minutes, 60);
console.log('notification channel ok');
