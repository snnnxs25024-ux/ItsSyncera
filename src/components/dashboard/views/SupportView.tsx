import React, { useState } from 'react';
import { LifeBuoy, Plus, CheckCircle2, Send } from 'lucide-react';
import { SupportTicket } from '../../../types/dashboard';

interface SupportViewProps {
  tickets: SupportTicket[];
}

export const SupportView: React.FC<SupportViewProps> = ({ tickets }) => {
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'Server Issue' | 'Maintenance Request' | 'Configuration Request' | 'General Question'>('Server Issue');
  const [newDesc, setNewDesc] = useState('');
  const [ticketList, setTicketList] = useState<SupportTicket[]>(tickets);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDesc) return;
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `INC-${Math.floor(10000 + Math.random() * 90000)}`,
      subject: newSubject,
      category: newCategory,
      status: 'Open',
      lastUpdated: 'Baru saja',
      messages: [
        { sender: 'Client', text: newDesc, time: 'Baru saja' }
      ]
    };
    setTicketList([newTkt, ...ticketList]);
    setNewSubject('');
    setNewDesc('');
    alert('Support ticket berhasil dibuat! Tim SRE akan merespons dalam 15 menit.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs">
        <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-semibold block mb-1">Helpdesk & Incident Support</span>
        <h1 className="text-xl font-mono font-bold uppercase tracking-wide text-slate-900">Enterprise Support Tickets</h1>
        <p className="text-xs text-slate-500 font-sans mt-1">Buat tiket kendala server atau request konfigurasi khusus langsung ke lead engineer It's Syncera.</p>
      </div>

      {/* Create Ticket Form */}
      <div className="bg-white border border-sky-200 p-6 shadow-xs space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Buat Tiket Bantuan Baru</h2>
        <form onSubmit={handleCreateTicket} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Subjek Kendala / Permintaan</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Contoh: Kendala koneksi Redis ke Node app"
                className="w-full bg-sky-50/40 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Kategori Bantuan</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-sky-50/40 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
              >
                <option value="Server Issue">Server Issue</option>
                <option value="Maintenance Request">Maintenance Request</option>
                <option value="Configuration Request">Configuration Request</option>
                <option value="General Question">General Question</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Deskripsi Detail</label>
            <textarea
              required
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Jelaskan detail kendala atau konfigurasi yang dibutuhkan..."
              className="w-full bg-sky-50/40 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs uppercase font-bold border border-sky-400 shadow-xs flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Kirim Tiket Support</span>
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Riwayat Tiket Aktif</h2>
        {ticketList.map((tkt) => (
          <div key={tkt.id} className="bg-white border border-sky-200 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-sky-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 bg-sky-500 text-white text-[10px] font-mono uppercase font-bold">
                  {tkt.ticketNumber}
                </span>
                <h3 className="font-mono text-sm font-bold text-slate-900 uppercase">{tkt.subject}</h3>
              </div>
              <span className={`px-2.5 py-1 text-[10px] uppercase font-bold font-mono ${
                tkt.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {tkt.status}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs pt-1">
              {tkt.messages.map((msg, i) => (
                <div key={i} className={`p-3 ${msg.sender === 'Client' ? 'bg-sky-50/60 border border-sky-200 ml-4' : 'bg-slate-50 border border-slate-200 mr-4'}`}>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-bold text-slate-800">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="font-sans text-slate-700 text-xs">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
