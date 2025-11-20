package models

import (
	"time"

	"github.com/google/uuid"
)

type Earning struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	UserID      uuid.UUID  `json:"user_id" db:"user_id"`
	SurveyID    *uuid.UUID `json:"survey_id" db:"survey_id"`
	Amount      int        `json:"amount" db:"amount"`
	Type        string     `json:"type" db:"type"`
	Status      string     `json:"status" db:"status"`
	Description *string    `json:"description" db:"description"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
}
