import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

const readJson = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
    setError('');
    setNotice('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'login') {
        await readJson(await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        }));
        onClose();
        onSuccess();
        return;
      }
      await readJson(await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email: signUpEmail, phone, companyName, companyAddress, companyPhone, password: signUpPassword }),
      }));
      setEmail(signUpEmail);
      setPassword('');
      setSignUpPassword('');
      setMode('login');
      setNotice('Akun dibuat. Silakan login.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth gagal');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-sky-200 rounded-none max-w-lg w-full p-6 text-slate-900 relative shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5 pr-8">
          <div className="shrink-0 bg-white flex items-center justify-center rounded-none border border-sky-200 shadow-xs px-2 py-1">
            <BrandLogo className="h-10 w-auto max-w-[112px]" />
          </div>
          <div>
            <span className="font-mono text-base font-bold uppercase tracking-wider block leading-none text-slate-900">
              {mode === 'login' ? "Sign In to It's Syncera" : 'Enterprise Sign Up'}
            </span>
            <span className="text-[10px] text-sky-600 font-mono tracking-widest uppercase mt-0.5 block font-semibold">
              {mode === 'login' ? 'Email & Password Access' : 'New Infrastructure Fleet Registration'}
            </span>
          </div>
        </div>

        {notice && (
          <div className="mb-4 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
          {mode === 'login' ? (
            <>
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 pr-9 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded-none border-sky-300 text-sky-500 focus:ring-sky-400 w-3.5 h-3.5" />
                <span className="text-[11px] text-slate-600 font-mono">Remember me</span>
              </label>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nama Lengkap</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Budi Santoso" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Email</label>
                  <input type="email" required value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder="budi@company.co.id" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nomor HP</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 812-3456-7890" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nama Perusahaan</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="PT Solusi Utama" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Alamat Perusahaan</label>
                <input type="text" required value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Jl. Sudirman Kav. 52-53, Jakarta Selatan" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Nomor Telepon Perusahaan</label>
                  <input type="tel" required value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="(021) 555-0192" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Password</label>
                  <div className="relative">
                    <input type={showSignUpPassword ? 'text' : 'password'} required minLength={6} value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full bg-sky-50/30 border border-sky-200 p-2.5 pr-9 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs" />
                    <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700">
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <button disabled={loading} type="submit" className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-mono uppercase tracking-wider rounded-none transition-all flex items-center justify-center space-x-2 border border-sky-400 mt-4 shadow-xs">
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Console' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {mode === 'login' ? (
            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">Belum punya akun? </span>
              <button type="button" onClick={() => switchMode('register')} className="text-[11px] text-sky-600 font-bold hover:underline uppercase">Daftar Sekarang</button>
            </div>
          ) : (
            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">Sudah punya akun? </span>
              <button type="button" onClick={() => switchMode('login')} className="text-[11px] text-sky-600 font-bold hover:underline uppercase">Sign In</button>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-500 pt-1 font-sans">Protected by It's Syncera.</p>
        </form>
      </div>
    </div>
  );
};
