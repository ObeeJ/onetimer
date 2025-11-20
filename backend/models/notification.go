package models

import (
	"time"

	"github.com/google/uuid"
)

type Notification struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	UserID    uuid.UUID  `json:"user_id" db:"user_id"`
	Title     string     `json:"title" db:"title"`
	Message   string     `json:"message" db:"message"`
	ReadAt    *time.Time `json:"read_at" db:"read_at"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}
