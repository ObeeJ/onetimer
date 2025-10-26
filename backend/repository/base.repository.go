package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BaseRepository struct {
	db *pgxpool.Pool
}

func NewBaseRepository(db *pgxpool.Pool) *BaseRepository {
	return &BaseRepository{db: db}
}

func (r *BaseRepository) WithTx(ctx context.Context, fn func(tx interface{}) error) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if err := fn(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
