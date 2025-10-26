const { test, expect } = require('@playwright/test');

// Full system integration test
test.describe('Complete System Integration Test', () => {
  const baseURL = 'http://localhost:3000';
  const apiURL = 'http://localhost:8080/api';

  test.beforeEach(async ({ page }) => {
    // Setup test environment
    await page.goto(baseURL);
  });

  test('Filler Complete Journey', async ({ page }) => {
    console.log('Testing Filler Journey...');
    
    // 1. Filler Registration
    await page.goto(`${baseURL}/filler/auth/sign-in`);
    await page.click('text=Sign Up');
    await page.fill('[name="email"]', 'filler@test.com');
    await page.fill('[name="name"]', 'Test Filler');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. Complete Onboarding
    await page.waitForURL('**/filler/onboarding');
    await page.fill('[name="phone"]', '+2348012345678');
    await page.selectOption('[name="gender"]', 'male');
    await page.fill('[name="location"]', 'Lagos, Nigeria');
    await page.click('button:has-text("Continue")');
    
    // 3. KYC Upload
    await page.waitForSelector('input[type="file"]');
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/test-id.jpg');
    await page.click('button:has-text("Upload")');
    
    // 4. Browse Surveys (after KYC approval)
    await page.goto(`${baseURL}/filler/surveys`);
    await page.waitForSelector('[data-testid="survey-card"]');
    
    // 5. Take Survey
    await page.click('[data-testid="survey-card"]:first-child');
    await page.click('button:has-text("Start Survey")');
    
    // Answer questions
    await page.click('input[type="radio"]:first-child');
    await page.fill('textarea', 'This is my survey response');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Submit")');
    
    // 6. Check Earnings
    await page.goto(`${baseURL}/filler/earnings`);
    await page.waitForSelector('[data-testid="earnings-balance"]');
    
    // 7. Request Withdrawal
    await page.click('button:has-text("Withdraw")');
    await page.fill('[name="amount"]', '5000');
    await page.selectOption('[name="bank"]', 'Access Bank');
    await page.fill('[name="accountNumber"]', '1234567890');
    await page.click('button:has-text("Request Withdrawal")');
    
    expect(await page.textContent('[data-testid="success-message"]')).toContain('Withdrawal requested');
  });

  test('Creator Complete Journey', async ({ page }) => {
    console.log('Testing Creator Journey...');
    
    // 1. Creator Registration
    await page.goto(`${baseURL}/creator/auth/sign-up`);
    await page.fill('[name="email"]', 'creator@test.com');
    await page.fill('[name="name"]', 'Test Creator');
    await page.fill('[name="organizationName"]', 'Test Company');
    await page.selectOption('[name="organizationType"]', 'business');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. Purchase Credits
    await page.goto(`${baseURL}/creator/credits`);
    await page.click('button:has-text("Buy Credits")');
    await page.click('[data-testid="credit-package-1000"]');
    await page.click('button:has-text("Pay with Paystack")');
    
    // 3. Create Survey
    await page.goto(`${baseURL}/creator/surveys/create`);
    await page.fill('[name="title"]', 'Consumer Behavior Study');
    await page.fill('[name="description"]', 'Understanding consumer preferences');
    await page.selectOption('[name="category"]', 'lifestyle');
    await page.fill('[name="reward"]', '500');
    await page.fill('[name="maxResponses"]', '100');
    
    // Add questions
    await page.click('button:has-text("Add Question")');
    await page.fill('[name="questions[0].title"]', 'What is your age group?');
    await page.selectOption('[name="questions[0].type"]', 'multiple_choice');
    await page.fill('[name="questions[0].options[0]"]', '18-25');
    await page.fill('[name="questions[0].options[1]"]', '26-35');
    
    await page.click('button:has-text("Save Survey")');
    
    // 4. Submit for Approval
    await page.click('button:has-text("Submit for Review")');
    expect(await page.textContent('[data-testid="status"]')).toContain('pending');
    
    // 5. View Analytics (after approval and responses)
    await page.goto(`${baseURL}/creator/surveys`);
    await page.click('[data-testid="survey-item"]:first-child');
    await page.click('tab:has-text("Analytics")');
    await page.waitForSelector('[data-testid="response-chart"]');
    
    // 6. Export Responses
    await page.click('button:has-text("Export")');
    await page.selectOption('[name="format"]', 'csv');
    await page.click('button:has-text("Download")');
  });

  test('Admin Complete Journey', async ({ page }) => {
    console.log('Testing Admin Journey...');
    
    // 1. Admin Login
    await page.goto(`${baseURL}/admin/auth/login`);
    await page.fill('[name="email"]', 'admin@onetimer.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 2. Review Users
    await page.goto(`${baseURL}/admin/users`);
    await page.waitForSelector('[data-testid="user-table"]');
    
    // Approve Filler KYC
    await page.click('[data-testid="user-row"]:has-text("filler@test.com")');
    await page.click('button:has-text("Approve KYC")');
    expect(await page.textContent('[data-testid="kyc-status"]')).toContain('approved');
    
    // Approve Creator Account
    await page.click('[data-testid="user-row"]:has-text("creator@test.com")');
    await page.click('button:has-text("Approve Account")');
    
    // 3. Review Surveys
    await page.goto(`${baseURL}/admin/surveys`);
    await page.waitForSelector('[data-testid="survey-table"]');
    
    // Approve Survey
    await page.click('[data-testid="survey-row"]:first-child');
    await page.click('button:has-text("Approve Survey")');
    await page.fill('[name="approvalNote"]', 'Survey meets quality standards');
    await page.click('button:has-text("Confirm Approval")');
    
    // 4. Process Payments
    await page.goto(`${baseURL}/admin/payments`);
    await page.waitForSelector('[data-testid="withdrawal-table"]');
    
    // Process Withdrawal
    await page.click('[data-testid="withdrawal-row"]:first-child');
    await page.click('button:has-text("Process Payout")');
    await page.click('button:has-text("Confirm")');
    
    // 5. View Reports
    await page.goto(`${baseURL}/admin/reports`);
    await page.waitForSelector('[data-testid="analytics-dashboard"]');
    
    expect(await page.textContent('[data-testid="total-users"]')).toMatch(/\d+/);
    expect(await page.textContent('[data-testid="active-surveys"]')).toMatch(/\d+/);
  });

  test('Super Admin Complete Journey', async ({ page }) => {
    console.log('Testing Super Admin Journey...');
    
    // 1. Super Admin Login
    await page.goto(`${baseURL}/super-admin/auth/login`);
    await page.fill('[name="email"]', 'superadmin@onetimer.com');
    await page.fill('[name="password"]', 'superadmin123');
    await page.click('button[type="submit"]');
    
    // 2. Create New Admin
    await page.goto(`${baseURL}/super-admin/admins`);
    await page.click('button:has-text("Add Admin")');
    await page.fill('[name="email"]', 'newadmin@onetimer.com');
    await page.fill('[name="name"]', 'New Admin');
    await page.fill('[name="password"]', 'newadmin123');
    await page.click('button:has-text("Create Admin")');
    
    // 3. View Financial Overview
    await page.goto(`${baseURL}/super-admin/finance`);
    await page.waitForSelector('[data-testid="financial-dashboard"]');
    
    expect(await page.textContent('[data-testid="total-revenue"]')).toMatch(/₦[\d,]+/);
    expect(await page.textContent('[data-testid="total-payouts"]')).toMatch(/₦[\d,]+/);
    
    // 4. Review Audit Logs
    await page.goto(`${baseURL}/super-admin/audit`);
    await page.waitForSelector('[data-testid="audit-table"]');
    
    // Filter by admin actions
    await page.selectOption('[name="actionType"]', 'user_approved');
    await page.click('button:has-text("Filter")');
    
    // 5. System Settings
    await page.goto(`${baseURL}/super-admin/settings`);
    await page.fill('[name="minWithdrawal"]', '5000');
    await page.fill('[name="platformFee"]', '15');
    await page.click('button:has-text("Save Settings")');
    
    // 6. Suspend Admin (if needed)
    await page.goto(`${baseURL}/super-admin/admins`);
    await page.click('[data-testid="admin-row"]:has-text("admin@onetimer.com")');
    await page.click('button:has-text("Suspend")');
    await page.fill('[name="reason"]', 'Policy violation');
    await page.click('button:has-text("Confirm Suspension")');
  });

  test('Database Integration Test', async ({ page }) => {
    console.log('Testing Database Integration...');
    
    // Test API endpoints directly
    const response = await page.request.get(`${apiURL}/health`);
    expect(response.status()).toBe(200);
    
    // Test user creation
    const userResponse = await page.request.post(`${apiURL}/user/register`, {
      data: {
        email: 'dbtest@test.com',
        name: 'DB Test User',
        role: 'filler',
        password: 'password123'
      }
    });
    expect(userResponse.status()).toBe(201);
    
    // Test survey creation
    const surveyResponse = await page.request.post(`${apiURL}/survey`, {
      data: {
        title: 'DB Test Survey',
        description: 'Testing database integration',
        category: 'technology',
        reward: 300,
        maxResponses: 50
      },
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    expect(surveyResponse.status()).toBe(201);
    
    // Test earnings tracking
    const earningsResponse = await page.request.get(`${apiURL}/earnings`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    expect(earningsResponse.status()).toBe(200);
  });

  test('Role Communication Test', async ({ page }) => {
    console.log('Testing Role Communication...');
    
    // Test notification system
    await page.goto(`${baseURL}/admin/users`);
    await page.click('[data-testid="approve-user-btn"]');
    
    // Check if notification was sent
    await page.goto(`${baseURL}/filler`);
    await page.waitForSelector('[data-testid="notification"]');
    expect(await page.textContent('[data-testid="notification"]')).toContain('approved');
    
    // Test audit logging
    await page.goto(`${baseURL}/super-admin/audit`);
    await page.waitForSelector('[data-testid="audit-entry"]:has-text("user_approved")');
  });

  test('Payment Integration Test', async ({ page }) => {
    console.log('Testing Payment Integration...');
    
    // Test Paystack integration
    await page.goto(`${baseURL}/creator/credits`);
    await page.click('button:has-text("Buy Credits")');
    
    // Should redirect to Paystack
    await page.waitForURL('**/paystack.co/**');
    
    // Test withdrawal processing
    await page.goto(`${baseURL}/filler/earnings`);
    await page.click('button:has-text("Withdraw")');
    await page.fill('[name="amount"]', '10000');
    await page.click('button:has-text("Request")');
    
    expect(await page.textContent('[data-testid="withdrawal-status"]')).toContain('pending');
  });
});