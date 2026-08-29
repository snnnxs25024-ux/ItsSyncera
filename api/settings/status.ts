type StatusLevel = 'connected' | 'configured' | 'not_configured' | 'unavailable' | 'locked';

type StatusItem = {
  name: string;
  status: StatusLevel;
  detail: string;
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const rawSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const baseUrl = (rawSupabaseUrl || 'https://aulljwxosjdaixtzcqjx.supabase.co').replace(/\/$/, '').replace(/\/rest\/v1$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const appUrl = (req: any) => {
  const host = req.headers?.host;
  const proto = String(req.headers?.['x-forwarded-proto'] || (host?.startsWith('localhost') || host?.startsWith('127.') ? 'http' : 'https')).split(',')[0];
  if (host) return `${proto}://${host}`;
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://its-syncera.vercel.app';
};

const checkSupabase = async () => {
  if (!supabaseKey) return { ok: false, detail: 'SUPABASE key missing' };
  try {
    const res = await fetch(`${baseUrl}/rest/v1/servers?select=id&limit=1`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json',
      },
    });
    return { ok: res.ok, detail: res.ok ? 'servers table readable' : `Supabase HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : 'Supabase check failed' };
  }
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      throw new ApiError(405, 'Method not allowed');
    }

    const supabase = await checkSupabase();
    const origin = appUrl(req);
    const system: StatusItem[] = [
      { name: 'Dashboard API', status: 'connected', detail: '/api/dashboard' },
      { name: 'Settings API', status: 'connected', detail: '/api/settings/status' },
      { name: 'Supabase Connection', status: supabase.ok ? 'connected' : 'unavailable', detail: supabase.detail },
      { name: 'Public App URL', status: 'configured', detail: origin },
    ];
    const connectors: StatusItem[] = [
      { name: 'Agent Heartbeat', status: 'connected', detail: '/api/agent/heartbeat' },
      { name: 'Automation Run', status: 'connected', detail: '/api/automation/run' },
      { name: 'Website Monitor', status: 'configured', detail: 'Configured through server connector flow' },
      { name: 'Proxmox API', status: 'not_configured', detail: 'No dedicated Proxmox credential API connected' },
      { name: 'SSH Fallback', status: 'not_configured', detail: 'No SSH key management API connected' },
    ];
    const companyProfile: StatusItem[] = [
      { name: 'Company Name', status: 'not_configured', detail: 'No company profile table connected' },
      { name: 'Admin Email', status: 'not_configured', detail: 'No account settings API connected' },
      { name: 'Phone', status: 'not_configured', detail: 'No account settings API connected' },
      { name: 'Address', status: 'not_configured', detail: 'No account settings API connected' },
    ];
    const notifications: StatusItem[] = [
      { name: 'Email Alerts', status: 'not_configured', detail: 'SMTP/Email provider not connected' },
      { name: 'WhatsApp Alerts', status: 'not_configured', detail: 'WhatsApp bridge not connected' },
      { name: 'Telegram Alerts', status: 'not_configured', detail: 'Telegram notification target not configured' },
      { name: 'Webhook Alerts', status: 'not_configured', detail: 'No webhook target configured' },
    ];
    const security: StatusItem[] = [
      { name: 'Risky Automation', status: 'locked', detail: 'restart/cleanup/restore require approval' },
      { name: 'Restore Action', status: 'locked', detail: 'restore API not enabled' },
      { name: 'Manual Approval', status: 'configured', detail: 'dangerous actions blocked by default' },
    ];

    return res.status(200).json({ success: true, checkedAt: new Date().toISOString(), system, connectors, companyProfile, notifications, security });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'settings status failed' });
  }
}
