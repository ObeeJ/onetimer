package services

import (
	"context"
	"fmt"
	"onetimer-backend/models"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoleCommunicationService struct {
	db           *pgxpool.Pool
	notification *NotificationService
}

func NewRoleCommunicationService(db *pgxpool.Pool, notification *NotificationService) *RoleCommunicationService {
	return &RoleCommunicationService{
		db:           db,
		notification: notification,
	}
}

// Admin Actions on Creator
func (r *RoleCommunicationService) ApproveCreator(adminID, creatorID uuid.UUID) error {
	// Update creator status
	_, err := r.db.Exec(context.Background(),
		`UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1 AND role = 'creator'`,
		creatorID)
	if err != nil {
		return err
	}

	// Log audit
	r.logAudit(adminID, "creator_approved", "user", creatorID, map[string]interface{}{
		"action": "Creator account approved",
	})

	// Notify creator
	return r.notification.NotifyCreatorSurveyApproved(creatorID, "Account Approved")
}

func (r *RoleCommunicationService) ApproveSurvey(adminID, surveyID uuid.UUID) error {
	// Get survey details
	var creatorID uuid.UUID
	var title string
	err := r.db.QueryRow(context.Background(),
		`SELECT creator_id, title FROM surveys WHERE id = $1`, surveyID).Scan(&creatorID, &title)
	if err != nil {
		return err
	}

	// Update survey status
	_, err = r.db.Exec(context.Background(),
		`UPDATE surveys SET status = 'approved', updated_at = NOW() WHERE id = $1`, surveyID)
	if err != nil {
		return err
	}

	// Log audit
	r.logAudit(adminID, "survey_approved", "survey", surveyID, map[string]interface{}{
		"survey_title": title,
		"creator_id":   creatorID,
	})

	// Notify creator
	return r.notification.NotifyCreatorSurveyApproved(creatorID, title)
}

// Admin Actions on Filler
func (r *RoleCommunicationService) ApproveFillerKYC(adminID, fillerID uuid.UUID) error {
	// Update KYC status
	_, err := r.db.Exec(context.Background(),
		`UPDATE users SET kyc_status = 'approved', is_verified = true, updated_at = NOW() 
		 WHERE id = $1 AND role = 'filler'`, fillerID)
	if err != nil {
		return err
	}

	// Log audit
	r.logAudit(adminID, "kyc_approved", "user", fillerID, map[string]interface{}{
		"action": "KYC documents approved",
	})

	// Notify filler
	return r.notification.NotifyFillerKYCApproved(fillerID)
}

func (r *RoleCommunicationService) ProcessWithdrawal(adminID, withdrawalID uuid.UUID) error {
	// Get withdrawal details
	var userID uuid.UUID
	var amount int
	err := r.db.QueryRow(context.Background(),
		`SELECT user_id, amount FROM withdrawals WHERE id = $1`, withdrawalID).Scan(&userID, &amount)
	if err != nil {
		return err
	}

	// Update withdrawal status
	_, err = r.db.Exec(context.Background(),
		`UPDATE withdrawals SET status = 'completed', processed_at = NOW() WHERE id = $1`, withdrawalID)
	if err != nil {
		return err
	}

	// Log audit
	r.logAudit(adminID, "withdrawal_processed", "withdrawal", withdrawalID, map[string]interface{}{
		"amount":  amount,
		"user_id": userID,
	})

	return nil
}

// Creator-Filler Interaction
func (r *RoleCommunicationService) CompleteSurveyResponse(fillerID, surveyID uuid.UUID) error {
	// Get survey reward
	var reward int
	var creatorID uuid.UUID
	err := r.db.QueryRow(context.Background(),
		`SELECT reward, creator_id FROM surveys WHERE id = $1`, surveyID).Scan(&reward, &creatorID)
	if err != nil {
		return err
	}

	// Create earning record
	earningID := uuid.New()
	_, err = r.db.Exec(context.Background(),
		`INSERT INTO earnings (id, user_id, amount, source, source_id, status, created_at)
		 VALUES ($1, $2, $3, 'survey_completion', $4, 'pending', NOW())`,
		earningID, fillerID, reward, surveyID)
	if err != nil {
		return err
	}

	// Update survey response count
	_, err = r.db.Exec(context.Background(),
		`UPDATE surveys SET current_responses = current_responses + 1 WHERE id = $1`, surveyID)

	return err
}

// Super Admin Actions
func (r *RoleCommunicationService) CreateAdmin(superAdminID uuid.UUID, adminData models.User) error {
	// Create admin user
	_, err := r.db.Exec(context.Background(),
		`INSERT INTO users (id, email, name, role, password_hash, is_verified, is_active, created_at)
		 VALUES ($1, $2, $3, 'admin', $4, true, true, NOW())`,
		adminData.ID, adminData.Email, adminData.Name, adminData.PasswordHash)
	if err != nil {
		return err
	}

	// Log audit
	r.logAudit(superAdminID, "admin_created", "user", adminData.ID, map[string]interface{}{
		"admin_email": adminData.Email,
		"admin_name":  adminData.Name,
	})

	return nil
}

func (r *RoleCommunicationService) SuspendAdmin(superAdminID, adminID uuid.UUID, reason string) error {
	// Suspend admin
	_, err := r.db.Exec(context.Background(),
		`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 AND role = 'admin'`,
		adminID)
	if err != nil {
		return err
	}

	// Log audit
	r.logAudit(superAdminID, "admin_suspended", "user", adminID, map[string]interface{}{
		"reason": reason,
	})

	return nil
}

// Audit logging helper
func (r *RoleCommunicationService) logAudit(adminID uuid.UUID, action, targetType string, targetID uuid.UUID, details map[string]interface{}) {
	detailsJSON := "{}"
	if len(details) > 0 {
		// Convert to JSON string (simplified)
		detailsJSON = fmt.Sprintf(`{"timestamp": "%s"}`, time.Now().Format(time.RFC3339))
	}

	r.db.Exec(context.Background(),
		`INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
		uuid.New(), adminID, action, targetType, targetID, detailsJSON)
}

// Get role hierarchy
func (r *RoleCommunicationService) CanUserPerformAction(userID uuid.UUID, action string, targetUserID uuid.UUID) (bool, error) {
	// Get user role
	var userRole string
	err := r.db.QueryRow(context.Background(),
		`SELECT role FROM users WHERE id = $1`, userID).Scan(&userRole)
	if err != nil {
		return false, err
	}

	// Get target user role if applicable
	var targetRole string
	if targetUserID != uuid.Nil {
		r.db.QueryRow(context.Background(),
			`SELECT role FROM users WHERE id = $1`, targetUserID).Scan(&targetRole)
	}

	// Role hierarchy check
	switch userRole {
	case "super_admin":
		return true, nil // Super admin can do anything
	case "admin":
		return targetRole != "super_admin", nil // Admin can't affect super admin
	case "creator", "filler":
		return action == "self_action", nil // Can only perform self actions
	}

	return false, nil
}