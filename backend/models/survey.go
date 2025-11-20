package models

import (
	"time"

	"github.com/google/uuid"
)

type Survey struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	CreatorID         uuid.UUID  `json:"creator_id" db:"creator_id"`
	Title             string     `json:"title" db:"title"`
	Description       string     `json:"description" db:"description"`
	Category          *string    `json:"category" db:"category"`
	RewardAmount      int        `json:"reward_amount" db:"reward_amount"`
	EstimatedDuration int        `json:"estimated_duration" db:"estimated_duration"`
	TargetResponses   int        `json:"target_responses" db:"target_responses"`
	CurrentResponses  int        `json:"current_responses" db:"current_responses"`
	Status            string     `json:"status" db:"status"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
	ExpiresAt         *time.Time `json:"expires_at" db:"expires_at"`
}
