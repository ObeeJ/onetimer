#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔗 API ENDPOINT TESTING VIA FRONTEND UI');
console.log('======================================\n');

const testSuites = [
  {
    name: 'Basic Smoke Test',
    command: 'npx playwright test tests/e2e/basic-smoke-test.spec.js --timeout=10000',
    description: 'Frontend accessibility check'
  },
  {
    name: 'Complete API Testing',
    command: 'npx playwright test tests/e2e/complete-api-testing.spec.js --timeout=30000',
    description: 'All API endpoints via UI interactions'
  }
];

let passed = 0, failed = 0;

for (const suite of testSuites) {
  console.log(`\n🔄 ${suite.name}`);
  console.log(`📝 ${suite.description}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(suite.command, { stdio: 'inherit' });
    console.log(`✅ ${suite.name} - PASSED\n`);
    passed++;
  } catch (error) {
    console.log(`❌ ${suite.name} - FAILED\n`);
    failed++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('🏁 API ENDPOINT TEST RESULTS');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL API ENDPOINT TESTS PASSED! 🎉');
} else {
  console.log('\n⚠️ Some tests failed - Frontend may not be running');
}

process.exit(failed > 0 ? 1 : 0);