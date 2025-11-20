package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	Email             string     `json:"email" db:"email"`
	Name              string     `json:"name" db:"name"`
	Role              string     `json:"role" db:"role"`
	PasswordHash      string     `json:"-" db:"password_hash"`
	Phone             *string    `json:"phone" db:"phone"`
	DateOfBirth       *time.Time `json:"date_of_birth" db:"date_of_birth"`
	Gender            *string    `json:"gender" db:"gender"`
	Location          *string    `json:"location" db:"location"`
	IsVerified        bool       `json:"is_verified" db:"is_verified"`
	IsActive          bool       `json:"is_active" db:"is_active"`
	KycStatus         string     `json:"kyc_status" db:"kyc_status"`
	ProfilePictureURL *string    `json:"profile_picture_url" db:"profile_picture_url"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}
