import { ApiError, createServerRecord, listServers } from '../src/server/syncera';

const bodyOf = (req: any) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') return res.status(200).json({ success: true, servers: await listServers() });
    if (req.method === 'POST') return res.status(201).json({ success: true, server: await createServerRecord(bodyOf(req)) });
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'servers request failed' });
  }
}
