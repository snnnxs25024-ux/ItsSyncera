import React, { useState } from 'react';
import { Check, ArrowRight, Shield } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (planName: string, price: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: "BASIC",
      priceMonthly: "Rp350.000",
      priceAnnual: "Rp3.150.000",
      period: "/month",
      desc: "Untuk bisnis kecil dengan kebutuhan monitoring dasar.",
      badge: null,
      features: [
        "Server monitoring",
        "Basic health check",
        "Error notification",
        "Monthly report",
        "Basic support"
      ],
      highlighted: false
    },
    {
      name: "PRO",
      priceMonthly: "Rp800.000",
      priceAnnual: "Rp7.200.000",
      period: "/month",
      desc: "Untuk perusahaan berkembang yang membutuhkan otomatisasi.",
      badge: "MOST POPULAR",
      features: [
        "Semua BASIC",
        "Advanced monitoring",
        "Automated maintenance",
        "Backup monitoring",
        "Performance optimization",
        "Priority support"
      ],
      highlighted: true
    },
    {
      name: "ULTIMATE",
      priceMonthly: "Rp1.500.000",
      priceAnnual: "Rp13.500.000",
      period: "/month",
      desc: "Infrastruktur skala besar dengan keamanan dan kustomisasi penuh.",
      badge: null,
      features: [
        "Semua PRO",
        "Advanced automation",
        "Security monitoring",
        "Custom workflow",
        "Priority engineer support"
      ],
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-white to-sky-50/50 border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1.5 bg-white border border-sky-200 text-sky-700 font-mono text-xs uppercase tracking-wider rounded-none mb-4 shadow-xs">
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
            Pilih Paket Infrastruktur Sesuai Kebutuhan
          </h2>
          <p className="text-slate-600 font-sans mt-4 text-base sm:text-lg">
            Investasi terjangkau untuk keandalan dan keamanan operasional server Anda.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-white border border-sky-200 rounded-none shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                billingCycle === 'annual'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing <span className="text-emerald-300 font-bold ml-1">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const displayPrice = billingCycle === 'annual' 
              ? (idx === 0 ? "Rp280.000" : idx === 1 ? "Rp640.000" : "Rp1.200.000")
              : plan.priceMonthly;

            return (
              <div
                key={idx}
                className={`bg-white border rounded-none p-8 flex flex-col justify-between relative transition-all ${
                  plan.highlighted 
                    ? 'border-sky-500 ring-2 ring-sky-200 shadow-xl' 
                    : 'border-sky-200 hover:border-sky-300 shadow-xs'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-8 bg-sky-500 text-white px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase rounded-none border border-sky-400">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold font-mono text-slate-900">{plan.name}</h3>
                    <Shield className="w-5 h-5 text-sky-600" />
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-extrabold font-mono text-slate-900">{displayPrice}</span>
                    <span className="text-sm font-mono text-slate-500 ml-1">{plan.period}</span>
                  </div>

                  <p className="text-sm text-slate-600 font-sans mb-8 pb-6 border-b border-sky-100">
                    {plan.desc}
                  </p>

                  <ul className="space-y-4 mb-8 font-mono text-sm text-slate-700">
                    {plan.features.map((feat, featIdx) => (
                      <li key={featIdx} className="flex items-center space-x-3">
                        <Check className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onSelectPlan(plan.name, displayPrice)}
                  className="w-full py-4 text-xs font-mono uppercase tracking-wider rounded-none transition-all flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white border border-sky-400 shadow-md font-bold"
                >
                  <span>Select {plan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
