package repository

import (
	"context"
	"database/sql"
	"fmt"
	"onetimer-backend/models"


	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	*BaseRepository
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{BaseRepository: NewBaseRepository(db)}
}

func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (id, email, name, role, password_hash, phone, is_verified, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	
	_, err := r.db.Exec(ctx, query,
		user.ID, user.Email, user.Name, user.Role, user.PasswordHash,
		user.Phone, user.IsVerified, user.IsActive, user.CreatedAt, user.UpdatedAt,
	)
	return err
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, email, name, role, password_hash, phone, date_of_birth, 
		       gender, location, is_verified, is_active, kyc_status, 
		       profile_picture_url, created_at, updated_at
		FROM users WHERE email = $1`
	
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.Name, &user.Role, &user.PasswordHash,
		&user.Phone, &user.DateOfBirth, &user.Gender, &user.Location,
		&user.IsVerified, &user.IsActive, &user.KYCStatus,
		&user.ProfilePictureURL, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return user, err
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, email, name, role, password_hash, phone, date_of_birth,
		       gender, location, is_verified, is_active, kyc_status,
		       profile_picture_url, created_at, updated_at
		FROM users WHERE id = $1`
	
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Name, &user.Role, &user.PasswordHash,
		&user.Phone, &user.DateOfBirth, &user.Gender, &user.Location,
		&user.IsVerified, &user.IsActive, &user.KYCStatus,
		&user.ProfilePictureURL, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return user, err
}

func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users SET name = $2, phone = $3, date_of_birth = $4, gender = $5,
		               location = $6, kyc_status = $7, profile_picture_url = $8,
		               updated_at = NOW()
		WHERE id = $1`
	
	_, err := r.db.Exec(ctx, query,
		user.ID, user.Name, user.Phone, user.DateOfBirth, user.Gender,
		user.Location, user.KYCStatus, user.ProfilePictureURL,
	)
	return err
}

func (r *UserRepository) UpdateKYCStatus(ctx context.Context, userID uuid.UUID, status string) error {
	query := `UPDATE users SET kyc_status = $2, updated_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, userID, status)
	return err
}

func (r *UserRepository) GetEarnings(ctx context.Context, userID uuid.UUID) (int, error) {
	var total int
	query := `SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE user_id = $1 AND status = 'completed'`
	err := r.db.QueryRow(ctx, query, userID).Scan(&total)
	return total, err
}

func (r *UserRepository) AddEarning(ctx context.Context, earning *models.Earning) error {
	query := `
		INSERT INTO earnings (id, user_id, survey_id, amount, type, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(ctx, query, earning.ID, earning.UserID, earning.SurveyID, earning.Amount, earning.Type, earning.Status, earning.CreatedAt)
	return err
}

func (r *UserRepository) CreateReferral(ctx context.Context, referral *models.Referral) error {
	query := `
		INSERT INTO referrals (id, referrer_id, referred_id, code, status, earnings, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(ctx, query, referral.ID, referral.ReferrerID, referral.ReferredID, referral.Code, referral.Status, referral.Earnings, referral.CreatedAt)
	return err
}

func (r *UserRepository) GetReferralStats(ctx context.Context, userID uuid.UUID) (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Get referral count and earnings
	query := `
		SELECT COUNT(*), COALESCE(SUM(earnings), 0)
		FROM referrals WHERE referrer_id = $1 AND status = 'active'`
	
	var count int
	var earnings int
	err := r.db.QueryRow(ctx, query, userID).Scan(&count, &earnings)
	if err != nil {
		return nil, err
	}
	
	stats["total_referrals"] = count
	stats["total_earnings"] = earnings
	stats["referral_code"] = fmt.Sprintf("REF%s", userID.String()[:8])
	
	return stats, nil
}
