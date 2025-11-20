package repository

import (
	"context"
	"onetimer-backend/database"

	"github.com/google/uuid"
)

type CreditRepository struct {
	db *database.SupabaseDB
}

func NewCreditRepository(db *database.SupabaseDB) *CreditRepository {
	return &CreditRepository{db: db}
}

func (r *CreditRepository) GetUserCredits(userID uuid.UUID) (int, error) {
	var totalCredits *int
	err := r.db.QueryRow(context.Background(), "SELECT COALESCE(SUM(amount), 0) FROM credits WHERE user_id = $1", userID).Scan(&totalCredits)
	if err != nil {
		return 0, err
	}
	if totalCredits == nil {
		return 0, nil
	}
	return *totalCredits, nil
}

func (r *CreditRepository) DeductCredits(userID uuid.UUID, amount int, description string) error {
	_, err := r.db.Exec(context.Background(), "INSERT INTO credits (user_id, amount, type, description) VALUES ($1, $2, $3, $4)", userID, -amount, "deduction", description)
	return err
}
