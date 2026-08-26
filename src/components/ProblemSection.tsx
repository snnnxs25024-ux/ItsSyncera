import React from 'react';
import { AlertTriangle, EyeOff, CalendarX, Users2 } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      title: "Downtime Risk",
      description: "Kerugian finansial dan reputasi akibat server down tanpa peringatan dini."
    },
    {
      icon: <EyeOff className="w-6 h-6 text-amber-600" />,
      title: "Monitoring Manual",
      description: "Tim operasional menghabiskan waktu mengecek log server satu per satu secara manual."
    },
    {
      icon: <CalendarX className="w-6 h-6 text-orange-600" />,
      title: "Maintenance Terlupakan",
      description: "Pembaruan keamanan dan patch penting terlewat karena tidak ada sistem pengingat otomatis."
    },
    {
      icon: <Users2 className="w-6 h-6 text-sky-600" />,
      title: "Keterbatasan Resource IT",
      description: "Tim internal kewalahan menangani insiden berulang tanpa bantuan otomatisasi cerdas."
    }
  ];

  return (
    <section id="problem" className="py-24 bg-sky-50/40 border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1.5 bg-white border border-sky-200 text-sky-700 font-mono text-xs uppercase tracking-wider rounded-none mb-4 shadow-xs">
            Operational Challenges
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
            Server Down Menghambat Operasional?
          </h2>
          <p className="text-slate-600 font-sans mt-4 text-base sm:text-lg">
            Infrastruktur konvensional rentan terhadap gangguan yang merugikan bisnis Anda secara langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob, idx) => (
            <div
              key={idx}
              className="bg-white border border-sky-200 rounded-none p-6 hover:border-sky-400 transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="w-12 h-12 bg-sky-50 border border-sky-200 flex items-center justify-center rounded-none mb-6">
                  {prob.icon}
                </div>
                <h3 className="text-lg font-bold font-mono text-slate-900 mb-2">{prob.title}</h3>
                <p className="text-sm text-slate-600 font-sans leading-relaxed">{prob.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>RISK LEVEL #{idx + 1}</span>
                <span className="text-red-600 font-bold">CRITICAL</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

