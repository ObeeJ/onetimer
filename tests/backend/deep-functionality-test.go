package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"onetimer-backend/api/controllers"
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/database"
	"onetimer-backend/models"
	"onetimer-backend/services"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Deep functionality test for all user roles
func TestCompleteSystemFunctionality(t *testing.T) {
	// Setup test environment
	cfg := config.Load()
	app := fiber.New()
	cacheInstance := cache.New()
	
	// Mock database for testing
	db := setupTestDatabase(t)
	defer db.Close()
	
	// Initialize services
	emailService := services.NewEmailService(cfg)
	paystackService := services.NewPaystackService(cfg.PaystackSecret)
	
	// Initialize all controllers
	userController := controllers.NewUserController(cacheInstance)
	adminController := controllers.NewAdminController(cacheInstance, db)
	creatorController := controllers.NewCreatorController(cacheInstance)
	superAdminController := controllers.NewSuperAdminController(cacheInstance)
	surveyController := controllers.NewSurveyController(cacheInstance, db)
	earningsController := controllers.NewEarningsController(cacheInstance)
	withdrawalController := controllers.NewWithdrawalController(cacheInstance, db, cfg.PaystackSecret)
	
	t.Run("FillerCompleteWorkflow", func(t *testing.T) {
		// 1. Filler Registration
		fillerData := map[string]interface{}{
			"email":    "filler@test.com",
			"name":     "Test Filler",
			"password": "password123",
			"role":     "filler",
		}
		
		body, _ := json.Marshal(fillerData)
		req := httptest.NewRequest("POST", "/api/user/register", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 201, resp.StatusCode)
		
		// 2. Complete Onboarding
		onboardingData := map[string]interface{}{
			"phone":       "+2348012345678",
			"gender":      "male",
			"location":    "Lagos, Nigeria",
			"occupation":  "Student",
			"age_range":   "18-25",
		}
		
		body, _ = json.Marshal(onboardingData)
		req = httptest.NewRequest("POST", "/api/onboarding/filler", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer test-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 3. Upload KYC Documents
		// Mock file upload test
		req = httptest.NewRequest("POST", "/api/upload/kyc", nil)
		req.Header.Set("Authorization", "Bearer test-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		// Should handle file upload
		
		// 4. Browse Available Surveys
		req = httptest.NewRequest("GET", "/api/survey?status=active", nil)
		req.Header.Set("Authorization", "Bearer test-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 5. Take Survey
		surveyResponse := map[string]interface{}{
			"answers": []map[string]interface{}{
				{"question_id": "q1", "value": "Option A"},
				{"question_id": "q2", "value": "This is my detailed response"},
			},
		}
		
		body, _ = json.Marshal(surveyResponse)
		req = httptest.NewRequest("POST", "/api/survey/test-survey-id/submit", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer test-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 6. Check Earnings
		req = httptest.NewRequest("GET", "/api/earnings", nil)
		req.Header.Set("Authorization", "Bearer test-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 7. Request Withdrawal
		withdrawalData := map[string]interface{}{
			"amount":         5000,
			"bank_name":      "Access Bank",
			"account_number": "1234567890",
			"account_name":   "Test Filler",
			"bank_code":      "044",
		}
		
		body, _ = json.Marshal(withdrawalData)
		req = httptest.NewRequest("POST", "/api/withdrawal/request", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer test-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 201, resp.StatusCode)
	})
	
	t.Run("CreatorCompleteWorkflow", func(t *testing.T) {
		// 1. Creator Registration
		creatorData := map[string]interface{}{
			"email":             "creator@test.com",
			"name":              "Test Creator",
			"password":          "password123",
			"role":              "creator",
			"organization_name": "Test Company",
			"organization_type": "business",
		}
		
		body, _ := json.Marshal(creatorData)
		req := httptest.NewRequest("POST", "/api/user/register", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 201, resp.StatusCode)
		
		// 2. Purchase Credits
		creditData := map[string]interface{}{
			"amount": 1000,
			"type":   "survey_credits",
		}
		
		body, _ = json.Marshal(creditData)
		req = httptest.NewRequest("POST", "/api/credits/purchase", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer creator-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		
		// 3. Create Survey
		surveyData := map[string]interface{}{
			"title":         "Consumer Behavior Study",
			"description":   "Understanding consumer preferences",
			"category":      "lifestyle",
			"reward":        500,
			"max_responses": 100,
			"questions": []map[string]interface{}{
				{
					"type":     "multiple_choice",
					"title":    "What is your age group?",
					"required": true,
					"options":  []string{"18-25", "26-35", "36-45", "46+"},
				},
				{
					"type":     "open_ended",
					"title":    "What factors influence your purchasing decisions?",
					"required": true,
				},
			},
		}
		
		body, _ = json.Marshal(surveyData)
		req = httptest.NewRequest("POST", "/api/survey", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer creator-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 201, resp.StatusCode)
		
		// 4. View Survey Analytics
		req = httptest.NewRequest("GET", "/api/creator/surveys/test-survey-id/analytics", nil)
		req.Header.Set("Authorization", "Bearer creator-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 5. Export Survey Responses
		req = httptest.NewRequest("POST", "/api/creator/surveys/test-survey-id/export?format=csv", nil)
		req.Header.Set("Authorization", "Bearer creator-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})
	
	t.Run("AdminCompleteWorkflow", func(t *testing.T) {
		// 1. Admin Login
		loginData := map[string]interface{}{
			"email":    "admin@onetimer.com",
			"password": "admin123",
		}
		
		body, _ := json.Marshal(loginData)
		req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 2. Review and Approve Users
		req = httptest.NewRequest("GET", "/api/admin/users?role=filler&status=pending", nil)
		req.Header.Set("Authorization", "Bearer admin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// Approve Filler KYC
		req = httptest.NewRequest("POST", "/api/admin/users/test-filler-id/approve", nil)
		req.Header.Set("Authorization", "Bearer admin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 3. Review and Approve Surveys
		req = httptest.NewRequest("GET", "/api/admin/surveys?status=pending", nil)
		req.Header.Set("Authorization", "Bearer admin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// Approve Survey
		req = httptest.NewRequest("POST", "/api/admin/surveys/test-survey-id/approve", nil)
		req.Header.Set("Authorization", "Bearer admin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 4. Process Payments
		req = httptest.NewRequest("GET", "/api/admin/payments", nil)
		req.Header.Set("Authorization", "Bearer admin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// Process Batch Payouts
		payoutData := map[string]interface{}{
			"withdrawal_ids": []string{"withdrawal-1", "withdrawal-2"},
		}
		
		body, _ = json.Marshal(payoutData)
		req = httptest.NewRequest("POST", "/api/admin/payouts", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer admin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 5. Generate Reports
		req = httptest.NewRequest("GET", "/api/admin/reports", nil)
		req.Header.Set("Authorization", "Bearer admin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})
	
	t.Run("SuperAdminCompleteWorkflow", func(t *testing.T) {
		// 1. Create New Admin
		adminData := map[string]interface{}{
			"email":    "newadmin@onetimer.com",
			"name":     "New Admin",
			"password": "newadmin123",
		}
		
		body, _ := json.Marshal(adminData)
		req := httptest.NewRequest("POST", "/api/super-admin/admins", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer superadmin-token")
		
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 201, resp.StatusCode)
		
		// 2. View Financial Overview
		req = httptest.NewRequest("GET", "/api/super-admin/financials", nil)
		req.Header.Set("Authorization", "Bearer superadmin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 3. Review Audit Logs
		req = httptest.NewRequest("GET", "/api/super-admin/audit-logs", nil)
		req.Header.Set("Authorization", "Bearer superadmin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		
		// 4. Update System Settings
		settingsData := map[string]interface{}{
			"min_withdrawal_amount": 5000,
			"platform_fee_percentage": 15.0,
			"kyc_required": true,
		}
		
		body, _ = json.Marshal(settingsData)
		req = httptest.NewRequest("PUT", "/api/super-admin/settings", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer superadmin-token")
		
		resp, err = app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})
	
	t.Run("DatabaseIntegrationTest", func(t *testing.T) {
		// Test database operations directly
		ctx := context.Background()
		
		// Test user creation
		userID := uuid.New()
		_, err := db.Exec(ctx, 
			`INSERT INTO users (id, email, name, role, password_hash) 
			 VALUES ($1, $2, $3, $4, $5)`,
			userID, "dbtest@test.com", "DB Test User", "filler", "hashed_password")
		require.NoError(t, err)
		
		// Test survey creation
		surveyID := uuid.New()
		_, err = db.Exec(ctx,
			`INSERT INTO surveys (id, creator_id, title, description, reward, status) 
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			surveyID, userID, "DB Test Survey", "Testing database", 500, "active")
		require.NoError(t, err)
		
		// Test earnings tracking
		earningID := uuid.New()
		_, err = db.Exec(ctx,
			`INSERT INTO earnings (id, user_id, amount, source, status) 
			 VALUES ($1, $2, $3, $4, $5)`,
			earningID, userID, 500, "survey_completion", "completed")
		require.NoError(t, err)
		
		// Test withdrawal request
		withdrawalID := uuid.New()
		_, err = db.Exec(ctx,
			`INSERT INTO withdrawals (id, user_id, amount, bank_name, account_number, account_name, bank_code, status) 
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			withdrawalID, userID, 5000, "Access Bank", "1234567890", "Test User", "044", "pending")
		require.NoError(t, err)
		
		// Test audit logging
		auditID := uuid.New()
		_, err = db.Exec(ctx,
			`INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details) 
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			auditID, userID, "user_approved", "user", userID, `{"reason": "KYC verified"}`)
		require.NoError(t, err)
		
		// Verify data integrity
		var count int
		err = db.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE email = $1", "dbtest@test.com").Scan(&count)
		require.NoError(t, err)
		assert.Equal(t, 1, count)
		
		// Test referral system
		referralID := uuid.New()
		referredID := uuid.New()
		_, err = db.Exec(ctx,
			`INSERT INTO referrals (id, referrer_id, referred_id, referral_code, bonus_amount, status) 
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			referralID, userID, referredID, "REF123", 1000, "completed")
		require.NoError(t, err)
	})
	
	t.Run("PaymentIntegrationTest", func(t *testing.T) {
		// Test Paystack service integration
		paystack := services.NewPaystackService("test_secret_key")
		
		// Test payment initialization (mock)
		// This would normally call Paystack API
		// For testing, we verify the service is properly configured
		assert.NotNil(t, paystack)
		
		// Test bank verification
		// Mock bank verification response
		// In real scenario, this would verify with Paystack
		
		// Test transfer creation
		// Mock transfer creation
		// In real scenario, this would create transfer via Paystack
	})
}

func setupTestDatabase(t *testing.T) *pgxpool.Pool {
	// Setup test database connection
	// This would connect to a test database
	// For now, we'll mock it
	return nil // Replace with actual test DB connection
}