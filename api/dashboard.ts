import { ApiError, dashboardData } from '../src/server/syncera';

export default async function handler(_req: any, res: any) {
  try {
    res.status(200).json(await dashboardData());
  } catch (err) {
    res.status(err instanceof ApiError ? err.status : 500).json({ error: err instanceof Error ? err.message : 'dashboard fetch failed' });
  }
}
