import React, { useState } from 'react';
import { X, Server, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Sync mode with initialMode whenever modal opens
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);
  
  // Sign In states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up states
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      onSuccess();
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-sky-200 rounded-none max-w-lg w-full p-6 text-slate-900 relative shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 bg-sky-500 flex items-center justify-center rounded-none border border-sky-400 shadow-xs">
            <Server className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-mono text-base font-bold uppercase tracking-wider block leading-none text-slate-900">
              {mode === 'login' ? "Sign In to It's Syncera" : 'Enterprise Sign Up'}
            </span>
            <span className="text-[10px] text-sky-600 font-mono tracking-widest uppercase mt-0.5 block font-semibold">
              {mode === 'login' ? 'Enterprise Access' : 'New Infrastructure Fleet Registration'}
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3 font-mono">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              {mode === 'login' ? 'Authentication Successful' : 'Registration & Provisioning Successful'}
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              {mode === 'login' 
                ? 'Redirecting securely to your enterprise monitoring console...' 
                : 'Detail akun enterprise dan deployment token telah dikirimkan ke email Anda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mode === 'login' && (
              <div className="p-3 bg-sky-500 text-white border border-sky-400 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">🚀 Pintasan Cepat</span>
                  <span className="text-[9px] bg-sky-600 px-1.5 py-0.5 uppercase">Demo Mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(true);
                    setTimeout(() => {
                      setSubmitted(false);
                      onClose();
                      onSuccess();
                    }, 1200);
                  }}
                  className="w-full py-2 bg-white text-sky-900 font-mono text-xs uppercase font-bold hover:bg-sky-50 transition-colors shadow-xs"
                >
                  ⚡ Masuk Instan ke Dashboard Enterprise
                </button>
              </div>
            )}

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
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

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-sky-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-mono">Atau dengan Formulir</span>
              <div className="flex-grow border-t border-sky-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
              {mode === 'login' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-sky-50/30 border border-sky-200 p-2.5 pr-9 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded-none border-sky-300 text-sky-500 focus:ring-sky-400 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] text-slate-600 font-mono">Remember me</span>
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Instruksi pemulihan password telah dikirim ke email Anda.'); }} className="text-[11px] text-sky-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="budi@company.co.id"
                        className="w-full bg-sky-50/30 border border-sky-200 p-2.5 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="PT Solusi Utama"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="space-y-1">
                      <label className="text-slate-600 uppercase tracking-wider block text-[10px] font-semibold">Secure Password</label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-sky-50/30 border border-sky-200 p-2.5 pr-9 text-slate-900 focus:outline-none focus:border-sky-500 rounded-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                        >
                          {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-mono uppercase tracking-wider rounded-none transition-all flex items-center justify-center space-x-2 border border-sky-400 mt-4 shadow-xs"
              >
                <span>{mode === 'login' ? 'Sign In to Console' : 'Complete Sign Up & Register'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {mode === 'login' ? (
                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-500">Belum punya akun? </span>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-[11px] text-sky-600 font-bold hover:underline uppercase"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              ) : (
                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-500">Sudah punya akun? </span>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[11px] text-sky-600 font-bold hover:underline uppercase"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <p className="text-center text-[10px] text-slate-500 pt-1 font-sans">
                Protected by It's Syncera.
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

