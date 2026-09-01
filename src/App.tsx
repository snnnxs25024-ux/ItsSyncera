import React, { useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeatureSection } from './components/FeatureSection';
import { ProblemSection } from './components/ProblemSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PricingSection } from './components/PricingSection';
import { TrustSection } from './components/TrustSection';
import { FinalCTASection } from './components/FinalCTASection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardData, fetchDashboardData } from './lib/supabaseRest';

type AuthUser = {
  email?: string;
  user_metadata?: Record<string, unknown>;
};

const initialDashboardData: DashboardData = {
  servers: [],
  alerts: [],
  automations: [],
  automationRules: [],
  automationRuns: [],
  billingAccount: null,
  billingPlans: [],
  billingInvoices: [],
  billingPlanRequests: [],
  maintenances: [],
  backups: [],
  tickets: [],
  metricSnapshots: [],
  incidentEvents: [],
  source: 'supabase',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  

  const loadDashboardData = useCallback(() => {
    fetchDashboardData().then(setDashboardData);
  }, []);

  const loadAuthUser = useCallback(() => {
    return fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user || null;
        setAuthUser(user);
        setIsLoggedIn(Boolean(user));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadAuthUser();
  }, [loadAuthUser]);

  const accountIdentity = (() => {
    const meta = authUser?.user_metadata || {};
    const fullName = String(meta.full_name || authUser?.email || 'Client');
    const companyName = String(meta.company_name || dashboardData.billingAccount?.companyName || 'Client belum dikonfigurasi');
    const email = String(authUser?.email || meta.email || '-');
    const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'CL';
    return { companyName, fullName, email, initials };
  })();

  useEffect(() => {
    if (!isLoggedIn) return;
    loadDashboardData();
    const interval = window.setInterval(() => {
      loadDashboardData();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isLoggedIn, loadDashboardData]);

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

  const handleSelectPlan = useCallback((_name: string, _price: string) => {
    handleOpenAuth('register');
  }, []);

  if (isLoggedIn) {
    return (
      <DashboardLayout
        servers={dashboardData.servers}
        alerts={dashboardData.alerts}
        automations={dashboardData.automations}
        automationRules={dashboardData.automationRules}
        automationRuns={dashboardData.automationRuns}
        billingAccount={dashboardData.billingAccount}
        billingPlans={dashboardData.billingPlans}
        billingInvoices={dashboardData.billingInvoices}
        billingPlanRequests={dashboardData.billingPlanRequests}
        maintenances={dashboardData.maintenances}
        backups={dashboardData.backups}
        tickets={dashboardData.tickets}
        metricSnapshots={dashboardData.metricSnapshots}
        incidentEvents={dashboardData.incidentEvents}
        accountIdentity={accountIdentity}
        onRefreshData={loadDashboardData}
        onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
          setAuthUser(null);
          setIsLoggedIn(false);
        }}
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
        onSuccess={() => loadAuthUser()}
      />

    </div>
  );
}
