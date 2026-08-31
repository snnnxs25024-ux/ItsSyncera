import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/lib/supabaseRest.ts', 'utf8');
const body = source.slice(source.indexOf('export const fetchDashboardData'));

for (const table of ['servers', 'alerts', 'automation_runs', 'billing_accounts', 'incident_events', 'notification_channels']) {
  assert.doesNotMatch(body, new RegExp(`read(?:Optional)?Table<[^>]+>\\('${table}'\\)`), `client fallback must not read tenant table ${table} directly`);
}
assert.match(body, /return \{ \.\.\.emptyData, error:/, 'failed dashboard API must return empty safe data');
console.log('client no direct tenant rest ok');
