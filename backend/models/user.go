package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                  uuid.UUID  `json:"id" db:"id"`
	Email               string     `json:"email" db:"email"`
	Name                string     `json:"name" db:"name"`
	PasswordHash        string     `json:"-" db:"password_hash"`
	Role                string     `json:"role" db:"role"`
	IsVerified          bool       `json:"is_verified" db:"is_verified"`
	IsActive            bool       `json:"is_active" db:"is_active"`
	FailedLoginAttempts int        `json:"-" db:"failed_login_attempts"`
	LockedUntil         *time.Time `json:"-" db:"locked_until"`
	Phone               *string    `json:"phone" db:"phone"`
	DateOfBirth         *time.Time `json:"date_of_birth" db:"date_of_birth"`
	Gender              *string    `json:"gender" db:"gender"`
	Location            *string    `json:"location" db:"location"`
	Occupation          *string    `json:"occupation" db:"occupation"`
	KYCStatus           string     `json:"kyc_status" db:"kyc_status"`
	ProfilePictureURL   *string    `json:"profile_picture_url" db:"profile_picture_url"`
	ReferralCode        *string    `json:"referral_code" db:"referral_code"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at" db:"updated_at"`
}

type Earning struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	UserID    uuid.UUID  `json:"user_id" db:"user_id"`
	SurveyID  *uuid.UUID `json:"survey_id" db:"survey_id"`
	Amount    int        `json:"amount" db:"amount"`
	Type      string     `json:"type" db:"type"`
	Status    string     `json:"status" db:"status"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

type Withdrawal struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	UserID            uuid.UUID  `json:"user_id" db:"user_id"`
	Amount            int        `json:"amount" db:"amount"`
	BankCode          string     `json:"bank_code" db:"bank_code"`
	AccountNumber     string     `json:"account_number" db:"account_number"`
	AccountName       string     `json:"account_name" db:"account_name"`
	Status            string     `json:"status" db:"status"`
	PaystackReference *string    `json:"paystack_reference" db:"paystack_reference"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	ProcessedAt       *time.Time `json:"processed_at" db:"processed_at"`
}

type Credit struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Amount    int       `json:"amount" db:"amount"`
	Type      string    `json:"type" db:"type"`
	Reference *string   `json:"reference" db:"reference"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
type Referral struct {
	ID         uuid.UUID `json:"id" db:"id"`
	ReferrerID uuid.UUID `json:"referrer_id" db:"referrer_id"`
	ReferredID uuid.UUID `json:"referred_id" db:"referred_id"`
	Code       string    `json:"code" db:"code"`
	Status     string    `json:"status" db:"status"`
	Earnings   int       `json:"earnings" db:"earnings"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type KYCVerification struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	UserID      uuid.UUID  `json:"user_id" db:"user_id"`
	NIN         string     `json:"nin" db:"nin"`
	Status      string     `json:"status" db:"status"`
	FirstName   string     `json:"first_name" db:"first_name"`
	LastName    string     `json:"last_name" db:"last_name"`
	Phone       string     `json:"phone" db:"phone"`
	DateOfBirth string     `json:"date_of_birth" db:"date_of_birth"`
	Gender      string     `json:"gender" db:"gender"`
	VerifiedAt  *time.Time `json:"verified_at" db:"verified_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}
