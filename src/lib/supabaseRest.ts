import {
  AlertItem,
  AutomationItem,
  AutomationRule,
  AutomationRun,
  BillingAccount,
  BillingInvoice,
  BillingPlan,
  BillingPlanRequest,
  BackupItem,
  MaintenanceItem,
  MetricSnapshot,
  ServerItem,
  SupportTicket,
  IncidentEvent,
} from '../types/dashboard';

export interface DashboardData {
  servers: ServerItem[];
  alerts: AlertItem[];
  automations: AutomationItem[];
  automationRules: AutomationRule[];
  automationRuns: AutomationRun[];
  billingAccount: BillingAccount | null;
  billingPlans: BillingPlan[];
  billingInvoices: BillingInvoice[];
  billingPlanRequests: BillingPlanRequest[];
  maintenances: MaintenanceItem[];
  backups: BackupItem[];
  tickets: SupportTicket[];
  metricSnapshots: MetricSnapshot[];
  incidentEvents: IncidentEvent[];
  source: 'supabase' | 'mock';
  error?: string;
}

const emptyData: DashboardData = {
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

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const api = await fetch('/api/dashboard').catch(() => null);
  if (api?.ok) return api.json();
  // ponytail: browser fallback intentionally returns empty data; tenant tables must only flow through authenticated API.
  return { ...emptyData, error: 'Dashboard API belum tersedia' };
};
