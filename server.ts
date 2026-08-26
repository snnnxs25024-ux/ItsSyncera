import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface ServerNode {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'critical' | 'maintenance';
  os: string;
  ipAddress: string;
  provider: string;
  location: string;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkTraffic: string;
  lastCheck: string;
  isCustomLocal?: boolean;
  services: {
    name: string;
    status: 'online' | 'degraded' | 'offline';
    response: string;
  }[];
}

let serversDb: ServerNode[] = [
  {
    id: 'srv-01',
    name: 'prod-cluster-sg-01',
    status: 'active',
    os: 'Ubuntu 24.04 LTS x86_64',
    ipAddress: '103.245.18.92',
    provider: 'AWS Singapore (ap-southeast-1)',
    location: 'Singapore DC-2',
    cpuUsage: 42,
    memoryUsage: 68,
    storageUsage: 54,
    networkTraffic: '1.2 GB/s',
    lastCheck: '10 detik lalu',
    services: [
      { name: 'Nginx Web Server', status: 'online', response: '12ms' },
      { name: 'PostgreSQL Primary DB', status: 'online', response: '4ms' },
      { name: 'Docker Engine', status: 'online', response: '8ms' },
      { name: 'Node.js App Cluster', status: 'online', response: '18ms' }
    ]
  },
  {
    id: 'srv-02',
    name: 'prod-cluster-sg-02',
    status: 'active',
    os: 'Ubuntu 24.04 LTS x86_64',
    ipAddress: '103.245.18.93',
    provider: 'AWS Singapore (ap-southeast-1)',
    location: 'Singapore DC-2',
    cpuUsage: 38,
    memoryUsage: 62,
    storageUsage: 51,
    networkTraffic: '950 MB/s',
    lastCheck: '12 detik lalu',
    services: [
      { name: 'Nginx Web Server', status: 'online', response: '14ms' },
      { name: 'PostgreSQL Replica', status: 'online', response: '6ms' },
      { name: 'Docker Engine', status: 'online', response: '9ms' },
      { name: 'Node.js App Cluster', status: 'online', response: '16ms' }
    ]
  },
  {
    id: 'srv-03',
    name: 'staging-api-node',
    status: 'warning',
    os: 'Debian 12 Bookworm',
    ipAddress: '202.162.44.11',
    provider: 'TelkomCloud Jakarta',
    location: 'Jakarta DC-1',
    cpuUsage: 89,
    memoryUsage: 91,
    storageUsage: 78,
    networkTraffic: '420 MB/s',
    lastCheck: '5 detik lalu',
    services: [
      { name: 'Nginx Web Server', status: 'online', response: '22ms' },
      { name: 'Redis Cache', status: 'degraded', response: '85ms' },
      { name: 'Docker Engine', status: 'online', response: '11ms' },
      { name: 'API Gateway', status: 'online', response: '29ms' }
    ]
  },
  {
    id: 'srv-04',
    name: 'analytics-worker-01',
    status: 'critical',
    os: 'Ubuntu 22.04 LTS',
    ipAddress: '194.31.88.15',
    provider: 'Google Cloud Jakarta',
    location: 'Jakarta DC-3',
    cpuUsage: 98,
    memoryUsage: 95,
    storageUsage: 92,
    networkTraffic: '2.4 GB/s',
    lastCheck: '2 detik lalu',
    services: [
      { name: 'Kafka Stream', status: 'degraded', response: '140ms' },
      { name: 'ClickHouse DB', status: 'online', response: '24ms' },
      { name: 'Python Worker Pool', status: 'offline', response: 'Timeout' },
      { name: 'Prometheus Exporter', status: 'online', response: '15ms' }
    ]
  },
  {
    id: 'srv-05',
    name: 'cache-redis-cluster',
    status: 'active',
    os: 'Alpine Linux 3.20',
    ipAddress: '103.245.19.04',
    provider: 'AWS Singapore (ap-southeast-1)',
    location: 'Singapore DC-2',
    cpuUsage: 22,
    memoryUsage: 45,
    storageUsage: 28,
    networkTraffic: '3.1 GB/s',
    lastCheck: '15 detik lalu',
    services: [
      { name: 'Redis Sentinel', status: 'online', response: '2ms' },
      { name: 'Redis Master', status: 'online', response: '1ms' },
      { name: 'Node Exporter', status: 'online', response: '5ms' }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/servers", (req, res) => {
    res.json({ success: true, servers: serversDb });
  });

  app.post("/api/servers", (req, res) => {
    const { name, ipAddress, os, provider, location } = req.body;
    if (!name || !ipAddress) {
      return res.status(400).json({ success: false, error: "Name and IP Address are required" });
    }

    const newServer: ServerNode = {
      id: `srv-custom-${Date.now()}`,
      name,
      status: 'active',
      os: os || 'Ubuntu 24.04 LTS',
      ipAddress,
      provider: provider || 'Local Test Machine / On-Premise',
      location: location || 'Local DC',
      cpuUsage: Math.floor(15 + Math.random() * 35),
      memoryUsage: Math.floor(30 + Math.random() * 40),
      storageUsage: Math.floor(20 + Math.random() * 30),
      networkTraffic: '450 MB/s',
      lastCheck: 'Baru saja',
      isCustomLocal: true,
      services: [
        { name: 'Syncera Agent Daemon', status: 'online', response: '2ms' },
        { name: 'Node.js Runtime', status: 'online', response: '5ms' }
      ]
    };

    serversDb.push(newServer);
    res.json({ success: true, server: newServer, message: "Server added successfully" });
  });

  // Ingest real telemetry from local agent
  app.post("/api/servers/:id/telemetry", (req, res) => {
    const { id } = req.params;
    const { cpuUsage, memoryUsage, storageUsage, networkTraffic } = req.body;

    const server = serversDb.find(s => s.id === id);
    if (!server) {
      return res.status(404).json({ success: false, error: "Server not found" });
    }

    if (cpuUsage !== undefined) server.cpuUsage = Number(cpuUsage);
    if (memoryUsage !== undefined) server.memoryUsage = Number(memoryUsage);
    if (storageUsage !== undefined) server.storageUsage = Number(storageUsage);
    if (networkTraffic !== undefined) server.networkTraffic = String(networkTraffic);
    server.lastCheck = 'Baru saja';
    server.status = server.cpuUsage > 90 ? 'critical' : server.cpuUsage > 75 ? 'warning' : 'active';

    res.json({ success: true, message: "Telemetry received", server });
  });

  // Provide download script for local agent testing
  app.get("/api/agent-script/:id", (req, res) => {
    const { id } = req.params;
    const server = serversDb.find(s => s.id === id);
    if (!server) {
      return res.status(404).send("Server not found");
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const endpoint = `${protocol}://${host}/api/servers/${id}/telemetry`;

    const scriptContent = `/**
 * It's Syncera Real-time Telemetry Agent
 * Run this on your local machine or server: node agent.js
 * Requires Node.js installed.
 */
const os = require('os');
const http = require('http');
const https = require('https');

const ENDPOINT = "${endpoint}";

function getCPUUsage() {
  const cpus = os.cpus();
  let idleMs = 0;
  let totalMs = 0;
  cpus.forEach(core => {
    for (const type in core.times) {
      totalMs += core.times[type];
    }
    idleMs += core.times.idle;
  });
  const usage = Math.round(100 - (100 * idleMs / totalMs));
  return Math.min(100, Math.max(1, usage));
}

function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return Math.round((used / total) * 100);
}

function sendTelemetry() {
  const data = JSON.stringify({
    cpuUsage: getCPUUsage(),
    memoryUsage: getMemoryUsage(),
    storageUsage: 45,
    networkTraffic: (Math.random() * 1.5).toFixed(2) + " GB/s"
  });

  const url = new URL(ENDPOINT);
  const client = url.protocol === 'https:' ? https : http;

  const req = client.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(\`[\${new Date().toLocaleTimeString()}] Syncera Agent sent telemetry successfully. Status: \${res.statusCode}\`);
    });
  });

  req.on('error', (err) => {
    console.error('Telemetry error:', err.message);
  });

  req.write(data);
  req.end();
}

console.log('🚀 It\'s Syncera Local Agent started for server: ${server.name} (${server.ipAddress})');
console.log('Reporting telemetry every 5 seconds to: ' + ENDPOINT);
setInterval(sendTelemetry, 5000);
sendTelemetry();
`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(scriptContent);
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
