#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

class MasterTestSuite {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
  }

  async log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${status}: ${message}`);
  }

  async runCommand(command, args = [], description = '') {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { 
        cwd: '/home/obeej/Desktop/onetimer',
        stdio: 'pipe'
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0
        });
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkSystemStatus() {
    await this.log('=== SYSTEM STATUS CHECK ===');
    
    // Check if backend is running
    try {
      const response = await fetch('http://127.0.0.1:8081/health');
      if (response.ok) {
        await this.log('✅ Backend server is running on port 8081', 'PASS');
        this.results.backend = true;
      } else {
        await this.log('❌ Backend server not responding', 'FAIL');
        this.results.backend = false;
      }
    } catch (error) {
      await this.log('❌ Backend server not accessible', 'FAIL');
      this.results.backend = false;
    }
    
    // Check if frontend is running
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok) {
        await this.log('✅ Frontend server is running on port 3000', 'PASS');
        this.results.frontend = true;
      } else {
        await this.log('❌ Frontend server not responding', 'FAIL');
        this.results.frontend = false;
      }
    } catch (error) {
      await this.log('❌ Frontend server not accessible', 'FAIL');
      this.results.frontend = false;
    }
  }

  async runDatabaseTests() {
    await this.log('=== RUNNING DATABASE TESTS ===');
    
    try {
      const result = await this.runCommand('node', ['verify-database.js'], 'Database Verification');
      
      if (result.success) {
        await this.log('✅ Database tests passed', 'PASS');
        this.results.database = true;
        
        // Extract key metrics from output
        const output = result.stdout;
        const passedMatch = output.match(/✅ Passed: (\d+)/);
        const failedMatch = output.match(/❌ Failed: (\d+)/);
        
        if (passedMatch && failedMatch) {
          await this.log(`📊 Database: ${passedMatch[1]} passed, ${failedMatch[1]} failed`, 'INFO');
        }
      } else {
        await this.log('❌ Database tests failed', 'FAIL');
        this.results.database = false;
      }
    } catch (error) {
      await this.log(`❌ Database test error: ${error.message}`, 'FAIL');
      this.results.database = false;
    }
  }

  async runE2ETests() {
    await this.log('=== RUNNING E2E INTEGRATION TESTS ===');
    
    try {
      const result = await this.runCommand('node', ['enhanced-e2e-test.js'], 'E2E Integration Tests');
      
      if (result.success) {
        await this.log('✅ E2E tests completed', 'PASS');
        this.results.e2e = true;
        
        // Extract metrics
        const output = result.stdout;
        const successMatch = output.match(/✅ Successful: (\d+)/);
        const warningMatch = output.match(/⚠️  Warnings: (\d+)/);
        const errorMatch = output.match(/❌ Errors: (\d+)/);
        
        if (successMatch && warningMatch && errorMatch) {
          await this.log(`📊 E2E: ${successMatch[1]} success, ${warningMatch[1]} warnings, ${errorMatch[1]} errors`, 'INFO');
        }
      } else {
        await this.log('❌ E2E tests failed', 'FAIL');
        this.results.e2e = false;
      }
    } catch (error) {
      await this.log(`❌ E2E test error: ${error.message}`, 'FAIL');
      this.results.e2e = false;
    }
  }

  async testSpecificEndpoints() {
    await this.log('=== TESTING CRITICAL ENDPOINTS ===');
    
    const criticalEndpoints = [
      { method: 'GET', url: 'http://127.0.0.1:8081/health', name: 'Health Check' },
      { method: 'GET', url: 'http://127.0.0.1:8081/api/survey/', name: 'Survey List' },
      { method: 'GET', url: 'http://127.0.0.1:8081/api/credits/packages', name: 'Credit Packages' },
      { method: 'GET', url: 'http://127.0.0.1:8081/api/waitlist/stats', name: 'Waitlist Stats' },
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint.url);
        if (response.ok) {
          await this.log(`✅ ${endpoint.name}: ${response.status}`, 'PASS');
          passed++;
        } else {
          await this.log(`⚠️ ${endpoint.name}: ${response.status}`, 'WARN');
          failed++;
        }
      } catch (error) {
        await this.log(`❌ ${endpoint.name}: ${error.message}`, 'FAIL');
        failed++;
      }
    }
    
    this.results.endpoints = { passed, failed, total: criticalEndpoints.length };
  }

  async generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    await this.log('=== COMPREHENSIVE TEST REPORT ===');
    await this.log(`⏱️  Total Duration: ${duration}s`);
    await this.log('');
    
    // System Status
    await this.log('🖥️  SYSTEM STATUS:');
    await this.log(`   Frontend (port 3000): ${this.results.frontend ? '✅ RUNNING' : '❌ DOWN'}`);
    await this.log(`   Backend (port 8081):  ${this.results.backend ? '✅ RUNNING' : '❌ DOWN'}`);
    await this.log('');
    
    // Test Results
    await this.log('🧪 TEST RESULTS:');
    await this.log(`   Database Tests:       ${this.results.database ? '✅ PASSED' : '❌ FAILED'}`);
    await this.log(`   E2E Integration:      ${this.results.e2e ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (this.results.endpoints) {
      const { passed, failed, total } = this.results.endpoints;
      await this.log(`   Critical Endpoints:   ${passed}/${total} working (${((passed/total)*100).toFixed(1)}%)`);
    }
    
    await this.log('');
    
    // Overall Health
    const systemHealthy = this.results.frontend && this.results.backend;
    const testsHealthy = this.results.database && this.results.e2e;
    const overallHealthy = systemHealthy && testsHealthy;
    
    await this.log('🎯 OVERALL SYSTEM HEALTH:');
    await this.log(`   Status: ${overallHealthy ? '🟢 HEALTHY' : '🔴 NEEDS ATTENTION'}`);
    await this.log(`   Frontend-Backend-DB: ${overallHealthy ? '✅ FULLY INTEGRATED' : '⚠️ ISSUES DETECTED'}`);
    
    // Recommendations
    if (!overallHealthy) {
      await this.log('');
      await this.log('🔧 RECOMMENDATIONS:');
      if (!this.results.frontend) await this.log('   - Start frontend server: npm run dev');
      if (!this.results.backend) await this.log('   - Start backend server: ./onetimer-backend');
      if (!this.results.database) await this.log('   - Check database connectivity and schema');
      if (!this.results.e2e) await this.log('   - Review API endpoint implementations');
    }
    
    return {
      duration,
      systemHealthy,
      testsHealthy,
      overallHealthy,
      results: this.results
    };
  }

  async runMasterTestSuite() {
    await this.log('🚀 STARTING MASTER TEST SUITE');
    await this.log('Testing complete Frontend → Backend → Database integration');
    await this.log('');
    
    try {
      await this.checkSystemStatus();
      await this.testSpecificEndpoints();
      await this.runDatabaseTests();
      await this.runE2ETests();
      
      const report = await this.generateReport();
      
      return report;
      
    } catch (error) {
      await this.log(`💥 CRITICAL ERROR: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Run the master test suite
if (require.main === module) {
  const suite = new MasterTestSuite();
  suite.runMasterTestSuite()
    .then(report => {
      console.log('\n🎉 Master Test Suite Completed');
      console.log(`📊 System Status: ${report.overallHealthy ? 'PRODUCTION READY' : 'NEEDS FIXES'}`);
      process.exit(report.overallHealthy ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Master Test Suite Failed:', error.message);
      process.exit(1);
    });
}

module.exports = MasterTestSuite;
