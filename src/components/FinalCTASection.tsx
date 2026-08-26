import React from 'react';
import { ArrowRight, Server } from 'lucide-react';

interface FinalCTASectionProps {
  onStart: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onStart }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-sky-500 to-blue-600 text-white border-b border-sky-400 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center mx-auto mb-6 text-white">
          <Server className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-4 leading-snug">
          Pastikan Infrastruktur Server Anda<br className="hidden sm:inline" /> Selalu Siap Mendukung Bisnis.
        </h2>

        <p className="text-sky-100 font-sans text-sm sm:text-base max-w-xl mx-auto mb-8">
          Bergabunglah dengan berbagai perusahaan yang mempercayakan monitoring, maintenance, dan otomatisasi server mereka pada It's Syncera.
        </p>

        <button
          onClick={onStart}
          className="px-7 py-3.5 bg-white hover:bg-sky-50 text-sky-700 font-mono text-xs uppercase tracking-wider rounded-none transition-all inline-flex items-center space-x-2 border border-white shadow-md font-bold"
        >
          <span>Mulai Gunakan It's Syncera</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

