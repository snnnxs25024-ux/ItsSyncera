import React, { useState } from 'react';
import { CreditCard, Server, Activity, Archive, LifeBuoy, FileText, Lock, ArrowRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { AutomationRun, BackupItem, BillingAccount, BillingInvoice, BillingPlan, BillingPlanRequest, ServerItem, SupportTicket } from '../../../types/dashboard';

interface SubscriptionViewProps {
  billingAccount: BillingAccount | null;
  billingPlans: BillingPlan[];
  billingInvoices: BillingInvoice[];
  billingPlanRequests: BillingPlanRequest[];
  servers: ServerItem[];
  automationRuns: AutomationRun[];
  backups: BackupItem[];
  tickets: SupportTicket[];
}

const statusClass = (status: string) =>
  ['active', 'paid', 'approved', 'configured'].includes(status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  ['trial', 'pending', 'unpaid'].includes(status) ? 'bg-amber-50 text-amber-700 border-amber-200' :
  ['past_due', 'overdue', 'failed', 'rejected'].includes(status) ? 'bg-rose-50 text-rose-700 border-rose-200' :
  'bg-slate-50 text-slate-700 border-slate-200';

const asLimit = (limit: number | null) => limit === null ? 'Unlimited' : String(limit);

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ billingAccount, billingPlans, billingInvoices, billingPlanRequests, servers, automationRuns, backups, tickets }) => {
  const [requests, setRequests] = useState<BillingPlanRequest[]>(billingPlanRequests);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [message, setMessage] = useState('');
  const activePlan = billingAccount?.planName || 'No active plan';
  const serverLimit = billingAccount?.serverLimit ?? billingPlans.find((plan) => plan.id === billingAccount?.planId)?.serverLimit ?? null;
  const serverUsageText = `${servers.length} / ${asLimit(serverLimit)}`;
  const latestInvoice = billingInvoices[0];
  const pendingRequest = requests.find((request) => request.status === 'pending');

  React.useEffect(() => setRequests(billingPlanRequests), [billingPlanRequests]);

  const requestUpgrade = async () => {
    if (!selectedPlan) return setMessage('Pilih plan dulu.');
    setMessage('');
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedPlan: selectedPlan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setRequests((current) => [data.request, ...current].slice(0, 30));
      setMessage('Upgrade request tersimpan. Menunggu approval billing.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upgrade request gagal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Billing</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Plan & Usage</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Current plan, usage limit, invoice, payment status, dan request upgrade. Real-only dari billing tables.</p>
        </div>
        <div className="px-4 py-2.5 bg-sky-50 text-sky-700 font-mono text-xs uppercase font-bold border border-sky-200 shadow-xs flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Payment Locked</span>
        </div>
      </div>

      {message ? <div className="bg-white border border-sky-200 p-3 font-mono text-xs text-slate-700 shadow-xs">{message}</div> : null}

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-sky-600 font-semibold">Current Plan</span>
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider text-slate-900 mt-1">{activePlan}</h2>
            <p className="text-xs text-slate-500 font-sans mt-1">{billingAccount ? `${billingAccount.price} ${billingAccount.currency} / ${billingAccount.billingCycle}` : 'Billing account belum dikonfigurasi.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs min-w-72">
            <div className="border border-sky-100 bg-sky-50/30 p-3"><span className="text-[10px] text-slate-500 uppercase">Status</span><b className={`block mt-1 px-2 py-0.5 border uppercase w-fit ${statusClass(billingAccount?.status || 'not_configured')}`}>{billingAccount?.status || 'not_configured'}</b></div>
            <div className="border border-sky-100 bg-sky-50/30 p-3"><span className="text-[10px] text-slate-500 uppercase">Renewal</span><b className="block mt-1 text-slate-900">{billingAccount?.renewalDate || '-'}</b></div>
            <div className="border border-sky-100 bg-sky-50/30 p-3"><span className="text-[10px] text-slate-500 uppercase">Payment</span><b className={`block mt-1 px-2 py-0.5 border uppercase w-fit ${statusClass(billingAccount?.paymentStatus || 'not_configured')}`}>{billingAccount?.paymentStatus || 'not_configured'}</b></div>
            <div className="border border-sky-100 bg-sky-50/30 p-3"><span className="text-[10px] text-slate-500 uppercase">Provider</span><b className="block mt-1 text-slate-900">{billingAccount?.paymentProvider || '-'}</b></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Server Usage', serverUsageText, 'text-slate-900', Server],
          ['Automation Runs', automationRuns.length, 'text-sky-600', Activity],
          ['Backup Records', backups.length, 'text-emerald-600', Archive],
          ['Support Tickets', tickets.length, 'text-amber-600', LifeBuoy],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof Server, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{String(value)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4 text-sky-600" /> Invoices</h2>
          {billingInvoices.length ? (
            <div className="overflow-x-auto border border-sky-100">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-sky-50/70 border-b border-sky-200 text-slate-600 text-[10px] uppercase"><tr><th className="p-3">Invoice</th><th className="p-3">Amount</th><th className="p-3">Due</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-sky-100">
                  {billingInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-sky-50/30 transition-colors"><td className="p-3 font-bold text-slate-900">{invoice.invoiceNumber}</td><td className="p-3 text-slate-700">{invoice.amount} {invoice.currency}</td><td className="p-3 text-slate-500">{invoice.dueDate}</td><td className="p-3"><span className={`px-2 py-0.5 border uppercase ${statusClass(invoice.status)}`}>{invoice.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center"><FileText className="w-8 h-8 text-sky-600 mx-auto mb-3" /><p className="font-mono text-sm font-bold text-slate-900 uppercase">No invoice data</p><p className="text-xs text-slate-500 font-sans mt-1">Isi table billing_invoices agar invoice muncul.</p></div>
          )}
          {latestInvoice ? <p className="text-xs text-slate-500 font-sans">Latest invoice: {latestInvoice.invoiceNumber}</p> : null}
        </section>

        <section className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><CreditCard className="w-4 h-4 text-sky-600" /> Upgrade Request</h2>
          <div className="space-y-3 font-mono text-xs">
            <label className="text-[10px] uppercase text-slate-500 font-bold">Requested Plan</label>
            <select value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)} className="w-full bg-sky-50/40 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500">
              <option value="">Pilih plan</option>
              {billingPlans.filter((plan) => plan.status === 'active' && plan.name !== activePlan).map((plan) => <option key={plan.id} value={plan.name}>{plan.name} — {plan.price} {plan.currency}</option>)}
            </select>
            <button type="button" onClick={requestUpgrade} className="w-full px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold border border-sky-400 shadow-xs flex items-center justify-center gap-2"><ArrowRight className="w-3.5 h-3.5" /> Request Upgrade</button>
            <p className="text-[11px] text-slate-500 font-sans">Request tersimpan sebagai pending. Tidak auto-charge, tidak auto-upgrade.</p>
          </div>
          {pendingRequest ? <div className="border border-amber-200 bg-amber-50/40 p-3 font-mono text-xs text-amber-800">Pending: {pendingRequest.requestedPlan} sejak {pendingRequest.requestedAt}</div> : null}
        </section>
      </div>

      <section className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600" /> Plan Catalog</h2>
        {billingPlans.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {billingPlans.map((plan) => (
              <article key={plan.id} className={`border p-5 shadow-2xs space-y-4 ${plan.name === activePlan ? 'border-sky-400 bg-sky-50/50' : 'border-sky-100 bg-white'}`}>
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-mono text-lg font-bold uppercase text-slate-900">{plan.name}</h3><p className="text-xs text-slate-500 font-mono mt-1">{plan.price} {plan.currency} / {plan.billingCycle}</p></div>{plan.name === activePlan ? <span className="px-2 py-0.5 bg-sky-500 text-white text-[10px] font-mono uppercase font-bold">Active</span> : null}</div>
                <div className="grid grid-cols-1 gap-2 text-xs font-mono text-slate-600 border-t border-sky-100 pt-4">
                  <span>Server limit: <b className="text-slate-900">{asLimit(plan.serverLimit)}</b></span>
                  <span>Monitoring: <b className="text-slate-900">{plan.monitoringInterval}</b></span>
                  <span>Support: <b className="text-slate-900">{plan.supportLevel}</b></span>
                  <span>Backup retention: <b className="text-slate-900">{plan.backupRetention}</b></span>
                </div>
                {plan.features.length ? <ul className="space-y-1 text-xs text-slate-600 font-sans">{plan.features.map((feature) => <li key={feature}>• {feature}</li>)}</ul> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center"><AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-3" /><p className="font-mono text-sm font-bold text-slate-900 uppercase">No billing plans</p><p className="text-xs text-slate-500 font-sans mt-1">Isi table billing_plans agar catalog muncul.</p></div>
        )}
      </section>

      <section className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><Clock className="w-4 h-4 text-sky-600" /> Request History</h2>
        {requests.length ? <div className="space-y-3">{requests.map((request) => <div key={request.id} className="border border-sky-100 bg-sky-50/20 p-4 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"><span><b>{request.currentPlan}</b> → <b>{request.requestedPlan}</b></span><span className={`px-2 py-0.5 border uppercase w-fit ${statusClass(request.status)}`}>{request.status}</span><span className="text-slate-500">{request.requestedAt}</span></div>)}</div> : <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center"><CreditCard className="w-8 h-8 text-sky-600 mx-auto mb-3" /><p className="font-mono text-sm font-bold text-slate-900 uppercase">No upgrade requests</p></div>}
      </section>
    </div>
  );
};
