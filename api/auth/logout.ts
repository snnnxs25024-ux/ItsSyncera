import { clearAuthCookie, send } from './_supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { success: false, error: 'Method not allowed' });
  }
  return send(res, 200, { success: true }, clearAuthCookie());
}
