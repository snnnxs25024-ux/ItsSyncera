import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('hero')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <BrandLogo className="h-20 w-auto max-w-[260px]" />
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
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-white hover:bg-sky-50 text-slate-800 rounded-none transition-all border border-sky-300 shadow-2xs font-bold"
          >
            <span>Sign In</span>
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
          <div className="pt-4">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
              className="w-full py-3 text-xs font-mono uppercase tracking-wider text-center bg-white text-slate-800 border border-sky-300 rounded-none font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

