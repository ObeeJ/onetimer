package repository

import (
	"context"
	"onetimer-backend/database"
	"onetimer-backend/models"
	"time"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
)

type NotificationRepository struct {
	db *database.SupabaseDB
}

func NewNotificationRepository(db *database.SupabaseDB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) CreateNotification(notification *models.Notification) error {
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO notifications (id, user_id, title, message, read_at, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
		notification.ID, notification.UserID, notification.Title, notification.Message, notification.ReadAt, notification.CreatedAt)
	return err
}

func (r *NotificationRepository) GetNotifications(userID uuid.UUID) ([]models.Notification, error) {
	var notifications []models.Notification
	err := pgxscan.Select(context.Background(), r.db, &notifications, "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", userID)
	if err != nil {
		return nil, err
	}
	return notifications, nil
}

func (r *NotificationRepository) MarkNotificationRead(id uuid.UUID) error {
	_, err := r.db.Exec(context.Background(), "UPDATE notifications SET read_at = $1 WHERE id = $2", time.Now(), id)
	return err
}
