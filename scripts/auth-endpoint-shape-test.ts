import assert from 'node:assert/strict';
import login from '../api/auth/login';
import logout from '../api/auth/logout';
import me from '../api/auth/me';
import signup from '../api/auth/signup';

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

console.log('auth endpoint shape ok');
