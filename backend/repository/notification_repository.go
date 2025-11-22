package repository

import (
	"context"
	"onetimer-backend/models"
	"time"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
)

type NotificationRepository struct {
	*BaseRepository
}

func NewNotificationRepository(base *BaseRepository) *NotificationRepository {
	return &NotificationRepository{BaseRepository: base}
}

func (r *NotificationRepository) CreateNotification(ctx context.Context, notification *models.Notification) error {
	return r.Exec(ctx,
		"INSERT INTO notifications (id, user_id, title, message, read_at, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
		notification.ID, notification.UserID, notification.Title, notification.Message, notification.ReadAt, notification.CreatedAt)
}

func (r *NotificationRepository) GetNotifications(ctx context.Context, userID uuid.UUID) ([]models.Notification, error) {
	var notifications []models.Notification
	err := pgxscan.Select(ctx, r.db, &notifications, "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", userID)
	if err != nil {
		return nil, err
	}
	return notifications, nil
}

func (r *NotificationRepository) MarkNotificationRead(ctx context.Context, id uuid.UUID) error {
	return r.Exec(ctx, "UPDATE notifications SET read_at = $1 WHERE id = $2", time.Now(), id)
}
