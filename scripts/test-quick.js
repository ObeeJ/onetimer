#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('⚡ QUICK TEST VERIFICATION');
console.log('=========================\n');

const tests = [
  { name: 'Frontend Build', cmd: 'npm run build' },
  { name: 'Unit Tests', cmd: 'npm test -- --passWithNoTests' },
  { name: 'Backend Build', cmd: 'cd backend && go build ./cmd/onetimer-backend' },
  { name: 'Backend Tests', cmd: 'cd backend && go test ./tests/unit_test.go' }
];

let passed = 0;

for (const test of tests) {
  try {
    console.log(`⏳ ${test.name}...`);
    execSync(test.cmd, { stdio: 'pipe' });
    console.log(`✅ ${test.name} - PASSED`);
    passed++;
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED`);
  }
}

console.log(`\n📊 Quick Test Results: ${passed}/${tests.length} passed`);
console.log(`📈 Success Rate: ${((passed/tests.length)*100).toFixed(1)}%`);

if (passed === tests.length) {
  console.log('\n🎉 ALL QUICK TESTS PASSED! 🎉');
} else {
  console.log('\n⚠️ Some tests failed - run npm run test:core for details');
}