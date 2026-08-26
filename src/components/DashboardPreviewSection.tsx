import React, { useState } from 'react';
import { LayoutDashboard, Server as ServerIcon, Activity, RefreshCw, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, Cpu, HardDrive, Wifi } from 'lucide-react';

export const DashboardPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'servers' | 'monitoring' | 'automation' | 'reports'>('dashboard');

  return (
    <section id="console" className="py-24 bg-gradient-to-b from-sky-50/60 to-white border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1.5 bg-white border border-sky-200 text-sky-700 font-mono text-xs uppercase tracking-wider rounded-none mb-4 shadow-xs">
            Interactive Console Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
            It's Syncera Console
          </h2>
          <p className="text-slate-600 font-sans mt-4 text-base sm:text-lg">
            Antarmuka monitoring enterprise yang responsif dan dirancang untuk kontrol penuh atas seluruh infrastruktur Anda.
          </p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="bg-white border border-sky-200 rounded-none shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
          
          {/* Sidebar */}
          <div className="lg:col-span-3 bg-sky-50/60 border-r border-sky-200 p-4 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 px-3 py-2 border-b border-sky-200">
                <div className="w-8 h-8 bg-sky-500 flex items-center justify-center rounded-none shadow-xs">
                  <ServerIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-slate-900">SYNCERA_OS</div>
                  <div className="text-[10px] text-emerald-600 font-mono font-semibold">v4.9.2 PROD</div>
                </div>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-none text-left transition-all ${
                    activeTab === 'dashboard' 
                      ? 'bg-sky-500 text-white font-bold shadow-xs' 
                      : 'text-slate-700 hover:bg-sky-100 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('servers')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-none text-left transition-all ${
                    activeTab === 'servers' 
                      ? 'bg-sky-500 text-white font-bold shadow-xs' 
                      : 'text-slate-700 hover:bg-sky-100 hover:text-slate-900'
                  }`}
                >
                  <ServerIcon className="w-4 h-4" />
                  <span>Servers (14)</span>
                </button>
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-none text-left transition-all ${
                    activeTab === 'monitoring' 
                      ? 'bg-sky-500 text-white font-bold shadow-xs' 
                      : 'text-slate-700 hover:bg-sky-100 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Monitoring</span>
                </button>
                <button
                  onClick={() => setActiveTab('automation')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-none text-left transition-all ${
                    activeTab === 'automation' 
                      ? 'bg-sky-500 text-white font-bold shadow-xs' 
                      : 'text-slate-700 hover:bg-sky-100 hover:text-slate-900'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Automation</span>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-none text-left transition-all ${
                    activeTab === 'reports' 
                      ? 'bg-sky-500 text-white font-bold shadow-xs' 
                      : 'text-slate-700 hover:bg-sky-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Reports</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-sky-200 font-mono text-[11px] text-slate-500 space-y-2">
              <div className="flex items-center justify-between">
                <span>Cluster Region:</span>
                <span className="text-sky-700 font-bold">ap-southeast-3</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Shield:</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
            </div>
          </div>

          {/* Main Screen */}
          <div className="lg:col-span-9 p-6 sm:p-8 space-y-6 bg-white">
            
            {/* Top Bar inside console */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-sky-100 gap-4">
              <div>
                <h3 className="font-mono text-xl font-bold uppercase tracking-wide text-slate-900">
                  {activeTab === 'dashboard' && 'Infrastructure Overview'}
                  {activeTab === 'servers' && 'Managed Servers Fleet'}
                  {activeTab === 'monitoring' && 'Real-time Telemetry & Metrics'}
                  {activeTab === 'automation' && 'Automated Workflow Engine'}
                  {activeTab === 'reports' && 'Audit Logs & Monthly Reports'}
                </h3>
                <p className="font-mono text-xs text-slate-500 mt-1">
                  Showing active telemetry data for zone ap-southeast-3.
                </p>
              </div>

              <div className="flex items-center space-x-3 font-mono text-xs">
                <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> All Systems Nominal
                </span>
              </div>
            </div>

            {/* Content per Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Health & Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-sky-50/50 border border-sky-200 p-4 shadow-xs">
                    <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Server Health Index</div>
                    <div className="text-2xl font-mono font-bold text-emerald-600 mt-2">99.98%</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">+0.02% from last week</div>
                  </div>
                  <div className="bg-sky-50/50 border border-sky-200 p-4 shadow-xs">
                    <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Avg CPU Load</div>
                    <div className="text-2xl font-mono font-bold text-sky-600 mt-2">34.8%</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">Optimal threshold (&lt;75%)</div>
                  </div>
                  <div className="bg-sky-50/50 border border-sky-200 p-4 shadow-xs">
                    <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Memory Usage</div>
                    <div className="text-2xl font-mono font-bold text-indigo-600 mt-2">12.4 GB / 32 GB</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">38.7% utilization rate</div>
                  </div>
                </div>

                {/* Simulated CPU Chart & Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-sky-50/50 border border-sky-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 font-mono text-xs">
                      <span className="font-bold text-slate-800 uppercase">CPU Core Load Distribution</span>
                      <span className="text-sky-600">8 Cores active</span>
                    </div>
                    <div className="space-y-3 font-mono text-xs">
                      {[
                        { core: 'CPU 01', load: 38, status: 'Normal' },
                        { core: 'CPU 02', load: 42, status: 'Normal' },
                        { core: 'CPU 03', load: 29, status: 'Normal' },
                        { core: 'CPU 04', load: 51, status: 'Optimal' },
                      ].map((c, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-slate-600 text-[11px]">
                            <span>{c.core}</span>
                            <span className="font-bold text-slate-800">{c.load}%</span>
                          </div>
                          <div className="w-full h-2 bg-sky-200/60 rounded-none overflow-hidden">
                            <div className="h-full bg-sky-500" style={{ width: `${c.load}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-sky-50/50 border border-sky-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 font-mono text-xs">
                      <span className="font-bold text-slate-800 uppercase">Automated Maintenance Log</span>
                      <span className="text-emerald-600 font-bold">Autopilot ON</span>
                    </div>
                    <div className="space-y-3 font-mono text-xs text-slate-700">
                      <div className="p-2.5 bg-white border border-sky-200 flex items-center justify-between shadow-xs">
                        <span className="text-slate-600">Disk Cleanup & Cache Purge</span>
                        <span className="text-emerald-600 font-bold">COMPLETED</span>
                      </div>
                      <div className="p-2.5 bg-white border border-sky-200 flex items-center justify-between shadow-xs">
                        <span className="text-slate-600">Security Patch Audit v2.4</span>
                        <span className="text-emerald-600 font-bold">SECURE</span>
                      </div>
                      <div className="p-2.5 bg-white border border-sky-200 flex items-center justify-between shadow-xs">
                        <span className="text-slate-600">Database Index Optimization</span>
                        <span className="text-sky-600 font-bold">OPTIMIZED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'servers' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between mb-2 text-slate-500">
                  <span>ACTIVE NODES FLEET (14 SERVERS)</span>
                  <span className="text-sky-600">REGION: ID-JAKARTA & SG</span>
                </div>
                {[
                  { name: 'prod-api-sg-01', ip: '103.145.2.11', cpu: '24%', ram: '6.2GB', status: 'Online' },
                  { name: 'prod-db-sg-02', ip: '103.145.2.18', cpu: '62%', ram: '22.4GB', status: 'Online' },
                  { name: 'prod-redis-id-01', ip: '36.85.12.90', cpu: '18%', ram: '4.1GB', status: 'Online' },
                  { name: 'staging-app-04', ip: '36.85.12.102', cpu: '5%', ram: '1.8GB', status: 'Idle' },
                ].map((s, i) => (
                  <div key={i} className="bg-sky-50/50 border border-sky-200 p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-none animate-pulse" />
                      <div>
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">{s.ip}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-slate-700">
                      <div>CPU: <strong className="text-slate-900">{s.cpu}</strong></div>
                      <div>RAM: <strong className="text-slate-900">{s.ram}</strong></div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="bg-sky-50/50 border border-sky-200 p-5 space-y-4 shadow-xs">
                  <div className="font-bold text-slate-900 uppercase">Real-Time Bandwidth & Network Throughput</div>
                  <div className="h-32 bg-white border border-sky-200 p-3 flex items-end justify-between space-x-1">
                    {[40, 55, 30, 70, 85, 60, 45, 90, 65, 50, 75, 80, 55, 60, 40, 70, 85, 95].map((val, idx) => (
                      <div key={idx} className="w-full bg-sky-500 hover:bg-sky-600 transition-all" style={{ height: `${val}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>00:00 UTC</span>
                    <span>12:00 UTC</span>
                    <span>Now (Live 1.24 GB/s)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'automation' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="bg-sky-50/50 border border-sky-200 p-5 space-y-3 shadow-xs">
                  <div className="font-bold text-slate-900 uppercase mb-2">Automated Cron & Self-Healing Pipelines</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white border border-sky-200 flex justify-between items-center shadow-xs">
                      <div>
                        <div className="font-bold text-slate-900">Auto-Restart Node on Memory Leak</div>
                        <div className="text-[11px] text-slate-500">Triggered if RAM &gt; 90% for 3 mins</div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold">ACTIVE</span>
                    </div>
                    <div className="p-3 bg-white border border-sky-200 flex justify-between items-center shadow-xs">
                      <div>
                        <div className="font-bold text-slate-900">Daily Cloud Snapshot Backup</div>
                        <div className="text-[11px] text-slate-500">Scheduled daily at 02:00 WIB</div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="bg-sky-50/50 border border-sky-200 p-5 space-y-3 shadow-xs">
                  <div className="font-bold text-slate-900 uppercase mb-2">Monthly Executive Audit & Health Reports</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white border border-sky-200 flex justify-between items-center shadow-xs">
                      <span>July 2026 Infrastructure Audit Report</span>
                      <button className="px-3 py-1 bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors">Download PDF</button>
                    </div>
                    <div className="p-3 bg-white border border-sky-200 flex justify-between items-center shadow-xs">
                      <span>June 2026 Uptime & Security Summary</span>
                      <button className="px-3 py-1 bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors">Download PDF</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};

