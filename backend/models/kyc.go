package models

import (
	"time"

	"github.com/google/uuid"
)

type KYCVerification struct {
	ID          uuid.UUID  `json:"id"`
	UserID      uuid.UUID  `json:"user_id"`
	NIN         string     `json:"nin"`
	Status      string     `json:"status"`
	FirstName   string     `json:"first_name"`
	LastName    string     `json:"last_name"`
	Phone       string     `json:"phone"`
	DateOfBirth string     `json:"date_of_birth"`
	Gender      string     `json:"gender"`
	VerifiedAt  *time.Time `json:"verified_at"`
	CreatedAt   time.Time  `json.:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
