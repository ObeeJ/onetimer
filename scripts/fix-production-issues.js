#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING PRODUCTION ISSUES');
console.log('===========================\n');

// 1. Update next.config.js for better CSS handling
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
const nextConfigFix = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`;

try {
  fs.writeFileSync(nextConfigPath, nextConfigFix);
  console.log('✅ Updated next.config.js');
} catch (error) {
  console.log('❌ Failed to update next.config.js');
}

// 2. Create browser compatibility polyfill
const polyfillContent = `
// Browser compatibility polyfills
if (typeof document !== 'undefined' && !document.adoptedStyleSheets) {
  document.adoptedStyleSheets = [];
}

// Add filter method if missing
if (Array.prototype.filter === undefined) {
  Array.prototype.filter = function(callback) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
      if (callback(this[i], i, this)) {
        result.push(this[i]);
      }
    }
    return result;
  };
}
`;

const polyfillPath = path.join(process.cwd(), 'lib', 'polyfills.js');
try {
  fs.writeFileSync(polyfillPath, polyfillContent);
  console.log('✅ Created browser polyfills');
} catch (error) {
  console.log('❌ Failed to create polyfills');
}

console.log('\n🚀 NEXT STEPS:');
console.log('1. Import polyfills in your main layout');
console.log('2. Update authentication error handling');
console.log('3. Rebuild and redeploy application');
console.log('4. Test with: npm run test:production');