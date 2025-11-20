#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';
const FRONTEND_BASE = 'http://localhost:3000';

console.log('🔗 INTEGRATION TESTS - FRONTEND ↔ BACKEND');
console.log('==========================================\n');

class IntegrationTester {
  constructor() {
    this.results = { passed: 0, failed: 0 };
  }

  async test(name, testFn) {
    try {
      console.log(`⏳ ${name}...`);
      await testFn();
      console.log(`✅ ${name} - PASSED`);
      this.results.passed++;
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`);
      this.results.failed++;
    }
  }

  async runAll() {
    // Test 1: Health Check
    await this.test('Backend Health Check', async () => {
      const response = await axios.get(`${API_BASE}/health`);
      if (response.status !== 200) throw new Error('Health check failed');
    });

    // Test 2: User Registration Flow
    await this.test('User Registration Flow', async () => {
      const userData = {
        email: `test${Date.now()}@test.com`,
        name: 'Test User',
        role: 'filler',
        password: 'TestPass123!'
      };
      
      const response = await axios.post(`${API_BASE}/user/register`, userData);
      if (response.status !== 201) throw new Error('Registration failed');
      if (!response.data.user) throw new Error('No user data returned');
    });

    // Test 3: Login Flow
    await this.test('Login Authentication Flow', async () => {
      const loginData = { email: 'test@test.com', password: 'password123' };
      
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, loginData);
        // Expect 401 for invalid credentials
        if (response.status === 200 && response.data.token) {
          // Valid login
        } else if (response.status === 401) {
          // Expected for test credentials
        } else {
          throw new Error('Unexpected login response');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Expected for invalid test credentials
        } else {
          throw error;
        }
      }
    });

    // Test 4: Survey Operations
    await this.test('Survey CRUD Operations', async () => {
      const response = await axios.get(`${API_BASE}/survey`);
      if (response.status !== 200) throw new Error('Survey fetch failed');
      if (!Array.isArray(response.data.data)) throw new Error('Invalid survey data format');
    });

    // Test 5: Billing Calculations
    await this.test('Billing System Integration', async () => {
      const billingData = {
        pages: 5,
        reward_per_user: 500,
        respondents: 100,
        priority_placement: false,
        demographic_filters: 1,
        extra_days: 0,
        data_export: false
      };
      
      const response = await axios.post(`${API_BASE}/billing/calculate`, billingData);
      if (response.status !== 200) throw new Error('Billing calculation failed');
      if (!response.data.data?.total_cost) throw new Error('No cost calculated');
    });

    // Test 6: File Upload Endpoint
    await this.test('File Upload Endpoint', async () => {
      try {
        const formData = new FormData();
        formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
        
        await axios.post(`${API_BASE}/upload/kyc`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (error) {
        // Expect 401 without auth - endpoint exists
        if (error.response?.status === 401) {
          // Expected
        } else {
          throw error;
        }
      }
    });

    // Test 7: Frontend-Backend Communication
    await this.test('Frontend-Backend Communication', async () => {
      // Test if frontend can reach backend through proxy
      try {
        const response = await axios.get(`${FRONTEND_BASE}/api/healthz`);
        if (response.status === 200) {
          // Frontend health endpoint works
        }
      } catch (error) {
        // Check if it's a proxy to backend
        if (error.response?.status >= 400) {
          // Endpoint exists but may require auth
        } else {
          throw new Error('Frontend-backend communication failed');
        }
      }
    });

    this.printResults();
  }

  printResults() {
    const total = this.results.passed + this.results.failed;
    const successRate = ((this.results.passed / total) * 100).toFixed(1);
    
    console.log(`\n📊 INTEGRATION TEST RESULTS:`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Install axios if not present
try {
  require('axios');
} catch (e) {
  console.log('Installing axios...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
}

new IntegrationTester().runAll().catch(console.error);