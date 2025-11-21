package models

import (
	"time"
	"encoding/json"

	"github.com/google/uuid"
)

type KYCData struct {
	NIN string `json:"nin,omitempty"`
	BVN string `json:"bvn,omitempty"`
}

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
	KycData           *KYCData   `json:"kyc_data" db:"kyc_data"`
	ProfilePictureURL *string    `json:"profile_picture_url" db:"profile_picture_url"`
	// Admin-specific fields
	Department        *string    `json:"department,omitempty" db:"department"`
	Permissions       []string   `json:"permissions,omitempty" db:"permissions"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}

// IsAdmin checks if user is admin or super_admin
func (u *User) IsAdmin() bool {
	return u.Role == "admin" || u.Role == "super_admin"
}

// IsSuperAdmin checks if user is super_admin
func (u *User) IsSuperAdmin() bool {
	return u.Role == "super_admin"
}

// HasPermission checks if admin user has specific permission
func (u *User) HasPermission(permission string) bool {
	if !u.IsAdmin() {
		return false
	}
	
	// Super admin has all permissions
	if u.IsSuperAdmin() {
		return true
	}
	
	for _, perm := range u.Permissions {
		if perm == permission {
			return true
		}
	}
	return false
}

// Custom JSON marshaling for KycData and Permissions
func (u *User) MarshalJSON() ([]byte, error) {
	type Alias User
	aux := &struct {
		*Alias
		KycData     json.RawMessage `json:"kyc_data,omitempty"`
		Permissions json.RawMessage `json:"permissions,omitempty"`
	}{
		Alias: (*Alias)(u),
	}
	
	if u.KycData != nil {
		kycBytes, err := json.Marshal(u.KycData)
		if err != nil {
			return nil, err
		}
		aux.KycData = kycBytes
	}
	
	if u.Permissions != nil {
		permBytes, err := json.Marshal(u.Permissions)
		if err != nil {
			return nil, err
		}
		aux.Permissions = permBytes
	}
	
	return json.Marshal(aux)
}
