import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import handlerAgentHeartbeat from './api/agent/heartbeat';
import handlerAgentInstall from './api/agent/install';
import handlerAutomationRun from './api/automation/run';
import handlerBillingUpgrade from './api/billing/upgrade';
import handlerDashboard from './api/dashboard';
import handlerServers from './api/servers';
import handlerSettingsStatus from './api/settings/status';

const runHandler = (handler: (req: any, res: any) => unknown) => (req: express.Request, res: express.Response) => handler(req, res);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // API Routes
  app.get("/api/dashboard", runHandler(handlerDashboard));
  app.get("/api/automation/run", runHandler(handlerAutomationRun));
  app.post("/api/automation/run", runHandler(handlerAutomationRun));
  app.get("/api/billing/upgrade", runHandler(handlerBillingUpgrade));
  app.post("/api/billing/upgrade", runHandler(handlerBillingUpgrade));
  app.get("/api/agent/install", runHandler(handlerAgentInstall));
  app.post("/api/agent/heartbeat", runHandler(handlerAgentHeartbeat));
  app.get("/api/servers", runHandler(handlerServers));
  app.post("/api/servers", runHandler(handlerServers));
  app.get("/api/settings/status", runHandler(handlerSettingsStatus));


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
