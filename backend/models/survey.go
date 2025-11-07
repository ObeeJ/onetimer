package models

import (
	"time"

	"github.com/google/uuid"
)

type Survey struct {
	ID               uuid.UUID `json:"id" db:"id"`
	CreatorID        uuid.UUID `json:"creator_id" db:"creator_id"`
	Title            string    `json:"title" db:"title"`
	Description      string    `json:"description" db:"description"`
	Category         string    `json:"category" db:"category"`
	TargetAudience   *string   `json:"target_audience" db:"target_audience"`
	EstimatedTime    int       `json:"estimated_time" db:"estimated_time"`
	Reward           int       `json:"reward" db:"reward"`
	Status           string    `json:"status" db:"status"`
	MaxResponses     int       `json:"max_responses" db:"max_responses"`
	CurrentResponses int       `json:"current_responses" db:"current_responses"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type Question struct {
	ID          uuid.UUID `json:"id" db:"id"`
	SurveyID    uuid.UUID `json:"survey_id" db:"survey_id"`
	Type        string    `json:"type" db:"type"` // single, multi, text, rating, matrix
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description,omitempty" db:"description"`
	Required    bool      `json:"required" db:"required"`
	Options     []string  `json:"options,omitempty" db:"options"`
	Scale       int       `json:"scale,omitempty" db:"scale"` // for rating questions
	Rows        []string  `json:"rows,omitempty" db:"rows"`   // for matrix questions
	Cols        []string  `json:"cols,omitempty" db:"cols"`   // for matrix questions
	Order       int       `json:"order" db:"order"`
}

type Response struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	SurveyID    uuid.UUID  `json:"survey_id" db:"survey_id"`
	FillerID    uuid.UUID  `json:"filler_id" db:"filler_id"`
	Answers     []Answer   `json:"answers"`
	Status      string     `json:"status" db:"status"`
	StartedAt   time.Time  `json:"started_at" db:"started_at"`
	CompletedAt *time.Time `json:"completed_at" db:"completed_at"`
}

type Answer struct {
	QuestionID uuid.UUID `json:"question_id"`
	Value      string    `json:"value"`
}
