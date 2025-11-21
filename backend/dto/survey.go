package dto

import "github.com/google/uuid"

type CreateSurveyRequest struct {
	Title             string `json:"title" validate:"required,min=3,max=255"`
	Description       string `json:"description" validate:"required,min=10,max=1000"`
	Category          string `json:"category" validate:"required,oneof=market_research customer_experience product_feedback academic_research other"`
	RewardAmount      int    `json:"reward_amount" validate:"required,min=100,max=10000"`
	EstimatedDuration int    `json:"estimated_duration" validate:"required,min=1,max=60"`
	TargetResponses   int    `json:"target_responses" validate:"required,min=1,max=10000"`
}

type UpdateSurveyRequest struct {
	Title             *string `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Description       *string `json:"description,omitempty" validate:"omitempty,min=10,max=1000"`
	Category          *string `json:"category,omitempty" validate:"omitempty,oneof=market_research customer_experience product_feedback academic_research other"`
	RewardAmount      *int    `json:"reward_amount,omitempty" validate:"omitempty,min=100,max=10000"`
	EstimatedDuration *int    `json:"estimated_duration,omitempty" validate:"omitempty,min=1,max=60"`
	TargetResponses   *int    `json:"target_responses,omitempty" validate:"omitempty,min=1,max=10000"`
}

type SurveyResponse struct {
	ID                string     `json:"id"`
	CreatorID         string     `json:"creator_id"`
	Title             string     `json:"title"`
	Description       string     `json:"description"`
	Category          string     `json:"category"`
	RewardAmount      int        `json:"reward_amount"`
	EstimatedDuration int        `json:"estimated_duration"`
	TargetResponses   int        `json:"target_responses"`
	CurrentResponses  int        `json:"current_responses"`
	Status            string     `json:"status"`
	CreatedAt         string     `json:"created_at"`
	UpdatedAt         string     `json:"updated_at"`
	ExpiresAt         *string    `json:"expires_at"`
}

type CreateQuestionRequest struct {
	SurveyID uuid.UUID `json:"survey_id" validate:"required"`
	Type     string    `json:"type" validate:"required,oneof=multiple_choice open_ended rating media_upload"`
	Title    string    `json:"title" validate:"required,min=3,max=500"`
	Required bool      `json:"required"`
	OrderNum int       `json:"order_num" validate:"required,min=1"`
	Options  []string  `json:"options,omitempty"`
}
