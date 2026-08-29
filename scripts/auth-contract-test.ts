import assert from 'node:assert/strict';
import {
  buildAuthCookie,
  normalizeSupabaseUrl,
  sessionTokenFromCookie,
  toAuthProfile,
  validateEmailPassword,
  validateSignupBody,
} from '../api/auth/_supabase';

assert.equal(normalizeSupabaseUrl('https://demo.supabase.co/rest/v1/'), 'https://demo.supabase.co');
assert.equal(normalizeSupabaseUrl('https://demo.supabase.co/'), 'https://demo.supabase.co');

assert.deepEqual(validateEmailPassword('USER@EXAMPLE.COM ', '123456'), {
  email: 'user@example.com',
  password: '123456',
});
assert.throws(() => validateEmailPassword('bad-email', '123456'), /Email tidak valid/);
assert.throws(() => validateEmailPassword('u@example.com', '12345'), /Password minimal 6 karakter/);

const signup = validateSignupBody({
  email: 'USER@EXAMPLE.COM ',
  password: '123456',
  fullName: ' Sunan ',
  phone: ' 0858 ',
  companyName: ' Syncera ',
  companyAddress: ' Jakarta ',
  companyPhone: ' 021 ',
});
assert.equal(signup.email, 'user@example.com');
assert.equal(signup.fullName, 'Sunan');
assert.throws(() => validateSignupBody({ email: 'u@example.com', password: '123456' }), /Nama lengkap wajib diisi/);
assert.throws(() => validateSignupBody({ email: 'u@example.com', password: '123456', fullName: 'A', phone: '1', companyName: 'C', companyAddress: 'J' }), /Nomor telepon perusahaan wajib diisi/);

assert.deepEqual(
  toAuthProfile({
    userId: 'uid-1',
    email: 'USER@EXAMPLE.COM ',
    fullName: ' Sunan ',
    phone: ' 0858 ',
    companyName: ' Syncera ',
    companyAddress: ' Jakarta ',
    companyPhone: ' 021 ',
  }),
  {
    id: 'uid-1',
    email: 'user@example.com',
    full_name: 'Sunan',
    phone: '0858',
    company_name: 'Syncera',
    company_address: 'Jakarta',
    company_phone: '021',
  },
);

const cookie = buildAuthCookie('token-1', 3600, true);
assert.match(cookie, /syncera_session=token-1/);
assert.match(cookie, /HttpOnly/);
assert.match(cookie, /Secure/);
assert.match(cookie, /SameSite=Lax/);
assert.equal(sessionTokenFromCookie('x=1; syncera_session=token-1; y=2'), 'token-1');

console.log('auth contract ok');
