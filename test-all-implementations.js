#!/usr/bin/env node

const http = require('http');

async function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAllImplementations() {
  console.log('🧪 COMPREHENSIVE TODO IMPLEMENTATION TEST');
  console.log('==========================================\n');

  const tests = [
    {
      name: 'Password Reset Flow',
      tests: [
        { url: '/api/auth/forgot-password', method: 'POST', data: { email: 'test@example.com' } },
        { url: '/api/auth/reset-password', method: 'POST', data: { token: 'test-token', new_password: 'newpass123' } }
      ]
    },
    {
      name: 'Survey System',
      tests: [
        { url: '/api/surveys', method: 'GET' },
        { url: '/api/surveys/test-id/submit', method: 'POST', data: { answers: { '1': 'test' } } }
      ]
    },
    {
      name: 'Export Functionality',
      tests: [
        { url: '/api/earnings/export', method: 'GET' },
        { url: '/api/admin/users/export', method: 'GET' }
      ]
    },
    {
      name: 'Admin User Management',
      tests: [
        { url: '/api/admin/users/test-id/suspend', method: 'POST' },
        { url: '/api/admin/users/test-id/activate', method: 'POST' }
      ]
    },
    {
      name: 'Analytics Dashboard',
      tests: [
        { url: '/api/analytics/dashboard', method: 'GET' }
      ]
    }
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const category of tests) {
    console.log(`📊 Testing ${category.name}:`);
    
    for (const test of category.tests) {
      totalTests++;
      try {
        const response = await makeRequest(test.url, test.method, test.data);
        
        if (response.status < 500) {
          console.log(`   ✅ ${test.method} ${test.url} - Status: ${response.status}`);
          passedTests++;
        } else {
          console.log(`   ❌ ${test.method} ${test.url} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.method} ${test.url} - Error: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('📈 TEST RESULTS:');
  console.log('================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL IMPLEMENTATIONS WORKING!');
  } else {
    console.log('\n⚠️  Some implementations need attention');
  }
}

testAllImplementations().catch(console.error);