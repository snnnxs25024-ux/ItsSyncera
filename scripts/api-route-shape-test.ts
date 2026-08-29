import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const apiDir = path.resolve('api');
const routes: string[] = [];
const walk = (dir: string) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.ts') && !entry.name.startsWith('_')) routes.push(full);
  }
};
walk(apiDir);
for (const route of routes) {
  const source = fs.readFileSync(route, 'utf8');
  assert.match(source, /export\s+default\s+async\s+function\s+handler|export\s+default\s+function\s+handler|export\s+default\s+handler/, `${path.relative('.', route)} must export default handler`);
}
console.log('api route shape ok');
