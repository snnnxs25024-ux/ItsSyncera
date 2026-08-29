class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const supabaseUrl = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aulljwxosjdaixtzcqjx.supabase.co').replace(/\/$/, '').replace(/\/rest\/v1\/?$/, '');
const anonKey = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const send = (res: any, status: number, payload: unknown) => res.status(status).json(payload);
const sessionToken = (cookieHeader = '') => cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith('syncera_session='))?.slice('syncera_session='.length);
const headers = (token: string) => {
  const key = anonKey();
  if (!key) throw new ApiError(500, 'SUPABASE anon key missing');
  return { apikey: key, Authorization: `Bearer ${decodeURIComponent(token)}`, Accept: 'application/json' };
};
const readJson = async (res: Response) => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, data.msg || data.error_description || data.error || `Supabase auth HTTP ${res.status}`);
  return data;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      throw new ApiError(405, 'Method not allowed');
    }
    const token = sessionToken(String(req.headers?.cookie || ''));
    if (!token) return send(res, 200, { success: true, user: null });
    const user = await readJson(await fetch(`${supabaseUrl()}/auth/v1/user`, { headers: headers(token) }));
    return send(res, 200, { success: true, user });
  } catch {
    return send(res, 200, { success: true, user: null });
  }
}
