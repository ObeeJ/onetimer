package tests

import (
	"context"
	"onetimer-backend/models"
	"onetimer-backend/services"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRoleCommunication(t *testing.T) {
	// Setup test database connection
	db := setupTestDB(t)
	defer db.Close()

	// Setup services
	emailService := &services.EmailService{}
	notificationService := services.NewNotificationService(db, emailService)
	roleService := services.NewRoleCommunicationService(db, notificationService)

	t.Run("AdminApproveCreator", func(t *testing.T) {
		// Create test users
		adminID := createTestUser(t, db, "admin")
		creatorID := createTestUser(t, db, "creator")

		// Test approval
		err := roleService.ApproveCreator(adminID, creatorID)
		assert.NoError(t, err)

		// Verify creator is approved
		var isVerified bool
		err = db.QueryRow(context.Background(),
			"SELECT is_verified FROM users WHERE id = $1", creatorID).Scan(&isVerified)
		require.NoError(t, err)
		assert.True(t, isVerified)
	})

	t.Run("AdminApproveFillerKYC", func(t *testing.T) {
		adminID := createTestUser(t, db, "admin")
		fillerID := createTestUser(t, db, "filler")

		err := roleService.ApproveFillerKYC(adminID, fillerID)
		assert.NoError(t, err)

		var kycStatus string
		err = db.QueryRow(context.Background(),
			"SELECT kyc_status FROM users WHERE id = $1", fillerID).Scan(&kycStatus)
		require.NoError(t, err)
		assert.Equal(t, "approved", kycStatus)
	})

	t.Run("SuperAdminCreateAdmin", func(t *testing.T) {
		superAdminID := createTestUser(t, db, "super_admin")

		newAdmin := models.User{
			ID:           uuid.New(),
			Email:        "newadmin@test.com",
			Name:         "New Admin",
			PasswordHash: "hashedpassword",
		}

		err := roleService.CreateAdmin(superAdminID, newAdmin)
		assert.NoError(t, err)

		// Verify admin was created
		var role string
		err = db.QueryRow(context.Background(),
			"SELECT role FROM users WHERE id = $1", newAdmin.ID).Scan(&role)
		require.NoError(t, err)
		assert.Equal(t, "admin", role)
	})

	t.Run("RoleHierarchyCheck", func(t *testing.T) {
		superAdminID := createTestUser(t, db, "super_admin")
		adminID := createTestUser(t, db, "admin")
		creatorID := createTestUser(t, db, "creator")

		// Super admin can affect admin
		canDo, err := roleService.CanUserPerformAction(superAdminID, "suspend", adminID)
		assert.NoError(t, err)
		assert.True(t, canDo)

		// Admin cannot affect super admin
		canDo, err = roleService.CanUserPerformAction(adminID, "suspend", superAdminID)
		assert.NoError(t, err)
		assert.False(t, canDo)

		// Creator cannot affect admin
		canDo, err = roleService.CanUserPerformAction(creatorID, "suspend", adminID)
		assert.NoError(t, err)
		assert.False(t, canDo)
	})
}

func TestSurveyWorkflow(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	emailService := &services.EmailService{}
	notificationService := services.NewNotificationService(db, emailService)
	roleService := services.NewRoleCommunicationService(db, notificationService)

	t.Run("CompleteSurveyWorkflow", func(t *testing.T) {
		// Create users
		creatorID := createTestUser(t, db, "creator")
		adminID := createTestUser(t, db, "admin")
		fillerID := createTestUser(t, db, "filler")

		// Create survey
		surveyID := createTestSurvey(t, db, creatorID)

		// Admin approves survey
		err := roleService.ApproveSurvey(adminID, surveyID)
		assert.NoError(t, err)

		// Verify survey is approved
		var status string
		err = db.QueryRow(context.Background(),
			"SELECT status FROM surveys WHERE id = $1", surveyID).Scan(&status)
		require.NoError(t, err)
		assert.Equal(t, "approved", status)

		// Filler completes survey
		err = roleService.CompleteSurveyResponse(fillerID, surveyID)
		assert.NoError(t, err)

		// Verify earning was created
		var earningAmount int
		err = db.QueryRow(context.Background(),
			"SELECT amount FROM earnings WHERE user_id = $1 AND source_id = $2",
			fillerID, surveyID).Scan(&earningAmount)
		require.NoError(t, err)
		assert.Greater(t, earningAmount, 0)
	})
}

// Helper functions
func setupTestDB(t *testing.T) *pgxpool.Pool {
	// Use test database URL or mock
	dbURL := "postgres://test:test@localhost/onetimer_test"

	// Parse config and apply same fixes as production
	poolConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		t.Skip("Failed to parse database URL")
	}

	// Apply same connection pool settings as production
	poolConfig.MaxConns = 10 // Smaller pool for tests
	poolConfig.MinConns = 2
	poolConfig.MaxConnLifetime = 10 * time.Minute
	poolConfig.MaxConnIdleTime = 2 * time.Minute
	poolConfig.HealthCheckPeriod = 1 * time.Minute

	// CRITICAL: Use simple protocol to prevent prepared statement conflicts
	poolConfig.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	db, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		t.Skip("Test database not available")
	}

	// Setup test schema
	setupTestSchema(t, db)
	return db
}

func setupTestSchema(t *testing.T, db *pgxpool.Pool) {
	schema := `
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY,
			email VARCHAR(255) UNIQUE,
			name VARCHAR(255),
			role VARCHAR(50),
			password_hash VARCHAR(255),
			is_verified BOOLEAN DEFAULT FALSE,
			is_active BOOLEAN DEFAULT TRUE,
			kyc_status VARCHAR(50) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);
		
		CREATE TABLE IF NOT EXISTS surveys (
			id UUID PRIMARY KEY,
			creator_id UUID REFERENCES users(id),
			title VARCHAR(255),
			description TEXT,
			reward INTEGER DEFAULT 500,
			status VARCHAR(50) DEFAULT 'draft',
			current_responses INTEGER DEFAULT 0,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);
		
		CREATE TABLE IF NOT EXISTS earnings (
			id UUID PRIMARY KEY,
			user_id UUID REFERENCES users(id),
			amount INTEGER,
			source VARCHAR(100),
			source_id UUID,
			status VARCHAR(50) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT NOW()
		);
		
		CREATE TABLE IF NOT EXISTS audit_logs (
			id UUID PRIMARY KEY,
			admin_id UUID REFERENCES users(id),
			action VARCHAR(100),
			target_type VARCHAR(50),
			target_id UUID,
			details JSONB,
			created_at TIMESTAMP DEFAULT NOW()
		);
		
		CREATE TABLE IF NOT EXISTS notifications (
			id UUID PRIMARY KEY,
			user_id UUID REFERENCES users(id),
			type VARCHAR(50),
			title VARCHAR(255),
			message TEXT,
			data TEXT,
			read BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`

	_, err := db.Exec(context.Background(), schema)
	require.NoError(t, err)
}

func createTestUser(t *testing.T, db *pgxpool.Pool, role string) uuid.UUID {
	userID := uuid.New()
	_, err := db.Exec(context.Background(),
		`INSERT INTO users (id, email, name, role, password_hash, created_at)
		 VALUES ($1, $2, $3, $4, 'test_hash', NOW())`,
		userID, userID.String()+"@test.com", "Test User", role)
	require.NoError(t, err)
	return userID
}

func createTestSurvey(t *testing.T, db *pgxpool.Pool, creatorID uuid.UUID) uuid.UUID {
	surveyID := uuid.New()
	_, err := db.Exec(context.Background(),
		`INSERT INTO surveys (id, creator_id, title, description, reward, status, created_at)
		 VALUES ($1, $2, 'Test Survey', 'Test Description', 500, 'pending', NOW())`,
		surveyID, creatorID)
	require.NoError(t, err)
	return surveyID
}
