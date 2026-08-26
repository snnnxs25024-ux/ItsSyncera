import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  planName: string;
  price: string;
  onClose: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ isOpen, planName, price, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Autentikasi dengan ${provider} berhasil! Melanjutkan provisioning infrastruktur...`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-sky-200 rounded-none max-w-xl w-full p-6 text-slate-900 relative shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 bg-sky-500 flex items-center justify-center rounded-none border border-sky-400 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-sky-600 uppercase tracking-widest block font-semibold">Selected Plan & Sign Up</span>
            <span className="font-mono text-base font-bold uppercase tracking-wider block text-slate-900">
              {planName} — {price}/mo
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        {!submitted && (
          <div className="mb-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="py-2.5 px-3 bg-white hover:bg-sky-50 border border-sky-200 text-slate-700 text-xs font-mono uppercase flex items-center justify-center space-x-2 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.12 0 9.8 0 12s.43 3.88 1.18 5.39l4.09-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="py-2.5 px-3 bg-white hover:bg-sky-50 border border-sky-200 text-slate-700 text-xs font-mono uppercase flex items-center justify-center space-x-2 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        )}

        {!submitted && (
          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-sky-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-mono">Atau lengkapi data perusahaan</span>
            <div className="flex-grow border-t border-sky-200"></div>
          </div>
        )}

        {submitted ? (
          <div className="py-6 text-center space-y-3 font-mono">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Registrasi & Provisioning Berhasil
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Detail akun enterprise dan deployment token telah dikirimkan ke {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@company.co.id"
                  className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nomor HP</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nama Perusahaan</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="PT Solusi Infrastruktur Utama"
                  className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Alamat Perusahaan</label>
              <input
                type="text"
                required
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Jl. Sudirman Kav. 52-53, Jakarta Selatan"
                className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nomor Telepon Perusahaan</label>
              <input
                type="tel"
                required
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="(021) 555-0192"
                className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
              />
            </div>

            <div className="p-3.5 bg-sky-50/50 border border-sky-200 space-y-2 text-[11px] text-slate-700 shadow-xs">
              <div className="flex justify-between">
                <span>Plan Package:</span>
                <span className="text-sky-700 font-bold">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Rate:</span>
                <span className="text-slate-900 font-bold">{price} / month</span>
              </div>
              <div className="flex justify-between border-t border-sky-200 pt-2 text-emerald-600 font-bold">
                <span>Setup Fee:</span>
                <span>FREE (Instant Provisioning)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-mono uppercase tracking-wider rounded-none transition-all flex items-center justify-center space-x-2 border border-sky-400 mt-4 shadow-xs"
            >
              <span>Complete Sign Up & Provision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};


