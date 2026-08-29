import assert from 'node:assert/strict';
import { proxmoxBaseUrl } from '../api/connectors/proxmox.ts';

assert.equal(proxmoxBaseUrl({ urlMode: 'hostPort', host: 'server.kidut.online', port: '8006' }), 'https://server.kidut.online:8006');
assert.equal(proxmoxBaseUrl({ urlMode: 'hostPort', host: 'server.kidut.online:8006', port: '8006' }), 'https://server.kidut.online:8006');
assert.equal(proxmoxBaseUrl({ urlMode: 'fullUrl', host: 'https://server.kidut.online/', port: '8006' }), 'https://server.kidut.online');
assert.equal(proxmoxBaseUrl({ urlMode: 'fullUrl', host: 'server.kidut.online', port: '8006' }), 'https://server.kidut.online');

console.log('proxmox url mode ok');
