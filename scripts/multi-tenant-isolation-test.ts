import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test';
process.env.SUPABASE_ANON_KEY = 'anon-test';

const serverRows = [
  { id: 'srv-a', owner_user_id: 'user-a', name: 'A Server', status: 'active', ip_address: 'a.test', cpu_usage: 1, memory_usage: 2, storage_usage: 3, connection_type: 'agent', services: [] },
  { id: 'srv-b', owner_user_id: 'user-b', name: 'B Server', status: 'active', ip_address: 'b.test', cpu_usage: 4, memory_usage: 5, storage_usage: 6, connection_type: 'agent', services: [] },
];
const tableRows: Record<string, any[]> = {
  servers: serverRows,
  alerts: [
    { id: 'alert-a', owner_user_id: 'user-a', severity: 'warning', title: 'A alert', server: 'A Server', status: 'Monitoring' },
    { id: 'alert-b', owner_user_id: 'user-b', severity: 'critical', title: 'B alert', server: 'B Server', status: 'Monitoring' },
  ],
  automations: [],
  automation_rules: [],
  automation_runs: [
    { id: 'run-a', owner_user_id: 'user-a', automation_name: 'A run', target_server: 'A Server', status: 'success' },
    { id: 'run-b', owner_user_id: 'user-b', automation_name: 'B run', target_server: 'B Server', status: 'failed' },
  ],
  billing_accounts: [],
  billing_plans: [],
  billing_invoices: [],
  billing_plan_requests: [],
  maintenances: [],
  backups: [],
  support_tickets: [],
  metric_snapshots: [],
  incident_events: [
    { id: 'inc-a', owner_user_id: 'user-a', server_name: 'A Server', incident_key: 'a', severity: 'warning', event_type: 'detected', title: 'A incident' },
    { id: 'inc-b', owner_user_id: 'user-b', server_name: 'B Server', incident_key: 'b', severity: 'critical', event_type: 'detected', title: 'B incident' },
  ],
};

const calls: string[] = [];
const inserts: any[] = [];
const userByToken: Record<string, string> = { 'token-a': 'user-a', 'token-b': 'user-b' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

(globalThis as any).fetch = async (url: URL | string, init?: RequestInit) => {
  const raw = String(url);
  calls.push(raw);
  if (raw.includes('/auth/v1/user')) {
    const token = String((init?.headers as any)?.Authorization || '').replace('Bearer ', '');
    return response({ id: userByToken[token] || 'unknown-user', email: `${userByToken[token] || 'unknown'}@test.local` });
  }
  const match = raw.match(/\/rest\/v1\/([^?]+)/);
  if (!match) return response({});
  const table = match[1];
  const method = init?.method || 'GET';
  if (method === 'POST') {
    const body = JSON.parse(String(init?.body || '{}'));
    inserts.push(Array.isArray(body) ? body : [body]);
    return response(Array.isArray(body) ? body : [body], 201);
  }
  const rows = tableRows[table] || [];
  const owner = new URL(raw).searchParams.get('owner_user_id')?.replace('eq.', '');
  return response(owner ? rows.filter((row) => row.owner_user_id === owner) : rows);
};

const res = () => {
  const out: any = { code: 0, body: null, headers: {} };
  out.setHeader = (key: string, value: string) => { out.headers[key] = value; };
  out.status = (code: number) => { out.code = code; return out; };
  out.json = (body: unknown) => { out.body = body; return out; };
  return out;
};

const { default: dashboard } = await import('../api/dashboard.ts');
const { default: serversApi } = await import('../api/servers.ts');

let r = res();
await dashboard({ method: 'GET', headers: { cookie: 'syncera_session=token-a' } }, r);
assert.equal(r.code, 200);
assert.deepEqual(r.body.servers.map((server: any) => server.id), ['srv-a']);
assert.deepEqual(r.body.alerts.map((alert: any) => alert.id), ['alert-a']);
assert.deepEqual(r.body.automationRuns.map((run: any) => run.id), ['run-a']);
assert.deepEqual(r.body.incidentEvents.map((event: any) => event.id), ['inc-a']);
assert.ok(calls.some((url) => url.includes('/auth/v1/user')), 'dashboard must resolve user from session cookie');
assert.ok(calls.some((url) => url.includes('/rest/v1/servers?select=*&owner_user_id=eq.user-a')), 'dashboard must filter servers by owner_user_id');

r = res();
await serversApi({ method: 'POST', headers: { cookie: 'syncera_session=token-a' }, body: { name: 'A New', connectionType: 'agent', ipAddress: 'new-a.test' } }, r);
assert.equal(r.code, 201);
assert.equal(inserts.flat().at(-1).owner_user_id, 'user-a');

r = res();
await dashboard({ method: 'GET', headers: { cookie: 'syncera_session=token-b' } }, r);
assert.deepEqual(r.body.servers.map((server: any) => server.id), ['srv-b']);

console.log('multi tenant isolation ok');
