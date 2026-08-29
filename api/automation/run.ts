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

const insertRun = async (automation: Row, result: { status: RunStatus; message: string; targetServer: string }) => {
  const stamp = nowIso();
  const row = {
    id: `run-${String(automation.id).replace(/[^a-z0-9-]/gi, '-')}-${Date.now().toString(36)}`,
    automation_id: String(automation.id),
    automation_name: automation.name ?? 'Untitled automation',
    target_server: result.targetServer,
    status: result.status,
    started_at: stamp,
    finished_at: stamp,
    message: result.message,
  };
  const res = await fetch(`${baseUrl}/rest/v1/automation_runs`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  const body = await res.text();
  if (!res.ok) throw new ApiError(502, `automation_runs insert: ${res.status} ${body.slice(0, 160)}`.trim());
  return mapRun(JSON.parse(body || '[]')[0] ?? row);
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

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const runs = (await readOptionalTable('automation_runs'))
        .sort((a, b) => String(b.started_at ?? '').localeCompare(String(a.started_at ?? '')))
        .slice(0, 50)
        .map(mapRun);
      return res.status(200).json({ success: true, runs });
    }

    if (req.method === 'POST') {
      const automations = await readTable('automations');
      const automation = selectAutomation(automations, bodyOf(req).automationId);
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
