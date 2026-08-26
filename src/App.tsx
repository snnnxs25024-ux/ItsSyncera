import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeatureSection } from './components/FeatureSection';
import { ProblemSection } from './components/ProblemSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PricingSection } from './components/PricingSection';
import { DashboardPreviewSection } from './components/DashboardPreviewSection';
import { TrustSection } from './components/TrustSection';
import { FinalCTASection } from './components/FinalCTASection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PlanModal } from './components/PlanModal';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { mockServers, mockAlerts, mockAutomations, mockMaintenances, mockBackups, mockTickets } from './data/mockDashboardData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: 'PRO', price: 'Rp800.000' });

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPlan = (name: string, price: string) => {
    setSelectedPlan({ name, price });
    setPlanModalOpen(true);
  };

  if (isLoggedIn) {
    return (
      <DashboardLayout
        servers={mockServers}
        alerts={mockAlerts}
        automations={mockAutomations}
        maintenances={mockMaintenances}
        backups={mockBackups}
        tickets={mockTickets}
        onLogout={() => setIsLoggedIn(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-sans antialiased selection:bg-[#2563EB] selection:text-white">
      {/* Navigation */}
      <Navbar 
        onOpenAuth={handleOpenAuth} 
        onNavigate={handleNavigate} 
      />

      {/* Hero Section */}
      <HeroSection 
        onStartMonitoring={() => handleOpenAuth('register')}
        onViewPricing={() => handleNavigate('pricing')}
      />

      {/* Feature Section */}
      <FeatureSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Pricing Section */}
      <PricingSection onSelectPlan={handleSelectPlan} />

      {/* Dashboard Preview Section */}
      <DashboardPreviewSection />

      {/* Trust Section */}
      <TrustSection />

      {/* Final CTA Section */}
      <FinalCTASection onStart={() => handleOpenAuth('register')} />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen} 
        initialMode={authMode} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={() => setIsLoggedIn(true)}
      />

      <PlanModal 
        isOpen={planModalOpen}
        planName={selectedPlan.name}
        price={selectedPlan.price}
        onClose={() => setPlanModalOpen(false)}
      />
    </div>
  );
}
