package models

import (
	"time"

	"github.com/google/uuid"
)

type Credit struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      uuid.UUID `json:"user_id" db:"user_id"`
	Amount      int       `json:"amount" db:"amount"`
	Type        string    `json:"type" db:"type"`
	Description *string   `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
