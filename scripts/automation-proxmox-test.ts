import assert from 'node:assert/strict';
import { findProxmoxServer, proxmoxAutomationMessage } from '../src/lib/proxmoxAutomation.ts';

const servers = [
  { id: 'srv-web', name: 'Website', connection_type: 'agent' },
  { id: 'srv-pve', name: 'PVE Jakarta', connection_type: 'proxmox', proxmox_token: 'root@pam!syncera=secret' },
];

assert.equal(findProxmoxServer(servers, 'srv-pve').id, 'srv-pve');
assert.equal(findProxmoxServer(servers).id, 'srv-pve');
assert.throws(() => findProxmoxServer(servers, 'missing'), /Server Proxmox tidak ditemukan/);
assert.throws(() => findProxmoxServer([{ id: 'srv-pve', name: 'PVE', connection_type: 'proxmox' }]), /belum punya token/);
assert.equal(
  proxmoxAutomationMessage('PVE Jakarta', { nodeName: 'pve', version: '8.2', services: [{}, {}], cpuUsage: 12.3, memoryUsage: 45.6, storageUsage: 78.9 }),
  'Proxmox health OK: PVE Jakarta · node pve · PVE 8.2 · VM/CT 2 · CPU 12.3% · RAM 45.6% · Disk 78.9%',
);

console.log('automation proxmox ok');
