package repository

import (
	"context"
	"fmt"
	"onetimer-backend/database"
)

type BaseRepository struct {
	db *database.SupabaseDB
}

func NewBaseRepository(db *database.SupabaseDB) *BaseRepository {
	return &BaseRepository{db: db}
}

func (r *BaseRepository) WithTx(ctx context.Context, fn func(tx interface{}) error) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	if err := fn(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *BaseRepository) Exec(ctx context.Context, query string, args ...interface{}) error {
	_, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("exec failed: %w", err)
	}
	return nil
}
