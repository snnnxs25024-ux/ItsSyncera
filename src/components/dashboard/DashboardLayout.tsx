import React, { useState } from 'react';
import {
  Server, Activity, AlertTriangle, RefreshCw, ShieldCheck,
  HardDrive, FileText, CreditCard, LifeBuoy, Settings, LogOut, Menu, X, Bell, ChevronLeft, ChevronRight
} from 'lucide-react';
import { DashboardTab, ServerItem, AlertItem, AutomationItem, AutomationRule, AutomationRun, BillingAccount, BillingInvoice, BillingPlan, BillingPlanRequest, MaintenanceItem, BackupItem, SupportTicket, MetricSnapshot, IncidentEvent } from '../../types/dashboard';
import { BrandLogo } from '../BrandLogo';
import { OverviewView } from './views/OverviewView';
import { ServersView } from './views/ServersView';
import { MonitoringView } from './views/MonitoringView';
import { AlertsView } from './views/AlertsView';
import { IncidentsView } from './views/IncidentsView';
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
  automationRules: AutomationRule[];
  automationRuns: AutomationRun[];
  billingAccount: BillingAccount | null;
  billingPlans: BillingPlan[];
  billingInvoices: BillingInvoice[];
  billingPlanRequests: BillingPlanRequest[];
  maintenances: MaintenanceItem[];
  backups: BackupItem[];
  tickets: SupportTicket[];
  metricSnapshots: MetricSnapshot[];
  incidentEvents: IncidentEvent[];
  accountIdentity: {
    companyName: string;
    fullName: string;
    email: string;
    initials: string;
  };
  onRefreshData: () => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  servers: initialServers,
  alerts,
  automations,
  automationRules,
  automationRuns,
  billingAccount,
  billingPlans,
  billingInvoices,
  billingPlanRequests,
  maintenances,
  backups,
  tickets,
  metricSnapshots,
  incidentEvents,
  accountIdentity,
  onRefreshData,
  onLogout
}) => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [selectedServer, setSelectedServer] = useState<ServerItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [servers, setServers] = useState<ServerItem[]>(initialServers);

  React.useEffect(() => {
    setServers(initialServers);
  }, [initialServers]);

  const fetchServers = async () => {
    try {
      onRefreshData();
      if (selectedServer) {
        const updated = initialServers.find((s: ServerItem) => s.id === selectedServer.id);
        if (updated) setSelectedServer(updated);
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
    { id: 'incidents' as DashboardTab, label: 'Incidents', icon: FileText, badge: incidentEvents.filter((item) => item.eventType === 'detected').length },
    { id: 'automation' as DashboardTab, label: 'Automation', icon: ShieldCheck },
    { id: 'maintenance' as DashboardTab, label: 'Maintenance', icon: HardDrive },
    { id: 'backup' as DashboardTab, label: 'Backup', icon: HardDrive },
    { id: 'reports' as DashboardTab, label: 'Reports', icon: FileText },
    { id: 'subscription' as DashboardTab, label: 'Billing', icon: CreditCard },
    { id: 'support' as DashboardTab, label: 'Support', icon: LifeBuoy },
    { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-sky-50/30 font-sans flex text-slate-900 antialiased overflow-x-hidden">
      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:flex ${desktopSidebarOpen ? 'w-48' : 'w-16'} shrink-0 bg-white border-r border-sky-100 flex-col fixed inset-y-0 z-30 transition-all duration-200 shadow-sm`}>
        <button
          onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          className="absolute -right-3 top-5 hidden h-7 w-7 items-center justify-center border border-sky-200 bg-white text-slate-600 shadow-sm hover:text-sky-600 lg:flex"
          aria-label={desktopSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
        >
          {desktopSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {/* Brand */}
        <div className="flex justify-center border-b border-sky-100 px-2 py-3">
          <div className="inline-flex max-w-full overflow-hidden items-center">
            <BrandLogo asset="sidebar" className="h-16 w-auto max-w-[132px]" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-1.5 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center ${desktopSidebarOpen ? 'justify-between px-2.5' : 'justify-center px-1.5'} py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                <div className={`flex items-center ${desktopSidebarOpen ? 'space-x-3' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {desktopSidebarOpen && <span>{item.label}</span>}
                </div>
                {desktopSidebarOpen && item.badge ? (
                  <span className="px-1.5 py-0.5 bg-rose-500 text-white font-mono text-[9px] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-1.5 border-t border-sky-100">
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${desktopSidebarOpen ? 'space-x-2 px-2.5' : 'justify-center px-1.5'} py-1.5 font-mono text-[11px] uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100`}
          >
            <LogOut className="w-5 h-5" />
            {desktopSidebarOpen && <span>Sign Out Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 min-w-0 ${desktopSidebarOpen ? 'lg:pl-48' : 'lg:pl-16'} flex flex-col min-h-screen bg-sky-50/30 transition-all duration-200`}>
        {/* Top Navbar */}
        <header className="bg-white border-b border-sky-200 h-14 flex items-center justify-between px-2 lg:px-3 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-sky-600"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                {billingAccount?.planName || 'No Plan'} — {servers.length} Server
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button 
                onClick={() => setCurrentTab('alerts')}
                className="p-1.5 text-slate-600 hover:text-sky-600 relative border border-sky-200 bg-sky-50/50"
              >
                <Bell className="w-4 h-4" />
                {alerts.filter(a => a.status === 'Monitoring').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {alerts.filter(a => a.status === 'Monitoring').length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 border-l border-sky-200 pl-3">
              <div className="w-8 h-8 bg-sky-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                {accountIdentity.initials}
              </div>
              <div className="hidden max-w-[180px] sm:block font-mono text-xs" title={accountIdentity.email}>
                <span className="font-bold text-slate-900 block leading-none truncate">{accountIdentity.companyName}</span>
                <span className="text-[10px] text-sky-600 uppercase truncate block">{accountIdentity.fullName} · {accountIdentity.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-sky-100 pb-4">
              <span className="inline-flex"><BrandLogo asset="sidebar" className="h-10 w-auto max-w-[96px]" /></span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-700 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="border border-sky-100 bg-sky-50/60 p-3 font-mono text-xs">
              <p className="font-bold text-slate-900 truncate">{accountIdentity.companyName}</p>
              <p className="text-[10px] uppercase text-sky-700 truncate">{accountIdentity.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{accountIdentity.email}</p>
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
                    className={`w-full flex items-center space-x-3 px-4 py-3 font-mono text-xs uppercase ${
                      currentTab === item.id ? 'bg-sky-500 text-white font-bold' : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                onLogout();
              }}
              className="min-h-[44px] w-full flex items-center justify-center space-x-2 border border-rose-200 bg-rose-50 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-rose-700"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out Session</span>
            </button>
          </div>
        )}

        {/* View Switcher Container */}
        <main className="flex-1 min-w-0 p-2 lg:p-3 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewView 
              servers={servers} 
              alerts={alerts} 
              backups={backups}
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
          {currentTab === 'monitoring' && <MonitoringView servers={servers} metricSnapshots={metricSnapshots} />}
          {currentTab === 'alerts' && <AlertsView alerts={alerts} />}
          {currentTab === 'incidents' && <IncidentsView incidents={incidentEvents} alerts={alerts} automationRuns={automationRuns} />}
          {currentTab === 'automation' && <AutomationView automations={automations} automationRules={automationRules} automationRuns={automationRuns} servers={servers} onRefreshData={onRefreshData} />}
          {currentTab === 'maintenance' && <MaintenanceView maintenances={maintenances} />}
          {currentTab === 'backup' && <BackupView backups={backups} />}
          {currentTab === 'reports' && <ReportsView servers={servers} alerts={alerts} automations={automations} automationRuns={automationRuns} maintenances={maintenances} backups={backups} />}
          {currentTab === 'subscription' && <SubscriptionView billingAccount={billingAccount} billingPlans={billingPlans} billingInvoices={billingInvoices} billingPlanRequests={billingPlanRequests} servers={servers} automationRuns={automationRuns} backups={backups} tickets={tickets} />}
          {currentTab === 'support' && <SupportView tickets={tickets} />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
