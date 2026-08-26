import React, { useState } from 'react';
import { Server, ShieldCheck, Terminal, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md text-slate-800 border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('hero')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-sky-500 flex items-center justify-center rounded-none border border-sky-400 shadow-sm">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-mono text-xl font-bold tracking-wider uppercase block leading-none text-slate-900">
              It's Syncera
            </span>
            <span className="text-[10px] text-sky-600 font-mono tracking-widest uppercase mt-0.5 block font-semibold">
              Infrastructure OS
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-mono text-sm tracking-wide text-slate-600">
          <button onClick={() => handleNavClick('features')} className="hover:text-sky-600 transition-colors">
            FEATURES
          </button>
          <button onClick={() => handleNavClick('problem')} className="hover:text-sky-600 transition-colors">
            SOLUTIONS
          </button>
          <button onClick={() => handleNavClick('workflow')} className="hover:text-sky-600 transition-colors">
            WORKFLOW
          </button>
          <button onClick={() => handleNavClick('pricing')} className="hover:text-sky-600 transition-colors">
            PRICING
          </button>
          <button onClick={() => handleNavClick('console')} className="hover:text-sky-600 transition-colors">
            CONSOLE
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-white hover:bg-sky-50 text-slate-800 rounded-none transition-all border border-sky-300 shadow-2xs font-bold"
          >
            <span>Sign In</span>
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-sky-500 hover:bg-sky-600 text-white rounded-none transition-all flex items-center space-x-2 border border-sky-400 shadow-sm font-bold"
          >
            <span>Quick Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-sky-600 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-sky-100 px-4 pt-2 pb-6 space-y-3 font-mono text-sm shadow-lg">
          <button
            onClick={() => handleNavClick('features')}
            className="block w-full text-left py-2 text-slate-700 hover:text-sky-600 border-b border-sky-50"
          >
            FEATURES
          </button>
          <button
            onClick={() => handleNavClick('problem')}
            className="block w-full text-left py-2 text-slate-700 hover:text-sky-600 border-b border-sky-50"
          >
            SOLUTIONS
          </button>
          <button
            onClick={() => handleNavClick('workflow')}
            className="block w-full text-left py-2 text-slate-700 hover:text-sky-600 border-b border-sky-50"
          >
            WORKFLOW
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="block w-full text-left py-2 text-slate-700 hover:text-sky-600 border-b border-sky-50"
          >
            PRICING
          </button>
          <button
            onClick={() => handleNavClick('console')}
            className="block w-full text-left py-2 text-slate-700 hover:text-sky-600 border-b border-sky-50"
          >
            CONSOLE
          </button>
          <div className="pt-4">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
              className="w-full py-3 text-xs font-mono uppercase tracking-wider text-center bg-sky-500 text-white rounded-none font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

