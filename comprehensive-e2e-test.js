#!/usr/bin/env node

const API_BASE = 'http://127.0.0.1:8081/api';

class E2ETestSuite {
  constructor() {
    this.results = [];
    this.tokens = {};
  }

  async log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${status}: ${message}`;
    console.log(logEntry);
    this.results.push({ timestamp, status, message });
  }

  async apiCall(method, endpoint, data = null, token = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json().catch(() => ({}));
      
      await this.log(`${method} ${endpoint} → ${response.status}`, 
        response.ok ? 'PASS' : 'FAIL');
      
      return { status: response.status, data: result, ok: response.ok };
    } catch (error) {
      await this.log(`${method} ${endpoint} → ERROR: ${error.message}`, 'ERROR');
      return { status: 0, data: {}, ok: false, error: error.message };
    }
  }

  async testAuth() {
    await this.log('=== AUTHENTICATION TESTS ===');
    
    // Test registration
    const regData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'filler',
      first_name: 'Test',
      last_name: 'User'
    };
    
    const reg = await this.apiCall('POST', '/user/register', regData);
    
    // Test login
    const login = await this.apiCall('POST', '/auth/login', {
      email: regData.email,
      password: regData.password
    });
    
    if (login.ok && login.data.token) {
      this.tokens.filler = login.data.token;
      await this.log('Filler token obtained', 'PASS');
    }

    // Test forgot password
    await this.apiCall('POST', '/auth/forgot-password', { email: regData.email });
    
    return reg.ok && login.ok;
  }

  async testSurveyOperations() {
    await this.log('=== SURVEY OPERATIONS ===');
    
    // Get surveys
    await this.apiCall('GET', '/survey/');
    
    // Create survey (requires creator token)
    const surveyData = {
      title: `E2E Test Survey ${Date.now()}`,
      description: 'Comprehensive test survey',
      category: 'market_research',
      reward_amount: 500,
      estimated_duration: 10,
      target_responses: 100
    };
    
    const survey = await this.apiCall('POST', '/survey/', surveyData, this.tokens.filler);
    
    if (survey.ok && survey.data.id) {
      // Test survey retrieval
      await this.apiCall('GET', `/survey/${survey.data.id}`);
      
      // Test survey update
      await this.apiCall('PUT', `/survey/${survey.data.id}`, 
        { ...surveyData, title: 'Updated Title' }, this.tokens.filler);
    }
    
    return survey.ok;
  }

  async testUserManagement() {
    await this.log('=== USER MANAGEMENT ===');
    
    // Test profile operations
    if (this.tokens.filler) {
      await this.apiCall('GET', '/user/profile', null, this.tokens.filler);
      
      await this.apiCall('PUT', '/user/profile', {
        first_name: 'Updated',
        last_name: 'Name'
      }, this.tokens.filler);
      
      await this.apiCall('GET', '/user/preferences', null, this.tokens.filler);
    }
    
    return true;
  }

  async testAnalytics() {
    await this.log('=== ANALYTICS TESTS ===');
    
    // Test filler analytics
    if (this.tokens.filler) {
      await this.apiCall('GET', '/analytics/filler/dashboard', null, this.tokens.filler);
      await this.apiCall('GET', '/analytics/filler/earnings', null, this.tokens.filler);
    }
    
    // Test general analytics
    await this.apiCall('GET', '/analytics/dashboard');
    
    return true;
  }

  async testAdminOperations() {
    await this.log('=== ADMIN OPERATIONS ===');
    
    // Test admin endpoints (will fail with 401 but confirms endpoints exist)
    await this.apiCall('GET', '/admin/users');
    await this.apiCall('GET', '/admin/surveys');
    await this.apiCall('GET', '/admin/payments');
    
    // Test super admin endpoints
    await this.apiCall('GET', '/super-admin/users');
    await this.apiCall('GET', '/super-admin/financials');
    
    return true;
  }

  async testPaymentOperations() {
    await this.log('=== PAYMENT OPERATIONS ===');
    
    // Test payment endpoints
    await this.apiCall('GET', '/payment/methods');
    await this.apiCall('GET', '/payment/history');
    
    // Test credits
    await this.apiCall('GET', '/credits/packages');
    
    // Test earnings
    await this.apiCall('GET', '/earnings/', null, this.tokens.filler);
    
    return true;
  }

  async testMiscOperations() {
    await this.log('=== MISCELLANEOUS OPERATIONS ===');
    
    // Test waitlist
    await this.apiCall('POST', '/waitlist/join', {
      email: `waitlist${Date.now()}@example.com`,
      role: 'filler'
    });
    
    // Test notifications
    if (this.tokens.filler) {
      await this.apiCall('GET', '/notification/', null, this.tokens.filler);
    }
    
    // Test health endpoints
    await this.apiCall('GET', '/health');
    
    return true;
  }

  async runComprehensiveTest() {
    await this.log('🚀 STARTING COMPREHENSIVE E2E TEST SUITE');
    await this.log(`Frontend: http://localhost:3000`);
    await this.log(`Backend: ${API_BASE}`);
    
    const startTime = Date.now();
    
    try {
      await this.testAuth();
      await this.testSurveyOperations();
      await this.testUserManagement();
      await this.testAnalytics();
      await this.testAdminOperations();
      await this.testPaymentOperations();
      await this.testMiscOperations();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Generate summary
      const passed = this.results.filter(r => r.status === 'PASS').length;
      const failed = this.results.filter(r => r.status === 'FAIL').length;
      const errors = this.results.filter(r => r.status === 'ERROR').length;
      
      await this.log('=== TEST SUMMARY ===');
      await this.log(`Duration: ${duration}s`);
      await this.log(`Total Tests: ${passed + failed + errors}`);
      await this.log(`✅ Passed: ${passed}`);
      await this.log(`❌ Failed: ${failed}`);
      await this.log(`🔥 Errors: ${errors}`);
      await this.log(`Success Rate: ${((passed / (passed + failed + errors)) * 100).toFixed(1)}%`);
      
      return { passed, failed, errors, duration };
      
    } catch (error) {
      await this.log(`CRITICAL ERROR: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Run the test suite
if (require.main === module) {
  const suite = new E2ETestSuite();
  suite.runComprehensiveTest()
    .then(results => {
      console.log('\n🎉 E2E Test Suite Completed');
      process.exit(results.failed + results.errors > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Test Suite Failed:', error.message);
      process.exit(1);
    });
}

module.exports = E2ETestSuite;
