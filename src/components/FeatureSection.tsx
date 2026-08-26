import React from 'react';
import { Activity, Wrench, RefreshCw, ShieldCheck, Cpu, Database, Network, Server } from 'lucide-react';

export const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <Activity className="w-6 h-6 text-sky-600" />,
      title: "Monitoring Server",
      subtitle: "Pantau kondisi real-time infrastructure metrics",
      items: [
        "CPU Load & Core Performance",
        "RAM Allocation & Leak Detection",
        "Storage IOPS & Disk Capacity",
        "Network Bandwidth & Latency"
      ]
    },
    {
      icon: <Wrench className="w-6 h-6 text-sky-600" />,
      title: "Maintenance Server",
      subtitle: "Preventive upkeep & system hygiene",
      items: [
        "Automated System Health Check",
        "Performance Optimization Scripts",
        "OS & Package Update Monitoring",
        "Log Rotation & Garbage Cleanup"
      ]
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-sky-600" />,
      title: "Automation",
      subtitle: "Eliminate manual operational bottlenecks",
      items: [
        "Automated Task Scheduling (Cron)",
        "Self-Healing Error Recovery",
        "Custom DevOps Workflow Pipelines",
        "Instant Webhook & Slack Alerts"
      ]
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
      title: "Backup & Security",
      subtitle: "Enterprise-grade data protection & audits",
      items: [
        "Automated Backup Verification",
        "Vulnerability & Security Checking",
        "Encrypted Data Transit & Rest",
        "Access Control & Audit Trail"
      ]
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-sky-50/60 border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 font-mono text-xs uppercase tracking-wider rounded-none mb-4 shadow-xs">
            Core Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
            Satu Sistem Untuk Mengelola Infrastruktur Server
          </h2>
          <p className="text-slate-600 font-sans mt-4 text-base sm:text-lg">
            Platform terpadu yang dirancang khusus untuk DevOps, SysAdmin, dan engineering team enterprise.
          </p>
        </div>

        {/* Grid of Square Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white border border-sky-200 rounded-none p-8 hover:border-sky-400 transition-all group shadow-xs"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-sky-50 border border-sky-200 flex items-center justify-center rounded-none group-hover:border-sky-400 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-500 font-sans">{feature.subtitle}</p>
                </div>
              </div>

              <div className="border-t border-sky-100 pt-6">
                <ul className="space-y-3 font-mono text-sm text-slate-700">
                  {feature.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center space-x-3">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-none" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

