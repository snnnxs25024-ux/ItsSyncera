class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const supabaseUrl = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aulljwxosjdaixtzcqjx.supabase.co').replace(/\/$/, '').replace(/\/rest\/v1\/?$/, '');
const anonKey = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const clean = (value: unknown, max = 160) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const bodyOf = (req: any) => typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
const appUrl = (req: any) => {
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
  if (host) return `${req.headers?.['x-forwarded-proto'] || 'https'}://${host}`.replace(/\/$/, '');
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://its-syncera.vercel.app';
};
const send = (res: any, status: number, payload: unknown) => res.status(status).json(payload);
const headers = () => {
  const key = anonKey();
  if (!key) throw new ApiError(500, 'SUPABASE anon key missing');
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
};

const validate = (body: Record<string, unknown>) => {
  const email = clean(body.email, 254).toLowerCase();
  const password = String(body.password ?? '');
  const fullName = clean(body.fullName, 120);
  const phone = clean(body.phone, 40);
  const companyName = clean(body.companyName, 160);
  const companyAddress = clean(body.companyAddress, 240);
  const companyPhone = clean(body.companyPhone, 40);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, 'Email tidak valid');
  if (password.length < 6) throw new ApiError(400, 'Password minimal 6 karakter');
  if (!fullName) throw new ApiError(400, 'Nama lengkap wajib diisi');
  if (!phone) throw new ApiError(400, 'Nomor HP wajib diisi');
  if (!companyName) throw new ApiError(400, 'Nama perusahaan wajib diisi');
  if (!companyAddress) throw new ApiError(400, 'Alamat perusahaan wajib diisi');
  if (!companyPhone) throw new ApiError(400, 'Nomor telepon perusahaan wajib diisi');
  return { email, password, fullName, phone, companyName, companyAddress, companyPhone };
};

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
    const input = validate(bodyOf(req));
    const data = await readJson(await fetch(`${supabaseUrl()}/auth/v1/signup?redirect_to=${encodeURIComponent(appUrl(req))}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        data: {
          full_name: input.fullName,
          phone: input.phone,
          company_name: input.companyName,
          company_address: input.companyAddress,
          company_phone: input.companyPhone,
        },
      }),
    }));
    return send(res, 201, { success: true, message: 'Akun dibuat. Silakan login.', user: data.user });
  } catch (err) {
    return send(res, err instanceof ApiError ? err.status : 500, { success: false, error: err instanceof Error ? err.message : 'signup failed' });
  }
}
