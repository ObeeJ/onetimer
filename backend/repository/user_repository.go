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
