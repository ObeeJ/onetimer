package dto

type RegisterUserRequest struct {
	FirstName string `json:"first_name" validate:"required,min=2,max=50"`
	LastName  string `json:"last_name" validate:"required,min=2,max=50"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8,max=128"`
	Phone     string `json:"phone,omitempty" validate:"omitempty,min=10,max=20"`
	Role      string `json:"role" validate:"required,oneof=filler creator admin super_admin"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UpdateProfileRequest struct {
	Name              *string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Phone             *string `json:"phone,omitempty" validate:"omitempty,min=10,max=20"`
	DateOfBirth       *string `json:"date_of_birth,omitempty"`
	Gender            *string `json:"gender,omitempty" validate:"omitempty,oneof=male female other prefer_not_to_say"`
	Location          *string `json:"location,omitempty" validate:"omitempty,max=255"`
	ProfilePictureURL *string `json:"profile_picture_url,omitempty" validate:"omitempty,url"`
}

type KYCUploadRequest struct {
	NIN string `json:"nin" validate:"required,len=11,numeric"`
	BVN string `json:"bvn,omitempty" validate:"omitempty,len=11,numeric"`
}

type CreateAdminRequest struct {
	FirstName   string   `json:"first_name" validate:"required,min=2,max=50"`
	LastName    string   `json:"last_name" validate:"required,min=2,max=50"`
	Email       string   `json:"email" validate:"required,email"`
	Password    string   `json:"password" validate:"required,min=8,max=128"`
	Department  *string  `json:"department,omitempty" validate:"omitempty,max=100"`
	Permissions []string `json:"permissions,omitempty"`
}

type UserResponse struct {
	ID                string   `json:"id"`
	Name              string   `json:"name"`
	Email             string   `json:"email"`
	Phone             *string  `json:"phone"`
	DateOfBirth       *string  `json:"date_of_birth"`
	Gender            *string  `json:"gender"`
	Location          *string  `json:"location"`
	Role              string   `json:"role"`
	IsVerified        bool     `json:"is_verified"`
	IsActive          bool     `json:"is_active"`
	KycStatus         string   `json:"kyc_status"`
	ProfilePictureURL *string  `json:"profile_picture_url"`
	Department        *string  `json:"department,omitempty"`        // For admin users
	Permissions       []string `json:"permissions,omitempty"`       // For admin users
	CreatedAt         string   `json:"created_at"`
	UpdatedAt         string   `json:"updated_at"`
}
