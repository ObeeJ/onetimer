#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🌐 PRODUCTION HEALTH CHECK');
console.log('=========================\n');

try {
  console.log('⏳ Checking production site health...');
  execSync('npx playwright test tests/e2e/production-health-check.spec.js --timeout=15000', { 
    stdio: 'inherit' 
  });
  console.log('✅ Production health check completed');
} catch (error) {
  console.log('❌ Production health check failed');
  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('1. Check server logs for errors');
  console.log('2. Verify database connectivity');
  console.log('3. Check deployment status');
  console.log('4. Restart application services');
  console.log('5. Check load balancer configuration');
  
  process.exit(1);
}