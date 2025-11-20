#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 COMPLETE TEST SUITE - ALL LEVELS');
console.log('===================================\n');

const testSuites = [
  {
    name: '1. COMPILATION TESTS',
    command: 'node scripts/test-compilation.js',
    description: 'Frontend & Backend compilation'
  },
  {
    name: '2. UNIT TESTS',
    command: 'npm test',
    description: 'Jest unit tests'
  },
  {
    name: '3. BACKEND UNIT TESTS',
    command: 'cd backend && go test ./tests/unit_test.go',
    description: 'Go unit tests'
  },
  {
    name: '4. INTEGRATION TESTS',
    command: 'node scripts/test-integration.js',
    description: 'Frontend-Backend integration'
  },
  {
    name: '5. E2E TESTS',
    command: 'npx playwright test tests/e2e/basic-smoke-test.spec.js --timeout=10000',
    description: 'Basic smoke tests'
  }
];

let totalPassed = 0;
let totalFailed = 0;
const results = [];

async function runTestSuite(suite) {
  console.log(`\n🔄 ${suite.name}`);
  console.log(`📝 ${suite.description}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(suite.command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${suite.name} - PASSED\n`);
    results.push({ name: suite.name, status: 'PASSED' });
    totalPassed++;
  } catch (error) {
    console.log(`❌ ${suite.name} - FAILED\n`);
    results.push({ name: suite.name, status: 'FAILED' });
    totalFailed++;
  }
}

async function main() {
  const startTime = Date.now();
  
  for (const suite of testSuites) {
    await runTestSuite(suite);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  // Print final results
  console.log('\n' + '='.repeat(60));
  console.log('🏁 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
  });
  
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - CHECK LOGS ABOVE');
  }
  
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(console.error);