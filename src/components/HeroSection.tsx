import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Activity, ShieldAlert, CheckCircle2, ArrowRight, Terminal, RefreshCw } from 'lucide-react';

interface HeroSectionProps {
  onStartMonitoring: () => void;
  onViewPricing: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartMonitoring, onViewPricing }) => {
  const [cpuUsage, setCpuUsage] = useState<number>(38.4);
  const [ramUsage, setRamUsage] = useState<number>(14.2);
  const [networkTraffic, setNetworkTraffic] = useState<number>(1.24);
  const [activeTab, setActiveTab] = useState<'cluster-01' | 'cluster-02' | 'edge-sg'>('cluster-01');

  // Simulate live metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => +(prev + (Math.random() * 4 - 2)).toFixed(1));
      setRamUsage((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setNetworkTraffic((prev) => +(prev + (Math.random() * 0.1 - 0.05)).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50/40 text-slate-900 pt-20 pb-28 border-b border-sky-100 relative overflow-hidden">
      {/* Background smooth glow & grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e910_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e910_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-sky-200 text-sky-700 font-mono text-xs uppercase tracking-wider rounded-none shadow-xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-none animate-pulse" />
              <span>Enterprise Infrastructure Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] font-mono">
              Kelola Server <br />
              Lebih Stabil.<br />
              <span className="text-sky-600">Lebih Aman.</span> Lebih Otomatis.
            </h1>

            <p className="text-lg text-slate-600 font-sans max-w-xl leading-relaxed">
              It's Syncera membantu bisnis memonitor, melakukan maintenance, dan mengotomatisasi infrastruktur server agar operasional tetap berjalan optimal tanpa hambatan.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={onStartMonitoring}
                className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-mono text-sm uppercase tracking-wider rounded-none transition-all flex items-center justify-center space-x-3 border border-sky-400 shadow-md"
              >
                <span>Start Monitoring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onViewPricing}
                className="px-8 py-4 bg-white hover:bg-sky-50 text-slate-800 font-mono text-sm uppercase tracking-wider rounded-none transition-all border border-sky-200 hover:border-sky-300 flex items-center justify-center shadow-xs"
              >
                View Pricing
              </button>
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-sky-200 font-mono">
              <div>
                <div className="text-2xl font-bold text-slate-900">99.99%</div>
                <div className="text-xs text-sky-700 uppercase mt-1 font-semibold">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">&lt; 15ms</div>
                <div className="text-xs text-sky-700 uppercase mt-1 font-semibold">Response Latency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">24/7</div>
                <div className="text-xs text-sky-700 uppercase mt-1 font-semibold">Automated Guard</div>
              </div>
            </div>
          </div>

          {/* Right Visual: Professional Pastel-Light Server Console */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-sky-200 rounded-none shadow-xl overflow-hidden">
              {/* Console Header */}
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-none" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-none" />
                  <div className="w-3 h-3 bg-emerald-500 rounded-none" />
                  <span className="font-mono text-xs text-slate-300 ml-2">syncera-core-v4.9.2 // production-cluster</span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 border border-emerald-800">
                  <span className="w-2 h-2 bg-emerald-500 rounded-none animate-ping" />
                  <span>SYSTEM SECURE</span>
                </div>
              </div>

              {/* Cluster Selector Tabs */}
              <div className="flex border-b border-sky-100 bg-sky-50 font-mono text-xs">
                {(['cluster-01', 'cluster-02', 'edge-sg'] as const).map((cluster) => (
                  <button
                    key={cluster}
                    onClick={() => setActiveTab(cluster)}
                    className={`px-4 py-2.5 uppercase tracking-wider border-r border-sky-100 transition-colors ${
                      activeTab === cluster 
                        ? 'bg-white text-sky-700 font-bold border-b-2 border-b-sky-500' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-sky-100/50'
                    }`}
                  >
                    {cluster}
                  </button>
                ))}
              </div>

              {/* Console Body */}
              <div className="p-6 space-y-6 bg-sky-50/40">
                {/* Status bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-3 border border-sky-200 shadow-xs">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Server Status</div>
                    <div className="text-sm font-mono font-bold text-emerald-600 flex items-center mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> 14 Online
                    </div>
                  </div>
                  <div className="bg-white p-3 border border-sky-200 shadow-xs">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">CPU Usage</div>
                    <div className="text-sm font-mono font-bold text-sky-600 flex items-center mt-1">
                      <Cpu className="w-3.5 h-3.5 mr-1.5" /> {cpuUsage}%
                    </div>
                  </div>
                  <div className="bg-white p-3 border border-sky-200 shadow-xs">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">RAM Active</div>
                    <div className="text-sm font-mono font-bold text-indigo-600 flex items-center mt-1">
                      <HardDrive className="w-3.5 h-3.5 mr-1.5" /> {ramUsage} GB
                    </div>
                  </div>
                  <div className="bg-white p-3 border border-sky-200 shadow-xs">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Network Out</div>
                    <div className="text-sm font-mono font-bold text-slate-800 flex items-center mt-1">
                      <Activity className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> {networkTraffic} GB/s
                    </div>
                  </div>
                </div>

                {/* Simulated Chart/Logs */}
                <div className="bg-white p-4 border border-sky-200 space-y-3 font-mono text-xs shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] border-b border-sky-100 pb-2">
                    <span className="uppercase tracking-wider flex items-center font-semibold text-slate-700">
                      <Terminal className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> Live Telemetry & Automation Feed
                    </span>
                    <span className="text-emerald-600 font-bold animate-pulse">● LIVE SYNC</span>
                  </div>

                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-center justify-between py-1 border-b border-sky-50">
                      <span className="text-slate-400">[08:28:10 WIB]</span>
                      <span className="text-sky-700 font-medium">Auto-scaling triggered (Nodes: 12 → 14)</span>
                      <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold">OPTIMIZED</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-sky-50">
                      <span className="text-slate-400">[08:25:40 WIB]</span>
                      <span className="text-emerald-700 font-medium">Daily incremental disk snapshot completed</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">SUCCESS</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">[08:20:12 WIB]</span>
                      <span className="text-slate-700 font-medium">SSL Certificate renewed automatically for *.syncera.io</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold">SECURE</span>
                    </div>
                  </div>
                </div>

                {/* Automation Workflow Indicator */}
                <div className="bg-white p-3.5 border border-sky-200 flex items-center justify-between text-xs font-mono shadow-xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sky-100 border border-sky-200 text-sky-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold">Active Workflow: Self-Healing Node</div>
                      <div className="text-[11px] text-slate-500">Next scheduled health audit in 4m 12s</div>
                    </div>
                  </div>
                  <span className="text-xs text-sky-700 bg-sky-100 px-2.5 py-1 border border-sky-200 font-bold">
                    AUTOMATED
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

