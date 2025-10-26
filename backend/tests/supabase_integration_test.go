package tests

import (
	"context"
	"onetimer-backend/config"
	"onetimer-backend/database"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSupabaseIntegration(t *testing.T) {
	cfg := config.Load()
	if cfg.DatabaseURL == "" {
		t.Skip("DATABASE_URL not set, skipping Supabase integration tests")
	}

	db, err := database.NewSupabaseConnection(cfg)
	require.NoError(t, err)
	defer db.Close()

	t.Run("DatabaseConnection", func(t *testing.T) {
		err := db.Ping(context.Background())
		assert.NoError(t, err)
	})

	t.Run("SchemaInitialization", func(t *testing.T) {
		err := db.InitSchema()
		assert.NoError(t, err)
	})

	t.Run("UserCRUD", func(t *testing.T) {
		// Create user
		userID := uuid.New()
		_, err := db.Exec(context.Background(),
			`INSERT INTO users (id, email, name, role, password_hash) 
			 VALUES ($1, $2, $3, $4, $5)`,
			userID, "test@example.com", "Test User", "filler", "hashed_password")
		assert.NoError(t, err)

		// Read user
		var email, name, role string
		err = db.QueryRow(context.Background(),
			`SELECT email, name, role FROM users WHERE id = $1`, userID).
			Scan(&email, &name, &role)
		assert.NoError(t, err)
		assert.Equal(t, "test@example.com", email)
		assert.Equal(t, "Test User", name)
		assert.Equal(t, "filler", role)

		// Update user
		_, err = db.Exec(context.Background(),
			`UPDATE users SET name = $1 WHERE id = $2`, "Updated User", userID)
		assert.NoError(t, err)

		// Verify update
		err = db.QueryRow(context.Background(),
			`SELECT name FROM users WHERE id = $1`, userID).Scan(&name)
		assert.NoError(t, err)
		assert.Equal(t, "Updated User", name)

		// Delete user
		_, err = db.Exec(context.Background(),
			`DELETE FROM users WHERE id = $1`, userID)
		assert.NoError(t, err)
	})

	t.Run("SurveyWorkflow", func(t *testing.T) {
		// Create creator
		creatorID := uuid.New()
		_, err := db.Exec(context.Background(),
			`INSERT INTO users (id, email, name, role, password_hash) 
			 VALUES ($1, $2, $3, $4, $5)`,
			creatorID, "creator@example.com", "Creator", "creator", "hash")
		require.NoError(t, err)

		// Create survey
		surveyID := uuid.New()
		_, err = db.Exec(context.Background(),
			`INSERT INTO surveys (id, creator_id, title, description, reward, status) 
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			surveyID, creatorID, "Test Survey", "Description", 500, "draft")
		assert.NoError(t, err)

		// Update survey status
		_, err = db.Exec(context.Background(),
			`UPDATE surveys SET status = $1 WHERE id = $2`, "approved", surveyID)
		assert.NoError(t, err)

		// Verify status change
		var status string
		err = db.QueryRow(context.Background(),
			`SELECT status FROM surveys WHERE id = $1`, surveyID).Scan(&status)
		assert.NoError(t, err)
		assert.Equal(t, "approved", status)

		// Cleanup
		db.Exec(context.Background(), `DELETE FROM surveys WHERE id = $1`, surveyID)
		db.Exec(context.Background(), `DELETE FROM users WHERE id = $1`, creatorID)
	})

	t.Run("EarningsTracking", func(t *testing.T) {
		// Create filler
		fillerID := uuid.New()
		_, err := db.Exec(context.Background(),
			`INSERT INTO users (id, email, name, role, password_hash) 
			 VALUES ($1, $2, $3, $4, $5)`,
			fillerID, "filler@example.com", "Filler", "filler", "hash")
		require.NoError(t, err)

		// Add earning
		earningID := uuid.New()
		_, err = db.Exec(context.Background(),
			`INSERT INTO earnings (id, user_id, amount, source, status) 
			 VALUES ($1, $2, $3, $4, $5)`,
			earningID, fillerID, 500, "survey_completion", "completed")
		assert.NoError(t, err)

		// Calculate total earnings
		var totalEarnings int
		err = db.QueryRow(context.Background(),
			`SELECT COALESCE(SUM(amount), 0) FROM earnings 
			 WHERE user_id = $1 AND status = 'completed'`, fillerID).Scan(&totalEarnings)
		assert.NoError(t, err)
		assert.Equal(t, 500, totalEarnings)

		// Cleanup
		db.Exec(context.Background(), `DELETE FROM earnings WHERE id = $1`, earningID)
		db.Exec(context.Background(), `DELETE FROM users WHERE id = $1`, fillerID)
	})

	t.Run("AuditLogging", func(t *testing.T) {
		// Create admin
		adminID := uuid.New()
		_, err := db.Exec(context.Background(),
			`INSERT INTO users (id, email, name, role, password_hash) 
			 VALUES ($1, $2, $3, $4, $5)`,
			adminID, "admin@example.com", "Admin", "admin", "hash")
		require.NoError(t, err)

		// Create audit log
		logID := uuid.New()
		targetID := uuid.New()
		_, err = db.Exec(context.Background(),
			`INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details) 
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			logID, adminID, "user_approved", "user", targetID, `{"reason": "KYC verified"}`)
		assert.NoError(t, err)

		// Verify audit log
		var action, targetType string
		var createdAt time.Time
		err = db.QueryRow(context.Background(),
			`SELECT action, target_type, created_at FROM audit_logs WHERE id = $1`, logID).
			Scan(&action, &targetType, &createdAt)
		assert.NoError(t, err)
		assert.Equal(t, "user_approved", action)
		assert.Equal(t, "user", targetType)
		assert.WithinDuration(t, time.Now(), createdAt, time.Minute)

		// Cleanup
		db.Exec(context.Background(), `DELETE FROM audit_logs WHERE id = $1`, logID)
		db.Exec(context.Background(), `DELETE FROM users WHERE id = $1`, adminID)
	})

	t.Run("ReferralSystem", func(t *testing.T) {
		// Create referrer and referred users
		referrerID := uuid.New()
		referredID := uuid.New()

		_, err := db.Exec(context.Background(),
			`INSERT INTO users (id, email, name, role, password_hash) VALUES 
			 ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
			referrerID, "referrer@example.com", "Referrer", "filler", "hash",
			referredID, "referred@example.com", "Referred", "filler", "hash")
		require.NoError(t, err)

		// Create referral
		referralID := uuid.New()
		_, err = db.Exec(context.Background(),
			`INSERT INTO referrals (id, referrer_id, referred_id, referral_code, bonus_amount, status) 
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			referralID, referrerID, referredID, "REF123", 1000, "completed")
		assert.NoError(t, err)

		// Verify referral
		var bonusAmount int
		var status string
		err = db.QueryRow(context.Background(),
			`SELECT bonus_amount, status FROM referrals WHERE id = $1`, referralID).
			Scan(&bonusAmount, &status)
		assert.NoError(t, err)
		assert.Equal(t, 1000, bonusAmount)
		assert.Equal(t, "completed", status)

		// Cleanup
		db.Exec(context.Background(), `DELETE FROM referrals WHERE id = $1`, referralID)
		db.Exec(context.Background(), `DELETE FROM users WHERE id IN ($1, $2)`, referrerID, referredID)
	})
}