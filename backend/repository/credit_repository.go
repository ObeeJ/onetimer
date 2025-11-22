package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

type CreditRepository struct {
	*BaseRepository
}

func NewCreditRepository(base *BaseRepository) *CreditRepository {
	return &CreditRepository{BaseRepository: base}
}

func (r *CreditRepository) GetUserCredits(ctx context.Context, userID uuid.UUID) (int, error) {
	var totalCredits *int
	err := r.db.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM credits WHERE user_id = $1", userID).Scan(&totalCredits)
	if err != nil {
		return 0, fmt.Errorf("failed to get user credits: %w", err)
	}
	if totalCredits == nil {
		return 0, nil
	}
	return *totalCredits, nil
}

func (r *CreditRepository) DeductCredits(ctx context.Context, userID uuid.UUID, amount int, description string) error {
	return r.Exec(ctx, "INSERT INTO credits (user_id, amount, type, description) VALUES ($1, $2, $3, $4)", userID, -amount, "deduction", description)
}
