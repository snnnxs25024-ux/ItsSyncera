import assert from 'node:assert/strict';
import { composeProxmoxToken } from '../src/lib/proxmoxToken.ts';

assert.equal(
  composeProxmoxToken({ user: 'root@pam', tokenId: 'syncera', secret: 'abc-123' }),
  'root@pam!syncera=abc-123',
);
assert.throws(() => composeProxmoxToken({ user: '', tokenId: 'syncera', secret: 'abc' }), /User Proxmox wajib diisi/);
assert.throws(() => composeProxmoxToken({ user: 'root@pam', tokenId: '', secret: 'abc' }), /Token ID wajib diisi/);
assert.throws(() => composeProxmoxToken({ user: 'root@pam', tokenId: 'syncera', secret: '' }), /Secret token wajib diisi/);

console.log('proxmox token compose ok');
