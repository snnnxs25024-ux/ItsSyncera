type AuthProfileInput = {
  userId: string;
  email: string;
  fullName?: string;
  phone?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const normalizeSupabaseUrl = (url: string) => url.replace(/\/$/, '').replace(/\/rest\/v1\/?$/, '');
export const supabaseUrl = () => normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aulljwxosjdaixtzcqjx.supabase.co');
export const serviceKey = () => process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
export const anonKey = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const clean = (value: unknown, max = 160) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

export const validateEmailPassword = (emailValue: unknown, passwordValue: unknown) => {
  const email = clean(emailValue, 254).toLowerCase();
  const password = String(passwordValue ?? '');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, 'Email tidak valid');
  if (password.length < 6) throw new ApiError(400, 'Password minimal 6 karakter');
  return { email, password };
};

export const validateSignupBody = (body: Record<string, unknown>) => {
  const { email, password } = validateEmailPassword(body.email, body.password);
  const fullName = clean(body.fullName, 120);
  const phone = clean(body.phone, 40);
  const companyName = clean(body.companyName, 160);
  const companyAddress = clean(body.companyAddress, 240);
  const companyPhone = clean(body.companyPhone, 40);
  if (!fullName) throw new ApiError(400, 'Nama lengkap wajib diisi');
  if (!phone) throw new ApiError(400, 'Nomor HP wajib diisi');
  if (!companyName) throw new ApiError(400, 'Nama perusahaan wajib diisi');
  if (!companyAddress) throw new ApiError(400, 'Alamat perusahaan wajib diisi');
  if (!companyPhone) throw new ApiError(400, 'Nomor telepon perusahaan wajib diisi');
  return { email, password, fullName, phone, companyName, companyAddress, companyPhone };
};

export const toAuthProfile = (input: AuthProfileInput) => ({
  id: input.userId,
  email: clean(input.email, 254).toLowerCase(),
  full_name: clean(input.fullName, 120),
  phone: clean(input.phone, 40),
  company_name: clean(input.companyName, 160),
  company_address: clean(input.companyAddress, 240),
  company_phone: clean(input.companyPhone, 40),
});

export const buildAuthCookie = (token: string, expiresIn = 3600, secure = process.env.NODE_ENV === 'production') => [
  `syncera_session=${encodeURIComponent(token)}`,
  'Path=/',
  'HttpOnly',
  'SameSite=Lax',
  `Max-Age=${Math.max(0, Math.min(Number(expiresIn) || 3600, 604800))}`,
  secure ? 'Secure' : '',
].filter(Boolean).join('; ');

export const clearAuthCookie = () => 'syncera_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

const headerFor = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

export const jsonHeaders = () => {
  const key = serviceKey() || anonKey();
  if (!key) throw new ApiError(500, 'SUPABASE key missing');
  return headerFor(key);
};

export const anonJsonHeaders = () => {
  const key = anonKey();
  if (!key) throw new ApiError(500, 'SUPABASE anon key missing');
  return headerFor(key);
};

export const userAuthHeaders = (token: string) => {
  const key = anonKey() || serviceKey();
  if (!key) throw new ApiError(500, 'SUPABASE key missing');
  return { ...headerFor(key), Authorization: `Bearer ${token}` };
};

export const bodyOf = (req: any) => typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

export const sessionTokenFromCookie = (cookieHeader = '') => cookieHeader
  .split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith('syncera_session='))
  ?.slice('syncera_session='.length);

export const send = (res: any, status: number, payload: unknown, cookie?: string) => {
  if (cookie) res.setHeader('Set-Cookie', cookie);
  return res.status(status).json(payload);
};

export const readAuthBody = async (res: Response) => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, data.msg || data.error_description || data.error || `Supabase auth HTTP ${res.status}`);
  return data;
};
