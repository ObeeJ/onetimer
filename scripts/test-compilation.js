#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔨 COMPILATION TEST - FRONTEND & BACKEND');
console.log('========================================\n');

const tests = [
  // Frontend Tests
  { name: 'Frontend TypeScript Check', cmd: 'npx tsc --noEmit' },
  { name: 'Frontend Production Build', cmd: 'npm run build' },
  { name: 'Frontend Lint Check', cmd: 'npm run lint' },
  
  // Backend Tests  
  { name: 'Backend Go Build', cmd: 'cd backend && go build ./cmd/onetimer-backend' },
  { name: 'Backend Go Vet', cmd: 'cd backend && go vet ./...' },
  { name: 'Backend Go Fmt Check', cmd: 'cd backend && test -z "$(gofmt -l .)"' }
];

let passed = 0, failed = 0;

for (const test of tests) {
  try {
    console.log(`⏳ ${test.name}...`);
    execSync(test.cmd, { stdio: 'pipe' });
    console.log(`✅ ${test.name} - PASSED`);
    passed++;
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);