package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Question struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	SurveyID    uuid.UUID       `json:"survey_id" db:"survey_id"`
	Type        string          `json:"type" db:"type"`
	Title       string          `json:"title" db:"title"`
	Description *string         `json:"description" db:"description"`
	Required    bool            `json:"required" db:"required"`
	Options     json.RawMessage `json:"options" db:"options"`
	OrderIndex  int             `json:"order_index" db:"order_index"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
}
