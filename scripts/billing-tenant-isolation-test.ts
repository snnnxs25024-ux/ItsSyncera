import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test';
process.env.SUPABASE_ANON_KEY = 'anon-test';

const rows: Record<string, any[]> = {
  billing_accounts: [
    { id: 'acct-a', owner_user_id: 'user-a', plan_name: 'BASIC' },
    { id: 'acct-b', owner_user_id: 'user-b', plan_name: 'PRO' },
  ],
  billing_plan_requests: [
    { id: 'req-a', owner_user_id: 'user-a', current_plan: 'BASIC', requested_plan: 'PRO' },
    { id: 'req-b', owner_user_id: 'user-b', current_plan: 'PRO', requested_plan: 'ULTIMATE' },
  ],
};
const calls: string[] = [];
const writes: any[] = [];
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
(globalThis as any).fetch = async (input: unknown, init: any = {}) => {
  const url = String(input);
  calls.push(url);
  if (url.includes('/auth/v1/user')) return response({ id: 'user-a', email: 'a@test.local' });
  const table = url.match(/\/rest\/v1\/([^?]+)/)?.[1] || '';
  if (String(init.method || 'GET').toUpperCase() === 'POST') {
    const body = JSON.parse(init.body || '{}');
    writes.push(body);
    return response([body], 201);
  }
  const owner = new URL(url).searchParams.get('owner_user_id')?.replace('eq.', '');
  return response(owner ? (rows[table] || []).filter((row) => row.owner_user_id === owner) : rows[table] || []);
};

const { default: handler } = await import('../api/billing/upgrade.ts');
const res = () => {
  const out: any = { code: 0, body: null, headers: {} };
  out.setHeader = (key: string, value: string) => { out.headers[key] = value; };
  out.status = (code: number) => { out.code = code; return out; };
  out.json = (body: unknown) => { out.body = body; return out; };
  return out;
};

let r = res();
await handler({ method: 'GET', headers: { cookie: 'syncera_session=token-a' } }, r);
assert.equal(r.code, 200);
assert.deepEqual(r.body.requests.map((req: any) => req.id), ['req-a']);
assert.ok(calls.some((url) => url.includes('billing_plan_requests?select=*&owner_user_id=eq.user-a')));

r = res();
await handler({ method: 'POST', headers: { cookie: 'syncera_session=token-a' }, body: { requestedPlan: 'ULTIMATE' } }, r);
assert.equal(r.code, 201);
assert.equal(writes[0].owner_user_id, 'user-a');
assert.equal(writes[0].current_plan, 'BASIC');
console.log('billing tenant isolation ok');
