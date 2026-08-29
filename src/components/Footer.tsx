import React from 'react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 py-16 border-t border-sky-100 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <div className="inline-flex">
              <BrandLogo asset="mark" className="h-20 w-auto max-w-[240px]" />
            </div>
            <p className="text-slate-600 font-sans text-sm leading-relaxed">
              Platform Server Monitoring, Maintenance, dan Automation Infrastructure Management berstandar enterprise.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-sky-600 transition-colors">Server Monitoring</a></li>
              <li><a href="#features" className="hover:text-sky-600 transition-colors">Automated Maintenance</a></li>
              <li><a href="#features" className="hover:text-sky-600 transition-colors">Workflow Automation</a></li>
              <li><a href="#features" className="hover:text-sky-600 transition-colors">Security Audit</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="#workflow" className="hover:text-sky-600 transition-colors">Workflow</a></li>
              <li><a href="#features" className="hover:text-sky-600 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-sky-600 transition-colors">Pricing Plans</a></li>
              <li><a href="#features" className="hover:text-sky-600 transition-colors">System Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-4">Legal & Security</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-sky-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Security Compliance</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between text-slate-500">
          <div>
            © {new Date().getFullYear()} It's Syncera. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-none animate-pulse" />
              <span className="text-slate-600">All Systems Operational</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
