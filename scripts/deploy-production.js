#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 PRODUCTION DEPLOYMENT');
console.log('========================\n');

const steps = [
  { name: 'Clean build', cmd: 'rm -rf .next' },
  { name: 'Install dependencies', cmd: 'npm ci' },
  { name: 'Run tests', cmd: 'npm run test:quick' },
  { name: 'Build production', cmd: 'npm run build' },
  { name: 'Test build', cmd: 'npm run test:compilation' }
];

for (const step of steps) {
  try {
    console.log(`⏳ ${step.name}...`);
    execSync(step.cmd, { stdio: 'inherit' });
    console.log(`✅ ${step.name} - SUCCESS\n`);
  } catch (error) {
    console.log(`❌ ${step.name} - FAILED\n`);
    process.exit(1);
  }
}

console.log('🎉 PRODUCTION BUILD READY!');
console.log('\n📋 DEPLOYMENT CHECKLIST:');
console.log('1. Upload .next folder to server');
console.log('2. Update environment variables');
console.log('3. Restart backend services');
console.log('4. Run: npm run test:production');