import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/dashboard/DashboardLayout.tsx', 'utf8');
const drawer = source.match(/\{mobileSidebarOpen && \([\s\S]*?\n\s*\)\}\n\n\s*\{\/\* View Switcher Container \*\//)?.[0] ?? '';

assert.match(drawer, /Sign Out Session/, 'mobile drawer must include a sign out button');
assert.match(drawer, /setMobileSidebarOpen\(false\);[\s\S]*onLogout\(\)/, 'mobile sign out must close drawer and call onLogout');
assert.match(drawer, /min-h-\[44px\]/, 'mobile sign out tap target must be at least 44px tall');

console.log('mobile logout ok');
