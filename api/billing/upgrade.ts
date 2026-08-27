type Row = Record<string, any>;

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const baseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://Supa.kidut.online')
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

const bodyOf = (req: any) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
};

const readTable = async (table: string) => {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, { headers: headers() });
  const text = await res.text();
  if (!res.ok) throw new ApiError(502, `${table}: ${res.status} ${text.slice(0, 160)}`.trim());
  return JSON.parse(text || '[]') as Row[];
};

const readOptionalTable = async (table: string) => {
  try {
    return await readTable(table);
  } catch (err) {
    if (err instanceof ApiError && err.message.includes('Could not find the table')) return [];
    throw err;
  }
};

const mapRequest = (row: Row) => ({
  id: String(row.id),
  currentPlan: row.current_plan ?? '-',
  requestedPlan: row.requested_plan ?? '-',
  status: row.status ?? 'pending',
  requestedAt: row.requested_at ?? '-',
  note: row.note ?? '-',
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const requests = (await readOptionalTable('billing_plan_requests'))
        .sort((a, b) => String(b.requested_at ?? '').localeCompare(String(a.requested_at ?? '')))
        .slice(0, 30)
        .map(mapRequest);
      return res.status(200).json({ success: true, requests });
    }

    if (req.method === 'POST') {
      const body = bodyOf(req);
      const requestedPlan = String(body.requestedPlan || '').trim();
      if (!requestedPlan || requestedPlan.length > 80) throw new ApiError(400, 'requestedPlan tidak valid');
      const [account] = await readOptionalTable('billing_accounts');
      const currentPlan = String(account?.plan_name || 'not configured');
      if (requestedPlan.toLowerCase() === currentPlan.toLowerCase()) throw new ApiError(400, 'Plan sudah aktif');

      const row = {
        id: `plan-req-${Date.now().toString(36)}`,
        current_plan: currentPlan,
        requested_plan: requestedPlan,
        status: 'pending',
        requested_at: new Date().toISOString(),
        note: String(body.note || 'Upgrade requested from billing dashboard').slice(0, 240),
      };
      const out = await fetch(`${baseUrl}/rest/v1/billing_plan_requests`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        body: JSON.stringify(row),
      });
      const text = await out.text();
      if (!out.ok) throw new ApiError(502, `billing_plan_requests insert: ${out.status} ${text.slice(0, 160)}`.trim());
      return res.status(201).json({ success: true, request: mapRequest(JSON.parse(text || '[]')[0] ?? row) });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'billing upgrade failed' });
  }
}
