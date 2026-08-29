const clearCookie = () => 'syncera_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.setHeader('Set-Cookie', clearCookie());
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  res.setHeader('Set-Cookie', clearCookie());
  return res.status(200).json({ success: true });
}
