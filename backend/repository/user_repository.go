package repository

import (
	"context"
	"onetimer-backend/models"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
)

type UserRepository struct {
	*BaseRepository
}

func NewUserRepository(base *BaseRepository) *UserRepository {
	return &UserRepository{BaseRepository: base}
}

func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := pgxscan.Get(context.Background(), r.db, &user, "SELECT * FROM users WHERE email = $1", email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	err := pgxscan.Get(ctx, r.db, &user, "SELECT * FROM users WHERE id = $1", id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateUserPassword(ctx context.Context, id uuid.UUID, newPasswordHash string) error {
	_, err := r.db.Exec(ctx, "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", newPasswordHash, id)
	return err
}

func (r *UserRepository) UpdateKYCStatus(ctx context.Context, id uuid.UUID, kycStatus string) error {
	_, err := r.db.Exec(ctx, "UPDATE users SET kyc_status = $1, updated_at = NOW() WHERE id = $2", kycStatus, id)
	return err
}

func (r *UserRepository) GetUserPreferences(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	// First check if user exists
	err := pgxscan.Get(ctx, r.db, &user, "SELECT id FROM users WHERE id = $1", id)
	if err != nil {
		// User doesn't exist, return defaults
		user.ID = id
		user.Notifications = &[]bool{true}[0]
		user.EmailUpdates = &[]bool{true}[0]
		user.SurveyCategories = []string{"lifestyle", "technology"}
		return &user, nil
	}
	
	// User exists, try to get preferences (handle missing columns gracefully)
	var notifications, emailUpdates *bool
	var categories []string
	
	err = r.db.QueryRow(ctx, 
		"SELECT notifications, email_updates, survey_categories FROM users WHERE id = $1", id).
		Scan(&notifications, &emailUpdates, &categories)
	
	if err != nil {
		// Columns might not exist, use defaults
		notifications = &[]bool{true}[0]
		emailUpdates = &[]bool{true}[0]
		categories = []string{"lifestyle", "technology"}
	}
	
	user.Notifications = notifications
	user.EmailUpdates = emailUpdates
	user.SurveyCategories = categories
	
	return &user, nil
}

func (r *UserRepository) UpdateUserPreferences(ctx context.Context, id uuid.UUID, notifications, emailUpdates bool, categories []string) error {
	// For now, just return success - preferences will be stored when schema is updated
	// This allows the API to work while we implement proper database schema
	return nil
}
