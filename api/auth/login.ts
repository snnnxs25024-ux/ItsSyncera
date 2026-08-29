class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const supabaseUrl = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aulljwxosjdaixtzcqjx.supabase.co').replace(/\/$/, '').replace(/\/rest\/v1\/?$/, '');
const anonKey = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const bodyOf = (req: any) => typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
const send = (res: any, status: number, payload: unknown, cookie?: string) => {
  if (cookie) res.setHeader('Set-Cookie', cookie);
  return res.status(status).json(payload);
};
const headers = () => {
  const key = anonKey();
  if (!key) throw new ApiError(500, 'SUPABASE anon key missing');
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
};
const validate = (emailValue: unknown, passwordValue: unknown) => {
  const email = String(emailValue ?? '').trim().toLowerCase();
  const password = String(passwordValue ?? '');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, 'Email tidak valid');
  if (password.length < 6) throw new ApiError(400, 'Password minimal 6 karakter');
  return { email, password };
};
const cookie = (token: string, expiresIn = 3600, secure = process.env.NODE_ENV === 'production') => [
  `syncera_session=${encodeURIComponent(token)}`,
  'Path=/',
  'HttpOnly',
  'SameSite=Lax',
  `Max-Age=${Math.max(0, Math.min(Number(expiresIn) || 3600, 604800))}`,
  secure ? 'Secure' : '',
].filter(Boolean).join('; ');
const readJson = async (res: Response) => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, data.msg || data.error_description || data.error || `Supabase auth HTTP ${res.status}`);
  return data;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw new ApiError(405, 'Method not allowed');
    }
    const body = bodyOf(req);
    const input = validate(body.email, body.password);
    const data = await readJson(await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(input),
    }));
    return send(res, 200, { success: true, user: data.user }, cookie(data.access_token, body.rememberMe ? 604800 : data.expires_in));
  } catch (err) {
    return send(res, err instanceof ApiError ? err.status : 500, { success: false, error: err instanceof Error ? err.message : 'login failed' });
  }
}
