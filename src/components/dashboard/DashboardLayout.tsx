import React, { useState } from 'react';
import { 
  Server, Activity, AlertTriangle, RefreshCw, ShieldCheck, 
  HardDrive, FileText, CreditCard, LifeBuoy, Settings, LogOut, Menu, X, Bell 
} from 'lucide-react';
import { DashboardTab, ServerItem, AlertItem, AutomationItem, MaintenanceItem, BackupItem, SupportTicket } from '../../types/dashboard';
import { OverviewView } from './views/OverviewView';
import { ServersView } from './views/ServersView';
import { MonitoringView } from './views/MonitoringView';
import { AlertsView } from './views/AlertsView';
import { AutomationView } from './views/AutomationView';
import { MaintenanceView } from './views/MaintenanceView';
import { BackupView } from './views/BackupView';
import { ReportsView } from './views/ReportsView';
import { SubscriptionView } from './views/SubscriptionView';
import { SupportView } from './views/SupportView';
import { SettingsView } from './views/SettingsView';

interface DashboardLayoutProps {
  servers: ServerItem[];
  alerts: AlertItem[];
  automations: AutomationItem[];
  maintenances: MaintenanceItem[];
  backups: BackupItem[];
  tickets: SupportTicket[];
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  servers: initialServers,
  alerts,
  automations,
  maintenances,
  backups,
  tickets,
  onLogout
}) => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [selectedServer, setSelectedServer] = useState<ServerItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [servers, setServers] = useState<ServerItem[]>(initialServers);

  React.useEffect(() => {
    setServers(initialServers);
  }, [initialServers]);

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      if (data.success && data.servers) {
        setServers(data.servers);
        if (selectedServer) {
          const updated = data.servers.find((s: ServerItem) => s.id === selectedServer.id);
          if (updated) setSelectedServer(updated);
        }
      }
    } catch (err) {
      // ignore
    }
  };

  React.useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 4000);
    return () => clearInterval(interval);
  }, [selectedServer?.id]);

  const navigationItems = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: Activity },
    { id: 'servers' as DashboardTab, label: 'Servers', icon: Server },
    { id: 'monitoring' as DashboardTab, label: 'Monitoring', icon: RefreshCw },
    { id: 'alerts' as DashboardTab, label: 'Alerts', icon: AlertTriangle, badge: alerts.filter(a => a.status === 'Monitoring').length },
    { id: 'automation' as DashboardTab, label: 'Automation', icon: ShieldCheck },
    { id: 'maintenance' as DashboardTab, label: 'Maintenance', icon: HardDrive },
    { id: 'backup' as DashboardTab, label: 'Backup', icon: HardDrive },
    { id: 'reports' as DashboardTab, label: 'Reports', icon: FileText },
    { id: 'subscription' as DashboardTab, label: 'Billing', icon: CreditCard },
    { id: 'support' as DashboardTab, label: 'Support', icon: LifeBuoy },
    { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex text-slate-900 antialiased">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-sky-900/50 flex-col fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="p-5 border-b border-sky-900/40 flex items-center space-x-3">
          <div className="w-8 h-8 bg-sky-500 flex items-center justify-center font-mono font-bold text-white shadow-xs">
            S
          </div>
          <div>
            <span className="font-mono text-sm font-bold text-white tracking-wider uppercase block leading-none">It's Syncera</span>
            <span className="font-mono text-[9px] text-sky-400 tracking-widest uppercase block mt-1">Enterprise Cloud</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (item.id !== 'servers') setSelectedServer(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 bg-rose-500 text-white font-mono text-[9px] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sky-900/40">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider text-rose-400 hover:bg-rose-950/30 transition-colors border border-rose-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen bg-sky-50/20">
        {/* Top Navbar */}
        <header className="bg-white border-b border-sky-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-sky-600"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                PRO Enterprise Fleet — Connected
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setCurrentTab('alerts')}
                className="p-2 text-slate-600 hover:text-sky-600 relative border border-sky-200 bg-sky-50/50"
              >
                <Bell className="w-4 h-4" />
                {alerts.filter(a => a.status === 'Monitoring').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {alerts.filter(a => a.status === 'Monitoring').length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-3 border-l border-sky-200 pl-4">
              <div className="w-8 h-8 bg-sky-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                AS
              </div>
              <div className="hidden sm:block font-mono text-xs">
                <span className="font-bold text-slate-900 block leading-none">PT Solusi Utama</span>
                <span className="text-[10px] text-sky-600 uppercase">Enterprise Client</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-sky-800 pb-4">
              <span className="font-mono text-white text-sm font-bold uppercase">It's Syncera Console</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto flex-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileSidebarOpen(false);
                      if (item.id !== 'servers') setSelectedServer(null);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 font-mono text-xs uppercase text-white ${
                      currentTab === item.id ? 'bg-sky-500 font-bold' : 'hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View Switcher Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewView 
              servers={servers} 
              alerts={alerts} 
              onNavigateTab={(tab) => setCurrentTab(tab)} 
              onSelectServer={(srv) => setSelectedServer(srv)} 
            />
          )}
          {currentTab === 'servers' && (
            <ServersView 
              servers={servers} 
              selectedServer={selectedServer} 
              onSelectServer={(srv) => setSelectedServer(srv)} 
              onRefreshServers={fetchServers}
            />
          )}
          {currentTab === 'monitoring' && <MonitoringView servers={servers} />}
          {currentTab === 'alerts' && <AlertsView alerts={alerts} />}
          {currentTab === 'automation' && <AutomationView automations={automations} />}
          {currentTab === 'maintenance' && <MaintenanceView maintenances={maintenances} />}
          {currentTab === 'backup' && <BackupView backups={backups} />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'subscription' && <SubscriptionView />}
          {currentTab === 'support' && <SupportView tickets={tickets} />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
