import assert from 'node:assert/strict';
import fs from 'node:fs';

const expectRed = process.argv.includes('--expect-red');
const base = process.env.BASE_URL || 'http://127.0.0.1:3011';
const names = ['connector-web-test', 'connector-agent-test'];

const localEnv = (key) => {
  try {
    const text = fs.readFileSync('/opt/data/scripts/proxmox_sync_env.sh', 'utf8');
    return text.match(new RegExp(`^export\\s+${key}=(['\"]?)(.*?)\\1$`, 'm'))?.[2];
  } catch {
    return undefined;
  }
};

const supabaseUrl = (process.env.SUPABASE_URL || localEnv('SUPABASE_URL') || 'https://Supa.kidut.online').replace(/\/$/, '').replace(/\/rest\/v1$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_KEY || localEnv('SUPABASE_SERVICE_KEY');

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text || '{}'); } catch { data = { raw: text }; }
  return { res, data };
}

async function cleanup() {
  if (!serviceKey) return;
  for (const name of names) {
    await fetch(`${supabaseUrl}/rest/v1/servers?name=eq.${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'return=minimal' },
    }).catch(() => {});
  }
}

async function testWebsiteConnector() {
  const { res, data } = await request('/api/servers', {
    method: 'POST',
    body: JSON.stringify({
      name: 'connector-web-test',
      ipAddress: 'https://its-syncera.vercel.app',
      os: 'HTTP endpoint',
      provider: 'Website Monitor',
      location: 'Public Internet',
      connectionType: 'website',
      connectorKind: 'website',
    }),
  });
  assert.equal(res.status, 201, JSON.stringify(data));
  assert.equal(data.success, true);
  assert.equal(data.server.name, 'connector-web-test');
  assert.match(data.server.connectionStatus, /Website Monitor:/);
  assert.equal(data.server.services[0].name, 'HTTP');
  assert.match(data.server.networkTraffic, /ms/);
}

async function testAgentHeartbeat() {
  const created = await request('/api/servers', {
    method: 'POST',
    body: JSON.stringify({
      name: 'connector-agent-test',
      ipAddress: 'agent.local',
      os: 'Ubuntu',
      provider: 'VPS',
      location: 'QA',
      connectionType: 'agent',
    }),
  });
  assert.equal(created.res.status, 201, JSON.stringify(created.data));
  assert.ok(created.data.agentToken, 'agentToken missing');
  assert.match(created.data.installCommand, /api\/agent\/install/);

  const hb = await request('/api/agent/heartbeat', {
    method: 'POST',
    body: JSON.stringify({
      serverId: created.data.server.id,
      token: created.data.agentToken,
      os: 'Ubuntu 24.04',
      cpuUsage: 12,
      memoryUsage: 34,
      storageUsage: 56,
      uptime: 'up 1 hour',
      networkTraffic: 'rx 1MB tx 2MB',
      services: [{ name: 'nginx', status: 'online', response: 'active' }],
    }),
  });
  assert.equal(hb.res.status, 200, JSON.stringify(hb.data));
  assert.equal(hb.data.success, true);
  assert.equal(hb.data.server.cpuUsage, 12);
  assert.equal(hb.data.server.memoryUsage, 34);
  assert.equal(hb.data.server.storageUsage, 56);
  assert.equal(hb.data.server.status, 'active');
}

try {
  await cleanup();
  await testWebsiteConnector();
  await testAgentHeartbeat();
  await cleanup();
  if (expectRed) throw new Error('expected RED, got GREEN');
  console.log('connector hub checks passed');
} catch (err) {
  await cleanup();
  if (expectRed) {
    console.log('RED_EXPECTED', err instanceof Error ? err.message : err);
    process.exit(0);
  }
  throw err;
}
