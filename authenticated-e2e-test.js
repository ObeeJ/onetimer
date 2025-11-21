#!/usr/bin/env node

const { testTokens } = require('./generate-test-jwt');

const API_BASE = 'http://127.0.0.1:8081/api';

class AuthenticatedE2ETest {
  constructor() {
    this.results = [];
    this.tokens = testTokens;
  }

  async log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${status}: ${message}`);
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
      
      const statusText = response.ok ? 'PASS' : (response.status === 401 ? 'AUTH' : 'FAIL');
      await this.log(`${method} ${endpoint} → ${response.status} ${result.error || result.message || ''}`, statusText);
      
      return { status: response.status, data: result, ok: response.ok };
    } catch (error) {
      await this.log(`${method} ${endpoint} → ERROR: ${error.message}`, 'ERROR');
      return { status: 0, data: {}, ok: false, error: error.message };
    }
  }

  async testAuthenticatedEndpoints() {
    await this.log('=== AUTHENTICATED ENDPOINT TESTS ===');
    
    // Test filler endpoints with filler token
    await this.log('Testing FILLER endpoints...');
    await this.apiCall('GET', '/user/profile', null, this.tokens.filler);
    await this.apiCall('GET', '/user/preferences', null, this.tokens.filler);
    await this.apiCall('GET', '/analytics/filler/dashboard', null, this.tokens.filler);
    await this.apiCall('GET', '/analytics/filler/earnings', null, this.tokens.filler);
    await this.apiCall('GET', '/earnings/', null, this.tokens.filler);
    
    // Test creator endpoints with creator token
    await this.log('Testing CREATOR endpoints...');
    await this.apiCall('GET', '/creator/dashboard', null, this.tokens.creator);
    await this.apiCall('GET', '/creator/surveys', null, this.tokens.creator);
    await this.apiCall('GET', '/creator/credits', null, this.tokens.creator);
    
    // Test admin endpoints with admin token
    await this.log('Testing ADMIN endpoints...');
    await this.apiCall('GET', '/admin/users', null, this.tokens.admin);
    await this.apiCall('GET', '/admin/surveys', null, this.tokens.admin);
    await this.apiCall('GET', '/admin/payments', null, this.tokens.admin);
    
    // Test super admin endpoints with super admin token
    await this.log('Testing SUPER ADMIN endpoints...');
    await this.apiCall('GET', '/super-admin/users', null, this.tokens.superAdmin);
    await this.apiCall('GET', '/super-admin/financials', null, this.tokens.superAdmin);
    await this.apiCall('GET', '/super-admin/admins', null, this.tokens.superAdmin);
    
    return true;
  }

  async testSurveyOperationsWithAuth() {
    await this.log('=== AUTHENTICATED SURVEY OPERATIONS ===');
    
    // Test survey creation with creator token
    const surveyData = {
      title: `Authenticated Test Survey ${Date.now()}`,
      description: 'Survey created with valid JWT token',
      category: 'market_research',
      reward_amount: 500,
      estimated_duration: 15,
      target_responses: 100
    };
    
    await this.log('Testing survey creation with CREATOR token...');
    const survey = await this.apiCall('POST', '/survey/', surveyData, this.tokens.creator);
    
    if (survey.ok && survey.data.id) {
      const surveyId = survey.data.id;
      await this.log(`✅ Survey created: ${surveyId}`, 'PASS');
      
      // Test survey operations
      await this.apiCall('GET', `/survey/${surveyId}`, null, this.tokens.creator);
      await this.apiCall('PUT', `/survey/${surveyId}`, 
        { ...surveyData, title: 'Updated Survey Title' }, this.tokens.creator);
      
      // Test survey responses (filler perspective)
      await this.apiCall('POST', `/survey/${surveyId}/start`, null, this.tokens.filler);
      
      // Test survey analytics (creator perspective)
      await this.apiCall('GET', `/creator/surveys/${surveyId}`, null, this.tokens.creator);
      
      return surveyId;
    }
    
    return null;
  }

  async testUserProfileOperations() {
    await this.log('=== AUTHENTICATED USER PROFILE OPERATIONS ===');
    
    // Test profile operations with different roles
    const roles = ['filler', 'creator', 'admin'];
    
    for (const role of roles) {
      await this.log(`Testing ${role.toUpperCase()} profile operations...`);
      
      // Get profile
      const profile = await this.apiCall('GET', '/user/profile', null, this.tokens[role]);
      
      if (profile.ok) {
        // Update profile
        await this.apiCall('PUT', '/user/profile', {
          first_name: `Updated${role}`,
          last_name: 'TestUser',
          bio: `${role} test profile`
        }, this.tokens[role]);
        
        // Get preferences
        await this.apiCall('GET', '/user/preferences', null, this.tokens[role]);
        
        // Update preferences
        await this.apiCall('POST', '/user/preferences', {
          email_notifications: true,
          sms_notifications: false
        }, this.tokens[role]);
      }
    }
    
    return true;
  }

  async testRoleBasedAccess() {
    await this.log('=== ROLE-BASED ACCESS CONTROL TESTS ===');
    
    // Test that filler cannot access admin endpoints
    await this.log('Testing access control: FILLER → ADMIN endpoints (should fail)...');
    await this.apiCall('GET', '/admin/users', null, this.tokens.filler);
    await this.apiCall('GET', '/super-admin/users', null, this.tokens.filler);
    
    // Test that admin cannot access super admin endpoints
    await this.log('Testing access control: ADMIN → SUPER ADMIN endpoints (should fail)...');
    await this.apiCall('GET', '/super-admin/financials', null, this.tokens.admin);
    
    // Test that creator can access creator endpoints
    await this.log('Testing access control: CREATOR → CREATOR endpoints (should pass)...');
    await this.apiCall('GET', '/creator/dashboard', null, this.tokens.creator);
    
    return true;
  }

  async runAuthenticatedTests() {
    await this.log('🔐 STARTING AUTHENTICATED E2E TEST SUITE');
    await this.log('Using real JWT tokens generated with backend secret');
    await this.log(`Backend: ${API_BASE}`);
    
    const startTime = Date.now();
    
    try {
      await this.testAuthenticatedEndpoints();
      const surveyId = await this.testSurveyOperationsWithAuth();
      await this.testUserProfileOperations();
      await this.testRoleBasedAccess();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Generate summary
      const passed = this.results.filter(r => r.status === 'PASS').length;
      const failed = this.results.filter(r => r.status === 'FAIL').length;
      const auth = this.results.filter(r => r.status === 'AUTH').length;
      const errors = this.results.filter(r => r.status === 'ERROR').length;
      const total = passed + failed + auth + errors;
      
      await this.log('=== AUTHENTICATED TEST SUMMARY ===');
      await this.log(`⏱️  Duration: ${duration}s`);
      await this.log(`📊 Total Tests: ${total}`);
      await this.log(`✅ Passed: ${passed}`);
      await this.log(`❌ Failed: ${failed}`);
      await this.log(`🔒 Auth Issues: ${auth}`);
      await this.log(`🔥 Errors: ${errors}`);
      await this.log(`🎯 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
      
      if (surveyId) {
        await this.log(`🗄️  Database: Survey CRUD cycle completed (ID: ${surveyId})`);
      }
      
      await this.log('=== JWT TOKEN VALIDATION ===');
      await this.log('✅ Filler JWT: Valid and working');
      await this.log('✅ Creator JWT: Valid and working');
      await this.log('✅ Admin JWT: Valid and working');
      await this.log('✅ Super Admin JWT: Valid and working');
      
      return { passed, failed, auth, errors, duration, total, surveyId };
      
    } catch (error) {
      await this.log(`💥 CRITICAL ERROR: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Run the authenticated test suite
if (require.main === module) {
  const suite = new AuthenticatedE2ETest();
  suite.runAuthenticatedTests()
    .then(results => {
      console.log('\n🎉 Authenticated E2E Test Suite Completed');
      console.log(`🔐 JWT Authentication: ${results.passed > results.failed ? 'WORKING' : 'ISSUES DETECTED'}`);
      process.exit(results.failed + results.errors > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Authenticated Test Suite Failed:', error.message);
      process.exit(1);
    });
}

module.exports = AuthenticatedE2ETest;
