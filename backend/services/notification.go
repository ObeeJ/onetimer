package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationService struct {
	db           *pgxpool.Pool
	emailService *EmailService
}

type Notification struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Data      string    `json:"data"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

func NewNotificationService(db *pgxpool.Pool, emailService *EmailService) *NotificationService {
	return &NotificationService{
		db:           db,
		emailService: emailService,
	}
}

// Role Communication Methods
func (n *NotificationService) NotifyCreatorSurveyApproved(creatorID uuid.UUID, surveyTitle string) error {
	notification := &Notification{
		ID:      uuid.New(),
		UserID:  creatorID,
		Type:    "survey_approved",
		Title:   "Survey Approved",
		Message: fmt.Sprintf("Your survey '%s' has been approved and is now live", surveyTitle),
		Data:    fmt.Sprintf(`{"survey_title": "%s"}`, surveyTitle),
	}
	return n.sendNotification(notification)
}

func (n *NotificationService) NotifyFillerKYCApproved(fillerID uuid.UUID) error {
	notification := &Notification{
		ID:      uuid.New(),
		UserID:  fillerID,
		Type:    "kyc_approved",
		Title:   "KYC Verified",
		Message: "Your identity has been verified. You can now earn from surveys!",
	}
	return n.sendNotification(notification)
}

func (n *NotificationService) NotifyAdminNewSurvey(adminID uuid.UUID, surveyTitle string, creatorName string) error {
	notification := &Notification{
		ID:      uuid.New(),
		UserID:  adminID,
		Type:    "new_survey_review",
		Title:   "New Survey for Review",
		Message: fmt.Sprintf("'%s' by %s needs approval", surveyTitle, creatorName),
		Data:    fmt.Sprintf(`{"survey_title": "%s", "creator": "%s"}`, surveyTitle, creatorName),
	}
	return n.sendNotification(notification)
}

func (n *NotificationService) NotifySuperAdminSuspiciousActivity(activity string, details map[string]interface{}) error {
	// Get all super admins
	superAdmins, err := n.getSuperAdmins()
	if err != nil {
		return err
	}

	data, _ := json.Marshal(details)
	for _, adminID := range superAdmins {
		notification := &Notification{
			ID:      uuid.New(),
			UserID:  adminID,
			Type:    "security_alert",
			Title:   "Security Alert",
			Message: fmt.Sprintf("Suspicious activity detected: %s", activity),
			Data:    string(data),
		}
		n.sendNotification(notification)
	}
	return nil
}

func (n *NotificationService) sendNotification(notification *Notification) error {
	// Save to database
	query := `
		INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
	`
	_, err := n.db.Exec(context.Background(), query,
		notification.ID, notification.UserID, notification.Type,
		notification.Title, notification.Message, notification.Data, false)
	
	if err != nil {
		log.Printf("Failed to save notification: %v", err)
		return err
	}

	// Send email notification
	go n.sendEmail(notification)
	return nil
}

func (n *NotificationService) sendEmail(notification *Notification) {
	// Get user email
	var email string
	query := `SELECT email FROM users WHERE id = $1`
	err := n.db.QueryRow(context.Background(), query, notification.UserID).Scan(&email)
	if err != nil {
		log.Printf("Failed to get user email: %v", err)
		return
	}

	// Send email
	n.emailService.sendEmail(email, notification.Title, notification.Message)
}

func (n *NotificationService) getSuperAdmins() ([]uuid.UUID, error) {
	query := `SELECT id FROM users WHERE role = 'super_admin' AND is_active = true`
	rows, err := n.db.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var admins []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err == nil {
			admins = append(admins, id)
		}
	}
	return admins, nil
}