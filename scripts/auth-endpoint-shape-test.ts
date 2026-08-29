import assert from 'node:assert/strict';
import login from '../api/auth/login.ts';
import logout from '../api/auth/logout.ts';
import me from '../api/auth/me.ts';
import signup from '../api/auth/signup.ts';

const res = () => {
  const out: any = { code: 0, headers: {}, body: null };
  out.setHeader = (key: string, value: string) => { out.headers[key] = value; };
  out.status = (code: number) => { out.code = code; return out; };
  out.json = (body: unknown) => { out.body = body; return out; };
  return out;
};

let r = res();
await signup({ method: 'GET', body: {} }, r);
assert.equal(r.code, 405);

r = res();
await login({ method: 'GET', body: {} }, r);
assert.equal(r.code, 405);

r = res();
await logout({ method: 'GET' }, r);
assert.equal(r.code, 405);

r = res();
await me({ method: 'GET', headers: {} }, r);
assert.equal(r.code, 200);
assert.equal(r.body.user, null);

const originalFetch = globalThis.fetch;
let signupUrl = '';
process.env.VITE_SUPABASE_ANON_KEY = 'anon-test';
(globalThis as any).fetch = async (url: URL | string) => {
  signupUrl = String(url);
  return new Response(JSON.stringify({ user: { id: 'user-1' } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
r = res();
await signup({
  method: 'POST',
  body: {
    fullName: 'Sunan Iskandar',
    email: 'sunan.iskandar36@gmail.com',
    phone: '085890285218',
    companyName: 'Its Syncera',
    companyAddress: 'Jakarta',
    companyPhone: '085890285218',
    password: 'test123',
  },
}, r);
(globalThis as any).fetch = originalFetch;
assert.equal(r.code, 201);
assert.match(signupUrl, /\/auth\/v1\/signup\?redirect_to=https%3A%2F%2Fsync\.ipt\.solutions$/);

console.log('auth endpoint shape ok');
