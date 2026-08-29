type Row = Record<string, any>;

type RunStatus = 'success' | 'failed' | 'running' | 'blocked';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const baseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aulljwxosjdaixtzcqjx.supabase.co')
  .replace(/\/$/, '')
  .replace(/\/rest\/v1$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const headers = (extra: Record<string, string> = {}) => {
  if (!supabaseKey) throw new ApiError(500, 'SUPABASE key missing');
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: 'application/json',
    ...extra,
  };
};

const readTable = async (table: string) => {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, { headers: headers() });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `${table}: ${res.status} ${body.slice(0, 160)}`.trim());
  return JSON.parse(body || '[]') as Row[];
};

const readOptionalTable = async (table: string) => {
  try {
    return await readTable(table);
  } catch (err) {
    if (err instanceof ApiError && err.message.includes('Could not find the table')) return [];
    throw err;
  }
};

const bodyOf = (req: any) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
};

const nowIso = () => new Date().toISOString();
const nowLabel = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false });
const isSafeType = (type: string) => type === 'health_check' || type === 'monitoring';
const serviceCount = (servers: Row[], status: string) => servers.flatMap((server) => Array.isArray(server.services) ? server.services : []).filter((service) => service.status === status).length;

const mapRun = (row: Row) => ({
  id: String(row.id),
  automationId: row.automation_id ?? row.automationId ?? '',
  automationName: row.automation_name ?? row.automationName ?? '-',
  targetServer: row.target_server ?? row.targetServer ?? '-',
  status: row.status ?? 'blocked',
  startedAt: row.started_at ?? row.startedAt ?? '-',
  finishedAt: row.finished_at ?? row.finishedAt ?? '-',
  message: row.message ?? '-',
});

const selectAutomation = (automations: Row[], id?: string) => {
  if (id) return automations.find((automation) => String(automation.id) === id);
  return automations.find((automation) => automation.status === 'active' && isSafeType(String(automation.type)))
    ?? automations.find((automation) => automation.status === 'active')
    ?? automations[0];
};

const executeAutomation = async (automation: Row): Promise<{ status: RunStatus; message: string; targetServer: string }> => {
  if (automation.status === 'paused') {
    return { status: 'blocked', targetServer: '-', message: 'Automation paused. No action executed.' };
  }

  const type = String(automation.type || 'monitoring');
  if (type === 'health_check') {
    const servers = await readOptionalTable('servers');
    const critical = servers.filter((server) => server.status === 'critical').length;
    const offline = serviceCount(servers, 'offline');
    return { status: 'success', targetServer: 'All servers', message: `Health check read ${servers.length} servers; ${critical} critical; ${offline} offline services.` };
  }

  if (type === 'monitoring') {
    const snapshots = await readOptionalTable('metric_snapshots');
    return { status: 'success', targetServer: 'Metric snapshots', message: `Monitoring check read ${snapshots.length} metric snapshots.` };
  }

  return { status: 'blocked', targetServer: '-', message: `${type} needs approval/connector. No server action executed.` };
};

const insertRunRow = async (row: Row) => {
  const res = await fetch(`${baseUrl}/rest/v1/automation_runs`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `automation_runs insert: ${res.status} ${body.slice(0, 160)}`.trim());
  return mapRun(JSON.parse(body || '[]')[0] ?? row);
};

const insertRun = async (automation: Row, result: { status: RunStatus; message: string; targetServer: string }) => {
  const stamp = nowIso();
  return insertRunRow({
    id: `run-${String(automation.id).replace(/[^a-z0-9-]/gi, '-')}-${Date.now().toString(36)}`,
    automation_id: String(automation.id),
    automation_name: automation.name ?? 'Untitled automation',
    target_server: result.targetServer,
    status: result.status,
    started_at: stamp,
    finished_at: stamp,
    message: result.message,
  });
};

const updateAutomation = async (automation: Row) => {
  const patch: Row = {};
  const nextCount = Number(automation.history_count ?? automation.historyCount ?? 0) + 1;
  if ('last_execution' in automation) patch.last_execution = nowLabel();
  if ('history_count' in automation) patch.history_count = nextCount;
  if ('lastExecution' in automation) patch.lastExecution = nowLabel();
  if ('historyCount' in automation) patch.historyCount = nextCount;
  if (!Object.keys(patch).length) return;

  const res = await fetch(`${baseUrl}/rest/v1/automations?id=eq.${encodeURIComponent(String(automation.id))}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify(patch),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `automations update: ${res.status} ${body.slice(0, 160)}`.trim());
};

const patchServerHealth = async (server: Row, metrics: Row) => {
  const res = await fetch(`${baseUrl}/rest/v1/servers?id=eq.${encodeURIComponent(String(server.id))}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({
      status: 'active',
      connection_status: `Proxmox automation health OK · ${metrics.nodeName || 'node'} · PVE ${metrics.version || '?'}`,
      cpu_usage: metrics.cpuUsage ?? 0,
      memory_usage: metrics.memoryUsage ?? 0,
      storage_usage: metrics.storageUsage ?? 0,
      services: metrics.services || [],
      last_seen: nowLabel(),
      last_check: nowLabel(),
      updated_at: nowIso(),
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `servers update: ${res.status} ${body.slice(0, 160)}`.trim());
};

const insertMetricSnapshot = async (server: Row, metrics: Row) => {
  const row = {
    id: `snap-${String(server.id).replace(/[^a-z0-9-]/gi, '-')}-${Date.now().toString(36)}`,
    server_id: String(server.id),
    server_name: server.name || 'Proxmox server',
    cpu_usage: metrics.cpuUsage ?? 0,
    memory_usage: metrics.memoryUsage ?? 0,
    storage_usage: metrics.storageUsage ?? 0,
    network_traffic: '-',
  };
  const res = await fetch(`${baseUrl}/rest/v1/metric_snapshots`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify(row),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `metric_snapshots insert: ${res.status} ${body.slice(0, 160)}`.trim());
};

const alertId = (server: Row, kind: string) => `alert-proxmox-${String(server.id).replace(/[^a-z0-9-]/gi, '-')}-${kind}`;

const upsertProxmoxAlerts = async (server: Row, metrics: Row) => {
  const name = server.name || 'Proxmox server';
  const services = Array.isArray(metrics.services) ? metrics.services : [];
  const offline = services.filter((service) => service.status === 'offline');
  const detectedAt = nowLabel();
  const issues = [
    Number(metrics.cpuUsage ?? 0) > 90 && { id: alertId(server, 'cpu'), severity: 'critical', title: `CPU tinggi di ${name}` },
    Number(metrics.memoryUsage ?? 0) > 90 && { id: alertId(server, 'memory'), severity: 'warning', title: `RAM tinggi di ${name}` },
    Number(metrics.storageUsage ?? 0) > 85 && { id: alertId(server, 'disk'), severity: 'warning', title: `Disk hampir penuh di ${name}` },
    offline.length > 0 && { id: alertId(server, 'vmct-offline'), severity: 'critical', title: `VM/CT offline di ${name}` },
  ].filter(Boolean) as Row[];
  const rows = issues.map((issue) => ({
    id: issue.id,
    severity: issue.severity,
    title: issue.title,
    server: name,
    detected_at: detectedAt,
    status: 'Monitoring',
    action_taken: 'Auto-created by Proxmox health check; no risky action executed.',
  }));
  if (!rows.length) return [];
  const res = await fetch(`${baseUrl}/rest/v1/alerts?on_conflict=id`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(rows),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `alerts upsert: ${res.status} ${body.slice(0, 160)}`.trim());
  return rows;
};

const proxmoxBaseUrl = (server: Row) => {
  const host = String(server.proxmox_host || server.ip_address || server.ipAddress || '').trim().replace(/\/$/, '');
  if (!host) throw new ApiError(400, 'Host Proxmox wajib diisi');
  if (server.proxmox_url_mode === 'fullUrl') return (/^https?:\/\//i.test(host) ? host : `https://${host}`).replace(/\/$/, '');
  const cleaned = host.replace(/^https?:\/\//i, '').split('/')[0];
  return `https://${cleaned}${/:\d+$/.test(cleaned) ? '' : `:${server.proxmox_port || '8006'}`}`;
};

const findProxmoxServer = (servers: Row[], serverId?: string) => {
  const server = (serverId ? servers.filter((item) => String(item.id) === serverId) : servers).find((item) => item.connection_type === 'proxmox');
  if (!server) throw new ApiError(404, 'Server Proxmox tidak ditemukan');
  if (!String(server.proxmox_token || '').trim()) throw new ApiError(400, 'Server Proxmox belum punya token. Connect Proxmox dulu di menu Servers.');
  return server;
};

const proxmoxFetch = async (base: string, token: string, path: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${base}${path}`, { headers: { Authorization: `PVEAPIToken=${token}`, Accept: 'application/json' }, signal: controller.signal });
    if (!res.ok) throw new ApiError(res.status, `Proxmox API ${res.status}`);
    return JSON.parse(await res.text() || '{}');
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, `Tidak dapat terhubung ke Proxmox: ${err instanceof Error ? err.message : 'unknown'}`);
  } finally {
    clearTimeout(timeout);
  }
};

const collectProxmoxMetrics = async (base: string, token: string) => {
  const version = await proxmoxFetch(base, token, '/api2/json/version');
  const nodesRes = await proxmoxFetch(base, token, '/api2/json/nodes');
  const nodeName = Array.isArray(nodesRes.data) ? nodesRes.data[0]?.node : '';
  if (!nodeName) return { version: version?.data?.version || 'unknown', nodeName: 'node', services: [], cpuUsage: 0, memoryUsage: 0, storageUsage: 0 };
  const statusRes = await proxmoxFetch(base, token, `/api2/json/nodes/${nodeName}/status`);
  const status = statusRes?.data || {};
  const qemu = (await proxmoxFetch(base, token, `/api2/json/nodes/${nodeName}/qemu`))?.data || [];
  const lxc = (await proxmoxFetch(base, token, `/api2/json/nodes/${nodeName}/lxc`))?.data || [];
  const services = [...qemu, ...lxc].map((item: Row) => ({ name: `${item.type === 'lxc' ? 'CT' : 'VM'} ${item.vmid} · ${item.name || 'unnamed'}`, status: item.status === 'running' ? 'online' : 'offline', response: item.status || 'unknown' })).slice(0, 12);
  return {
    version: version?.data?.version || 'unknown',
    nodeName,
    cpuUsage: Math.round(Number(status.cpu ?? 0) * 1000) / 10,
    memoryUsage: status.memory?.total ? Math.round((status.memory.used / status.memory.total) * 1000) / 10 : 0,
    storageUsage: status.rootfs?.total ? Math.round((status.rootfs.used / status.rootfs.total) * 1000) / 10 : 0,
    services,
  };
};

const proxmoxAutomationMessage = (serverName: string, metrics: Row) =>
  `Proxmox health OK: ${serverName} · node ${metrics.nodeName || 'node'} · PVE ${metrics.version || '?'} · VM/CT ${(metrics.services || []).length} · CPU ${metrics.cpuUsage ?? 0}% · RAM ${metrics.memoryUsage ?? 0}% · Disk ${metrics.storageUsage ?? 0}%`;

const executeProxmoxHealth = async (serverId?: string) => {
  const server = findProxmoxServer(await readOptionalTable('servers'), serverId);
  const metrics = await collectProxmoxMetrics(proxmoxBaseUrl(server), String(server.proxmox_token));
  await patchServerHealth(server, metrics);
  await insertMetricSnapshot(server, metrics);
  await upsertProxmoxAlerts(server, metrics);
  return insertRunRow({
    id: `run-proxmox-health-${String(server.id).replace(/[^a-z0-9-]/gi, '-')}-${Date.now().toString(36)}`,
    automation_id: null,
    automation_name: 'Proxmox Health Check',
    target_server: server.name || 'Proxmox server',
    status: 'success',
    started_at: nowIso(),
    finished_at: nowIso(),
    message: proxmoxAutomationMessage(server.name || 'Proxmox server', metrics),
  });
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      // Vercel cron: run Proxmox health check on all connected servers automatically
      if (String(req.headers?.['x-vercel-cron'] || '').trim() || String(req.headers?.['x-vercel-cron-secret'] || '').trim()) {
        const results: Row[] = [];
        for (const server of (await readOptionalTable('servers')).filter((item) => item.connection_type === 'proxmox' && String(item.proxmox_token || '').trim())) {
          try {
            const metrics = await collectProxmoxMetrics(proxmoxBaseUrl(server), String(server.proxmox_token));
            await patchServerHealth(server, metrics);
            await insertMetricSnapshot(server, metrics);
            const alerts = await upsertProxmoxAlerts(server, metrics);
            results.push(await insertRunRow({
              id: `run-proxmox-health-${String(server.id).replace(/[^a-z0-9-]/gi, '-')}-${Date.now().toString(36)}`,
              automation_id: null,
              automation_name: 'Proxmox Auto Health Check',
              target_server: server.name || 'Proxmox server',
              status: 'success',
              started_at: nowIso(),
              finished_at: nowIso(),
              message: proxmoxAutomationMessage(server.name || 'Proxmox server', metrics),
            }));
          } catch (err) {
            results.push({
              id: `run-proxmox-health-${String(server.id).replace(/[^a-z0-9-]/gi, '-')}-${Date.now().toString(36)}`,
              automation_id: null,
              automation_name: 'Proxmox Auto Health Check',
              target_server: server.name || 'Proxmox server',
              status: 'failed',
              started_at: nowIso(),
              finished_at: nowIso(),
              message: `Proxmox health gagal: ${err instanceof Error ? err.message : 'error'}`,
            } as Row);
          }
        }
        return res.status(200).json({ success: true, cron: true, checkedAt: nowIso(), results });
      }
      const runs = (await readOptionalTable('automation_runs'))
        .sort((a, b) => String(b.started_at ?? '').localeCompare(String(a.started_at ?? '')))
        .slice(0, 50)
        .map(mapRun);
      return res.status(200).json({ success: true, runs });
    }

    if (req.method === 'POST') {
      const body = bodyOf(req);
      if (body.type === 'proxmox_health_check') {
        const run = await executeProxmoxHealth(body.serverId ? String(body.serverId) : undefined);
        return res.status(200).json({ success: true, run });
      }

      const automations = await readTable('automations');
      const automation = selectAutomation(automations, body.automationId);
      if (!automation) throw new ApiError(404, 'Automation not found');
      const result = await executeAutomation(automation);
      const run = await insertRun(automation, result);
      await updateAutomation(automation);
      return res.status(200).json({ success: true, run });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'automation run failed' });
  }
}
