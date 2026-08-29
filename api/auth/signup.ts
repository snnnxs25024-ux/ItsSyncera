import {
  anonJsonHeaders,
  ApiError,
  bodyOf,
  readAuthBody,
  send,
  supabaseUrl,
  validateSignupBody,
} from './_supabase.ts';

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw new ApiError(405, 'Method not allowed');
    }
    const input = validateSignupBody(bodyOf(req));
    const data = await readAuthBody(await fetch(`${supabaseUrl()}/auth/v1/signup`, {
      method: 'POST',
      headers: anonJsonHeaders(),
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
