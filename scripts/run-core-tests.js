#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 CORE TEST SUITE - ESSENTIAL TESTS ONLY');
console.log('=========================================\n');

const tests = [
  {
    name: '1. FRONTEND BUILD',
    command: 'npm run build',
    description: 'Production build test'
  },
  {
    name: '2. FRONTEND LINT',
    command: 'npm run lint',
    description: 'Code quality check'
  },
  {
    name: '3. BACKEND BUILD',
    command: 'cd backend && go build ./cmd/onetimer-backend',
    description: 'Backend compilation'
  },
  {
    name: '4. UNIT TESTS (Frontend)',
    command: 'npm test -- --passWithNoTests',
    description: 'Jest unit tests'
  },
  {
    name: '5. UNIT TESTS (Backend)',
    command: 'cd backend && go test ./tests/unit_test.go -v',
    description: 'Go unit tests'
  },
  {
    name: '6. INTEGRATION TEST',
    command: 'node scripts/test-integration.js',
    description: 'API integration test'
  }
];

let passed = 0, failed = 0;
const results = [];

for (const test of tests) {
  console.log(`\n🔄 ${test.name}`);
  console.log(`📝 ${test.description}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(test.command, { stdio: 'inherit' });
    console.log(`✅ ${test.name} - PASSED\n`);
    results.push({ name: test.name, status: 'PASSED' });
    passed++;
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED\n`);
    results.push({ name: test.name, status: 'FAILED' });
    failed++;
  }
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('🏁 CORE TEST RESULTS');
console.log('='.repeat(60));

results.forEach(result => {
  const icon = result.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.status}`);
});

console.log(`\n📊 SUMMARY:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL CORE TESTS PASSED! 🎉');
} else {
  console.log('\n⚠️  SOME TESTS FAILED - CHECK LOGS ABOVE');
}

process.exit(failed > 0 ? 1 : 0);