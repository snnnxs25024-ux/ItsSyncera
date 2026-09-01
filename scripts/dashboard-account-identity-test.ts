import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DashboardLayout } from '../src/components/dashboard/DashboardLayout';

const html = renderToStaticMarkup(React.createElement(DashboardLayout as any, {
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
  accountIdentity: {
    companyName: 'pt ipt',
    fullName: 'Rizky Pratama',
    email: 'pratama@ipt.solutions',
    initials: 'RP',
  },
  onRefreshData: () => undefined,
  onLogout: () => undefined,
}));

assert.match(html, /pt ipt/);
assert.match(html, /Rizky Pratama/);
assert.match(html, /pratama@ipt\.solutions/);
assert.match(html, /RP/);
console.log('dashboard account identity ok');
