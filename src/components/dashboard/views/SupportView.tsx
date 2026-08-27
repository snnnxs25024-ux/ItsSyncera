import React, { useState } from 'react';
import { LifeBuoy, Plus, CheckCircle2, MessageSquare, Clock, AlertTriangle, Lock, Inbox } from 'lucide-react';
import { SupportTicket } from '../../../types/dashboard';

interface SupportViewProps {
  tickets: SupportTicket[];
}

type TicketFilter = 'all' | 'Open' | 'In Progress' | 'Resolved';

const statusClass = (status: SupportTicket['status']) =>
  status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
  status === 'In Progress' ? 'bg-sky-50 text-sky-700 border-sky-200' :
  'bg-amber-50 text-amber-700 border-amber-200';

const categoryClass = (category: SupportTicket['category']) =>
  category === 'Server Issue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
  category === 'Maintenance Request' ? 'bg-amber-50 text-amber-700 border-amber-200' :
  category === 'Configuration Request' ? 'bg-sky-50 text-sky-700 border-sky-200' :
  'bg-slate-50 text-slate-700 border-slate-200';

export const SupportView: React.FC<SupportViewProps> = ({ tickets }) => {
  const [filter, setFilter] = useState<TicketFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id ?? null);
  const filtered = tickets.filter((ticket) => filter === 'all' || ticket.status === filter);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? filtered[0];
  const open = tickets.filter((ticket) => ticket.status === 'Open').length;
  const progress = tickets.filter((ticket) => ticket.status === 'In Progress').length;
  const resolved = tickets.filter((ticket) => ticket.status === 'Resolved').length;
  const filters: TicketFilter[] = ['all', 'Open', 'In Progress', 'Resolved'];

  React.useEffect(() => {
    if (!selectedId && tickets[0]) setSelectedId(tickets[0].id);
  }, [selectedId, tickets]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-sky-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Helpdesk</span>
          <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Support Tickets</h1>
          <p className="text-xs text-slate-500 font-sans mt-1">Ticket queue real-only dari table support_tickets. Tidak membuat tiket lokal palsu.</p>
        </div>
        <button
          type="button"
          disabled
          title="Create ticket API belum tersedia."
          className="px-4 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs uppercase font-bold border border-slate-200 shadow-xs flex items-center space-x-2 cursor-not-allowed"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Create Ticket Locked</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Open', open, 'text-amber-600', AlertTriangle],
          ['In Progress', progress, 'text-sky-600', Clock],
          ['Resolved', resolved, 'text-emerald-600', CheckCircle2],
          ['Total Tickets', tickets.length, 'text-slate-900', LifeBuoy],
        ].map(([label, value, color, Icon]) => (
          <div key={String(label)} className="bg-white border border-sky-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{String(label)}</span>
              {React.createElement(Icon as typeof LifeBuoy, { className: 'w-4 h-4 text-sky-600' })}
            </div>
            <span className={`text-3xl font-mono font-bold ${String(color)}`}>{Number(value)}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-sky-600" />
            <span>Ticket Queue</span>
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className={`px-3 py-2 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                  filter === item ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-xs' : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 space-y-3">
              {filtered.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full text-left border p-4 shadow-2xs transition-colors ${selected?.id === ticket.id ? 'border-sky-400 bg-sky-50/60' : 'border-sky-100 bg-white hover:bg-sky-50/30'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-sky-500 text-white text-[10px] font-mono uppercase font-bold">{ticket.ticketNumber}</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${statusClass(ticket.status)}`}>{ticket.status}</span>
                  </div>
                  <h3 className="font-mono text-sm font-bold text-slate-900 uppercase leading-snug">{ticket.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${categoryClass(ticket.category)}`}>{ticket.category}</span>
                    <span className="text-[10px] font-mono text-slate-500">{ticket.lastUpdated}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-3 border border-sky-100 bg-sky-50/20 p-5 space-y-4">
              {selected ? (
                <>
                  <div className="border-b border-sky-100 pb-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-sky-500 text-white text-[10px] font-mono uppercase font-bold">{selected.ticketNumber}</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${statusClass(selected.status)}`}>{selected.status}</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold border ${categoryClass(selected.category)}`}>{selected.category}</span>
                    </div>
                    <h3 className="font-mono text-sm font-bold text-slate-900 uppercase">{selected.subject}</h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">Last updated: {selected.lastUpdated}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-sky-600" /> Message History</h4>
                    {selected.messages.length ? selected.messages.map((message, index) => (
                      <div key={`${selected.id}-${index}`} className={`p-3 border ${message.sender === 'Client' ? 'bg-white border-sky-200 ml-0 md:ml-6' : 'bg-slate-50 border-slate-200 mr-0 md:mr-6'}`}>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                          <span className="font-bold text-slate-800">{message.sender}</span>
                          <span>{message.time}</span>
                        </div>
                        <p className="font-sans text-slate-700 text-xs leading-relaxed">{message.text}</p>
                      </div>
                    )) : (
                      <div className="border border-dashed border-sky-200 bg-white p-6 text-center">
                        <MessageSquare className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                        <p className="font-mono text-xs font-bold text-slate-900 uppercase">Belum ada message history</p>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-sky-200 bg-sky-50/30 p-8 text-center">
            <LifeBuoy className="w-8 h-8 text-sky-600 mx-auto mb-3" />
            <p className="font-mono text-sm font-bold text-slate-900 uppercase">Belum ada tiket support</p>
            <p className="text-xs text-slate-500 font-sans mt-1">Ticket akan tampil setelah table support_tickets terisi data real.</p>
          </div>
        )}
      </div>
    </div>
  );
};
