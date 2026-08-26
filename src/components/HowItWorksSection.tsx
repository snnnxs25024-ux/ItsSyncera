import React from 'react';
import { Server, Activity, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Connect Server",
      desc: "Hubungkan agen Syncera ke VPS atau dedicated server dalam hitungan detik via SSH key atau secure token.",
      icon: <Server className="w-5 h-5 text-sky-600" />
    },
    {
      number: "02",
      title: "Monitoring Active",
      desc: "Sistem mulai mengumpulkan telemetri CPU, RAM, disk I/O, dan network traffic secara real-time.",
      icon: <Activity className="w-5 h-5 text-sky-600" />
    },
    {
      number: "03",
      title: "Detect Issue",
      desc: "Algoritma cerdas mendeteksi anomali, lonjakan beban, atau potensi kegagalan sebelum berdampak.",
      icon: <AlertCircle className="w-5 h-5 text-sky-600" />
    },
    {
      number: "04",
      title: "Automation Response",
      desc: "Workflow otomatis mengeksekusi perbaikan mandiri atau mengirim notifikasi prioritas tinggi.",
      icon: <RefreshCw className="w-5 h-5 text-sky-600" />
    },
    {
      number: "05",
      title: "System Optimized",
      desc: "Infrastruktur kembali stabil dan laporan performa lengkap tersedia di dashboard eksekutif.",
      icon: <CheckCircle2 className="w-5 h-5 text-sky-600" />
    }
  ];

  return (
    <section id="workflow" className="py-24 bg-gradient-to-b from-sky-50/50 to-white border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1.5 bg-white border border-sky-200 text-sky-700 font-mono text-xs uppercase tracking-wider rounded-none mb-4 shadow-xs">
            Workflow Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
            Bagaimana It's Syncera Bekerja
          </h2>
          <p className="text-slate-600 font-sans mt-4 text-base sm:text-lg">
            Proses otomatisasi end-to-end dari koneksi awal hingga optimasi berkelanjutan.
          </p>
        </div>

        {/* Horizontal Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white border border-sky-200 rounded-none p-6 relative flex flex-col justify-between hover:border-sky-400 transition-all group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-bold text-sky-600">{step.number}</span>
                  <div className="w-10 h-10 bg-sky-50 border border-sky-200 flex items-center justify-center rounded-none group-hover:border-sky-400">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-mono text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-sky-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>STEP 0{idx + 1}</span>
                <span className="text-emerald-600 font-bold">READY</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

