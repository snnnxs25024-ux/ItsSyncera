import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

const writes: any[] = [];
(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  const method = String(init.method || 'GET').toUpperCase();
  if (url.includes('/rest/v1/notification_channels?select=')) return new Response(JSON.stringify([]), { status: 200 });
  if (url.includes('/rest/v1/notification_channels?on_conflict=id') && method === 'POST') {
    writes.push(JSON.parse(init.body));
    return new Response(JSON.stringify([JSON.parse(init.body)]), { status: 201 });
  }
  throw new Error(`unexpected fetch ${method} ${url}`);
};

const { default: handler } = await import('../api/notification-channels.ts');
const res = {
  code: 0,
  payload: undefined as any,
  status(code: number) { this.code = code; return this; },
  setHeader() {},
  json(payload: unknown) { this.payload = payload; return this; },
};
await handler({ method: 'POST', body: { serverId: 'srv-pve', recipient: 'ops@example.com', enabled: true, severityFilter: 'critical', cooldownMinutes: 60 } }, res);
assert.equal(res.code, 200);
assert.equal(writes.length, 1);
assert.equal(writes[0].server_id, 'srv-pve');
assert.equal(writes[0].recipient, 'ops@example.com');
assert.equal(writes[0].enabled, true);
assert.equal(writes[0].severity_filter, 'critical');
assert.equal(writes[0].cooldown_minutes, 60);
console.log('notification channel ok');
