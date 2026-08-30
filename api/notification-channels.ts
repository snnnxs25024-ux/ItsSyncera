type Row = Record<string, any>;

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
  return { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json', ...extra };
};
const bodyOf = (req: any) => typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
const clean = (value: unknown, max = 240) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const emailList = (value: string) => value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const channelId = (serverId: string) => `notif-email-${serverId.replace(/[^a-z0-9-]/gi, '-')}`;
const severityOf = (value: unknown) => ['critical', 'warning', 'all'].includes(String(value)) ? String(value) : 'critical';
const cooldownOf = (value: unknown) => Math.min(1440, Math.max(15, Number(value || 60) || 60));

const mapChannel = (row: Row) => ({
  id: String(row.id),
  serverId: String(row.server_id ?? ''),
  channel: row.channel ?? 'email',
  recipient: row.recipient ?? '',
  enabled: row.enabled !== false,
  severityFilter: row.severity_filter ?? 'critical',
  cooldownMinutes: Number(row.cooldown_minutes ?? 60),
  lastSentAt: row.last_sent_at ?? '',
  updatedAt: row.updated_at ?? '',
});

const readChannels = async () => {
  const res = await fetch(`${baseUrl}/rest/v1/notification_channels?select=*&channel=eq.email`, { headers: headers() });
  const text = await res.text();
  if (!res.ok) {
    if (text.includes('Could not find the table') || text.includes('PGRST205')) return [];
    throw new ApiError(502, `notification_channels: ${res.status} ${text.slice(0, 160)}`.trim());
  }
  return JSON.parse(text || '[]') as Row[];
};

const upsertChannel = async (input: Row) => {
  const serverId = clean(input.serverId ?? input.server_id, 120);
  const recipients = emailList(clean(input.recipient, 400));
  if (!serverId) throw new ApiError(400, 'serverId wajib diisi');
  if (!recipients.length || recipients.some((email) => !validEmail(email))) throw new ApiError(400, 'Email penerima tidak valid');
  const row = {
    id: channelId(serverId),
    server_id: serverId,
    channel: 'email',
    recipient: recipients.join(', '),
    enabled: input.enabled !== false,
    severity_filter: severityOf(input.severityFilter ?? input.severity_filter),
    cooldown_minutes: cooldownOf(input.cooldownMinutes ?? input.cooldown_minutes),
    updated_at: new Date().toISOString(),
  };
  const res = await fetch(`${baseUrl}/rest/v1/notification_channels?on_conflict=id`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(row),
  });
  const text = await res.text();
  if (!res.ok) throw new ApiError(res.status, `notification_channels upsert: ${text.slice(0, 180)}`.trim());
  return mapChannel(JSON.parse(text || '[]')[0] ?? row);
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const serverId = clean(req.query?.serverId ?? req.query?.server_id, 120);
      const rows = await readChannels();
      const channels = rows.filter((row) => !serverId || String(row.server_id) === serverId).map(mapChannel);
      return res.status(200).json({ success: true, channels });
    }
    if (req.method === 'POST') {
      const channel = await upsertChannel(bodyOf(req));
      return res.status(200).json({ success: true, channel });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'notification channel failed' });
  }
}
