#!/usr/bin/env node

const https = require('http');

async function makeRequest(url, method, data) {
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

    const req = https.request(options, (res) => {
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

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Flow\n');

  try {
    // Test 1: Forgot Password
    console.log('1️⃣ Testing Forgot Password...');
    const forgotResponse = await makeRequest('/api/auth/forgot-password', 'POST', {
      email: 'test@example.com'
    });
    
    console.log(`   Status: ${forgotResponse.status}`);
    console.log(`   Response: ${JSON.stringify(forgotResponse.data, null, 2)}`);
    
    if (forgotResponse.status !== 200 || !forgotResponse.data.success) {
      throw new Error('Forgot password failed');
    }
    
    const resetToken = forgotResponse.data.reset_token;
    console.log(`   ✅ Reset token generated: ${resetToken}\n`);

    // Test 2: Reset Password with valid token
    console.log('2️⃣ Testing Reset Password (valid)...');
    const resetResponse = await makeRequest('/api/auth/reset-password', 'POST', {
      token: resetToken,
      new_password: 'newpassword123'
    });
    
    console.log(`   Status: ${resetResponse.status}`);
    console.log(`   Response: ${JSON.stringify(resetResponse.data, null, 2)}`);
    
    if (resetResponse.status !== 200 || !resetResponse.data.success) {
      throw new Error('Reset password failed');
    }
    console.log('   ✅ Password reset successful\n');

    // Test 3: Try to use same token again (should fail)
    console.log('3️⃣ Testing token reuse (should fail)...');
    const reuseResponse = await makeRequest('/api/auth/reset-password', 'POST', {
      token: resetToken,
      new_password: 'anotherpassword123'
    });
    
    console.log(`   Status: ${reuseResponse.status}`);
    console.log(`   Response: ${JSON.stringify(reuseResponse.data, null, 2)}`);
    
    if (reuseResponse.status === 200) {
      console.log('   ⚠️  Token reuse should have failed but didn\'t');
    } else {
      console.log('   ✅ Token properly invalidated after use\n');
    }

    // Test 4: Invalid token
    console.log('4️⃣ Testing invalid token...');
    const invalidResponse = await makeRequest('/api/auth/reset-password', 'POST', {
      token: 'invalid-token-123',
      new_password: 'password123'
    });
    
    console.log(`   Status: ${invalidResponse.status}`);
    console.log(`   Response: ${JSON.stringify(invalidResponse.data, null, 2)}`);
    
    if (invalidResponse.status !== 400) {
      console.log('   ⚠️  Invalid token should return 400');
    } else {
      console.log('   ✅ Invalid token properly rejected\n');
    }

    // Test 5: Missing email
    console.log('5️⃣ Testing missing email...');
    const noEmailResponse = await makeRequest('/api/auth/forgot-password', 'POST', {});
    
    console.log(`   Status: ${noEmailResponse.status}`);
    console.log(`   Response: ${JSON.stringify(noEmailResponse.data, null, 2)}`);
    
    if (noEmailResponse.status !== 400) {
      console.log('   ⚠️  Missing email should return 400');
    } else {
      console.log('   ✅ Missing email properly rejected\n');
    }

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPasswordReset();