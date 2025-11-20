package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Response struct {
	ID           uuid.UUID       `json:"id" db:"id"`
	SurveyID     uuid.UUID       `json:"survey_id" db:"survey_id"`
	FillerID     uuid.UUID       `json:"filler_id" db:"filler_id"`
	Answers      json.RawMessage `json:"answers" db:"answers"`
	Status       string          `json:"status" db:"status"`
	StartedAt    time.Time       `json:"started_at" db:"started_at"`
	CompletedAt  *time.Time      `json:"completed_at" db:"completed_at"`
	QualityScore int             `json:"quality_score" db:"quality_score"`
}
