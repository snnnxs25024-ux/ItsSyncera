import React from 'react';
import { Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] text-slate-400 py-16 border-t border-[#1E293B] font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-[#2563EB] flex items-center justify-center rounded-none border border-blue-400">
                <Server className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono text-lg font-bold tracking-wider uppercase">
                It's Syncera
              </span>
            </div>
            <p className="text-slate-400 font-sans text-sm leading-relaxed">
              Platform Server Monitoring, Maintenance, dan Automation Infrastructure Management berstandar enterprise.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Server Monitoring</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Automated Maintenance</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Workflow Automation</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Security Audit</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="#workflow" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
              <li><a href="#console" className="hover:text-cyan-400 transition-colors">API Reference</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing Plans</a></li>
              <li><a href="#console" className="hover:text-cyan-400 transition-colors">System Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Legal & Security</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Security Compliance</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500">
          <div>
            © {new Date().getFullYear()} It's Syncera Inc. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-none animate-pulse" />
              <span className="text-slate-400">All Systems Operational</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
