import React from 'react';
import { ShieldCheck, Eye, Zap, Headphones } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trusts = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#2563EB]" />,
      title: "Reliable Infrastructure",
      desc: "Dirancang dengan standar keandalan enterprise 99.99% uptime, memastikan server Anda selalu siap melayani pelanggan."
    },
    {
      icon: <Eye className="w-6 h-6 text-[#2563EB]" />,
      title: "Real-time Visibility",
      desc: "Pantau kesehatan server secara mendalam dengan latensi rendah dan metrik telemetri yang akurat detik demi detik."
    },
    {
      icon: <Zap className="w-6 h-6 text-[#2563EB]" />,
      title: "Operational Efficiency",
      desc: "Otomatisasi tugas rutin seperti maintenance dan backup mengurangi beban kerja manual tim IT hingga 75%."
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#2563EB]" />,
      title: "Expert Support",
      desc: "Dukungan langsung dari insinyur DevOps berpengalaman yang siap membantu kapan pun insiden kritis terjadi."
    }
  ];

  return (
    <section className="py-24 bg-[#F8FAFC] border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-white border border-[#E5E7EB] text-[#2563EB] font-mono text-xs uppercase tracking-wider rounded-none mb-4">
            Enterprise Trust
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-[#0B132B] tracking-tight">
            Kenapa Bisnis Memilih It's Syncera
          </h2>
          <p className="text-slate-600 font-sans mt-4 text-base sm:text-lg">
            Standar keunggulan operasional yang dipercaya oleh berbagai skala bisnis dari startup hingga korporasi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trusts.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E7EB] rounded-none p-8 hover:border-[#2563EB] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center rounded-none mb-6 group-hover:border-[#2563EB]">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold font-mono text-[#0B132B] mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 font-sans leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-xs font-mono text-[#2563EB] flex items-center justify-between">
                <span>VERIFIED STANDARD</span>
                <span>ISO/IEC</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
