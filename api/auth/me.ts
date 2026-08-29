import { ApiError, readAuthBody, send, sessionTokenFromCookie, supabaseUrl, userAuthHeaders } from './_supabase';

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      throw new ApiError(405, 'Method not allowed');
    }
    const token = sessionTokenFromCookie(String(req.headers?.cookie || ''));
    if (!token) return send(res, 200, { success: true, user: null });
    const user = await readAuthBody(await fetch(`${supabaseUrl()}/auth/v1/user`, {
      headers: userAuthHeaders(decodeURIComponent(token)),
    }));
    return send(res, 200, { success: true, user });
  } catch {
    return send(res, 200, { success: true, user: null });
  }
}
