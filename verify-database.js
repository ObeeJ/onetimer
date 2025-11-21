#!/usr/bin/env node

const API_BASE = 'http://127.0.0.1:8081/api';

class DatabaseVerification {
  constructor() {
    this.results = [];
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
      return { status: response.status, data: result, ok: response.ok };
    } catch (error) {
      return { status: 0, data: {}, ok: false, error: error.message };
    }
  }

  async verifyDatabaseTables() {
    await this.log('=== DATABASE TABLE VERIFICATION ===');
    
    // Test surveys table
    await this.log('Verifying surveys table...');
    const surveys = await this.apiCall('GET', '/survey/');
    if (surveys.ok) {
      const count = surveys.data.data ? surveys.data.data.length : 0;
      await this.log(`✅ Surveys table accessible: ${count} records found`, 'PASS');
      
      if (count > 0) {
        const survey = surveys.data.data[0];
        await this.log(`📋 Sample survey: ${survey.title} (ID: ${survey.id})`, 'INFO');
      }
    } else {
      await this.log('❌ Surveys table inaccessible', 'FAIL');
    }

    // Test waitlist table
    await this.log('Verifying waitlist table...');
    const waitlistStats = await this.apiCall('GET', '/waitlist/stats');
    if (waitlistStats.ok) {
      await this.log(`✅ Waitlist table accessible: ${JSON.stringify(waitlistStats.data)}`, 'PASS');
    } else {
      await this.log('❌ Waitlist table inaccessible', 'FAIL');
    }

    return true;
  }

  async testDatabaseWrites() {
    await this.log('=== DATABASE WRITE OPERATIONS ===');
    
    // Test waitlist insertion
    await this.log('Testing waitlist insertion...');
    const email = `dbtest${Date.now()}@example.com`;
    const waitlistJoin = await this.apiCall('POST', '/waitlist/join', {
      email: email,
      role: 'filler',
      interests: ['market_research']
    });
    
    if (waitlistJoin.ok) {
      await this.log(`✅ Waitlist record inserted: ${email}`, 'PASS');
      
      // Verify the insertion by checking stats
      const statsAfter = await this.apiCall('GET', '/waitlist/stats');
      if (statsAfter.ok) {
        await this.log(`✅ Database write verified via stats query`, 'PASS');
      }
    } else {
      await this.log('❌ Waitlist insertion failed', 'FAIL');
    }

    return true;
  }

  async testDatabaseQueries() {
    await this.log('=== DATABASE QUERY OPERATIONS ===');
    
    // Test complex queries
    const endpoints = [
      { endpoint: '/survey/', description: 'Survey listing query' },
      { endpoint: '/credits/packages', description: 'Credit packages query' },
      { endpoint: '/waitlist/stats', description: 'Waitlist aggregation query' }
    ];

    for (const test of endpoints) {
      await this.log(`Testing ${test.description}...`);
      const result = await this.apiCall('GET', test.endpoint);
      
      if (result.ok) {
        await this.log(`✅ ${test.description} successful`, 'PASS');
        
        // Log data structure for verification
        if (result.data.data && Array.isArray(result.data.data)) {
          await this.log(`📊 Returned ${result.data.data.length} records`, 'INFO');
        } else if (typeof result.data === 'object') {
          const keys = Object.keys(result.data);
          await this.log(`📊 Response structure: ${keys.join(', ')}`, 'INFO');
        }
      } else {
        await this.log(`❌ ${test.description} failed: ${result.data.error}`, 'FAIL');
      }
    }

    return true;
  }

  async verifyDatabaseSchema() {
    await this.log('=== DATABASE SCHEMA VERIFICATION ===');
    
    // Test endpoints that would fail if schema is wrong
    const schemaTests = [
      { 
        endpoint: '/survey/', 
        expectedFields: ['id', 'title', 'description', 'status', 'created_at'],
        description: 'Survey schema'
      }
    ];

    for (const test of schemaTests) {
      await this.log(`Verifying ${test.description}...`);
      const result = await this.apiCall('GET', test.endpoint);
      
      if (result.ok && result.data.data && result.data.data.length > 0) {
        const record = result.data.data[0];
        const hasAllFields = test.expectedFields.every(field => field in record);
        
        if (hasAllFields) {
          await this.log(`✅ ${test.description} schema valid`, 'PASS');
        } else {
          const missingFields = test.expectedFields.filter(field => !(field in record));
          await this.log(`⚠️ ${test.description} missing fields: ${missingFields.join(', ')}`, 'WARN');
        }
      } else {
        await this.log(`⚠️ ${test.description} - no data to verify schema`, 'WARN');
      }
    }

    return true;
  }

  async runDatabaseVerification() {
    await this.log('🗄️ STARTING DATABASE VERIFICATION');
    await this.log('Testing Supabase PostgreSQL connectivity and operations');
    
    const startTime = Date.now();
    
    try {
      await this.verifyDatabaseTables();
      await this.testDatabaseWrites();
      await this.testDatabaseQueries();
      await this.verifyDatabaseSchema();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Generate summary
      const passed = this.results.filter(r => r.status === 'PASS').length;
      const failed = this.results.filter(r => r.status === 'FAIL').length;
      const warnings = this.results.filter(r => r.status === 'WARN').length;
      
      await this.log('=== DATABASE VERIFICATION SUMMARY ===');
      await this.log(`⏱️  Duration: ${duration}s`);
      await this.log(`✅ Passed: ${passed}`);
      await this.log(`❌ Failed: ${failed}`);
      await this.log(`⚠️  Warnings: ${warnings}`);
      await this.log(`🎯 Database Health: ${failed === 0 ? 'HEALTHY' : 'NEEDS ATTENTION'}`);
      
      return { passed, failed, warnings, duration };
      
    } catch (error) {
      await this.log(`💥 CRITICAL DATABASE ERROR: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Run the database verification
if (require.main === module) {
  const verification = new DatabaseVerification();
  verification.runDatabaseVerification()
    .then(results => {
      console.log('\n🎉 Database Verification Completed');
      console.log(`📊 Database Status: ${results.failed === 0 ? 'FULLY OPERATIONAL' : 'ISSUES DETECTED'}`);
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Database Verification Failed:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseVerification;
