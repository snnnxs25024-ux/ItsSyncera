import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ApiError, createServerRecord, dashboardData, listServers } from './src/server/syncera';

const bodyOf = (req: express.Request) => typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // API Routes
  app.get("/api/dashboard", async (req, res) => {
    try {
      res.json(await dashboardData());
    } catch (err) {
      res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'dashboard fetch failed' });
    }
  });

  app.get("/api/servers", async (req, res) => {
    try {
      res.json({ success: true, servers: await listServers() });
    } catch (err) {
      res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'servers fetch failed' });
    }
  });

  app.post("/api/servers", async (req, res) => {
    try {
      res.status(201).json({ success: true, server: await createServerRecord(bodyOf(req)) });
    } catch (err) {
      res.status(err instanceof ApiError ? err.status : 500).json({ success: false, error: err instanceof Error ? err.message : 'server create failed' });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
