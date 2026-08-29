import {
  ApiError,
  anonJsonHeaders,
  bodyOf,
  buildAuthCookie,
  readAuthBody,
  send,
  supabaseUrl,
  validateEmailPassword,
} from './_supabase.ts';

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw new ApiError(405, 'Method not allowed');
    }
    const body = bodyOf(req);
    const input = validateEmailPassword(body.email, body.password);
    const data = await readAuthBody(await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: anonJsonHeaders(),
      body: JSON.stringify(input),
    }));
    return send(res, 200, { success: true, user: data.user }, buildAuthCookie(data.access_token, body.rememberMe ? 604800 : data.expires_in));
  } catch (err) {
    return send(res, err instanceof ApiError ? err.status : 500, { success: false, error: err instanceof Error ? err.message : 'login failed' });
  }
}
