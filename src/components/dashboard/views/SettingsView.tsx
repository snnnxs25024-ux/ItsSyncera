import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, Server, Bell, Plug, Lock, RefreshCw, AlertTriangle } from 'lucide-react';

type StatusLevel = 'connected' | 'configured' | 'not_configured' | 'unavailable' | 'locked';
type StatusItem = { name: string; status: StatusLevel; detail: string };
type SettingsStatus = {
  success: boolean;
  checkedAt: string;
  system: StatusItem[];
  connectors: StatusItem[];
  companyProfile: StatusItem[];
  notifications: StatusItem[];
  security: StatusItem[];
};

const statusClass = (status: StatusLevel) =>
  status === 'connected' || status === 'configured' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  status === 'locked' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  status === 'unavailable' ? 'bg-rose-50 text-rose-700 border-rose-200' :
  'bg-slate-50 text-slate-700 border-slate-200';

const StatusGrid = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: StatusItem[] }) => (
  <section className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
    <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
      {icon}
      <span>{title}</span>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={`${title}-${item.name}`} className="border border-sky-100 bg-sky-50/20 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-mono text-sm font-bold uppercase text-slate-900">{item.name}</h3>
            <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border whitespace-nowrap ${statusClass(item.status)}`}>{item.status.replace('_', ' ')}</span>
          </div>
          <p className="font-sans text-xs text-slate-600 leading-relaxed">{item.detail}</p>
        </div>
      ))}
    </div>
  </section>
);

export const SettingsView: React.FC = () => {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/api/settings/status')
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!alive) return;
        if (!ok || !body.success) throw new Error(body.error || 'Settings status unavailable');
        setStatus(body);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Settings status unavailable');
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">System Settings</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Settings Status</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Konfigurasi nyata: API, Supabase, connector, notification, company profile. Tidak ada profil dummy.</p>
        </div>
        <button
          type="button"
          disabled
          title="Save settings API belum tersedia."
          className="px-4 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs uppercase font-bold border border-slate-200 shadow-xs flex items-center space-x-2 cursor-not-allowed"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Save Locked</span>
        </button>
      </div>

      {!status && !error ? (
        <div className="bg-white border border-sky-200 p-8 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-sky-600 mx-auto mb-3 animate-spin" />
          <p className="font-mono text-sm font-bold text-slate-900 uppercase">Checking real system status</p>
        </div>
      ) : null}

      {error ? (
        <div className="bg-white border border-rose-200 p-6 text-center shadow-xs">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
          <p className="font-mono text-sm font-bold text-slate-900 uppercase">Settings API unavailable</p>
          <p className="text-xs text-slate-500 font-sans mt-1">{error}</p>
        </div>
      ) : null}

      {status ? (
        <>
          <div className="bg-white border border-sky-200 p-4 shadow-xs font-mono text-xs text-slate-600">
            Last check: <b className="text-slate-900">{status.checkedAt}</b>
          </div>
          <StatusGrid title="System Status" icon={<Server className="w-4 h-4 text-sky-600" />} items={status.system} />
          <StatusGrid title="Company Profile" icon={<Settings className="w-4 h-4 text-sky-600" />} items={status.companyProfile} />
          <StatusGrid title="Notification Channels" icon={<Bell className="w-4 h-4 text-sky-600" />} items={status.notifications} />
          <StatusGrid title="Connector Settings" icon={<Plug className="w-4 h-4 text-sky-600" />} items={status.connectors} />
          <StatusGrid title="Security Policy" icon={<ShieldCheck className="w-4 h-4 text-sky-600" />} items={status.security} />
        </>
      ) : null}
    </div>
  );
};
