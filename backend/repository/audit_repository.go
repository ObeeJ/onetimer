package repository

import (
	"context"
	"fmt"
	"onetimer-backend/database"
	"onetimer-backend/models"

	"github.com/georgysavva/scany/v2/pgxscan"
)

type AuditRepository struct {
	db *database.SupabaseDB
}

func NewAuditRepository(db *database.SupabaseDB) *AuditRepository {
	return &AuditRepository{db: db}
}

func (r *AuditRepository) CreateAuditLog(log *models.AuditLog) error {
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO audit_logs (id, user_id, action, resource, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
		log.ID, log.UserID, log.Action, log.Resource, log.Details, log.IPAddress, log.UserAgent, log.CreatedAt)
	return err
}

func (r *AuditRepository) GetAuditLogs(limit, offset int, filters map[string]interface{}) ([]models.AuditLog, int, error) {
	var logs []models.AuditLog
	var total int

	query := "SELECT * FROM audit_logs"
	countQuery := "SELECT COUNT(*) FROM audit_logs"

	var args []interface{}
	whereClause := " WHERE 1 = 1"
	argCount := 1

	for key, value := range filters {
		if value != "" {
			whereClause += fmt.Sprintf(" AND %s = $%d", key, argCount)
			args = append(args, value)
			argCount++
		}
	}

	query += whereClause
	countQuery += whereClause

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, limit, offset)

	err := pgxscan.Select(context.Background(), r.db, &logs, query, args...)
	if err != nil {
		return nil, 0, err
	}

	err = r.db.QueryRow(context.Background(), countQuery, args[:argCount-1]...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

func (r *AuditRepository) GetAuditStats(period string) (map[string]interface{}, error) {
	query := `
		SELECT
			COUNT(*) AS total_actions,
			COUNT(CASE WHEN action = 'security' THEN 1 END) AS security_events,
			COUNT(CASE WHEN action = 'approval' THEN 1 END) AS approvals,
			COUNT(CASE WHEN action = 'payout' THEN 1 END) AS payouts,
			COUNT(CASE WHEN action = 'config' THEN 1 END) AS config_changes
		FROM audit_logs
		WHERE created_at >= NOW() - $1::interval
	`

	var stats struct {
		TotalActions   int `db:"total_actions"`
		SecurityEvents int `db:"security_events"`
		Approvals      int `db:"approvals"`
		Payouts        int `db:"payouts"`
		ConfigChanges  int `db:"config_changes"`
	}

	err := pgxscan.Get(context.Background(), r.db, &stats, query, period)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_actions":   stats.TotalActions,
		"security_events": stats.SecurityEvents,
		"approvals":       stats.Approvals,
		"payouts":         stats.Payouts,
		"config_changes":  stats.ConfigChanges,
		"period":          period,
	}, nil
}

func (r *AuditRepository) ExportAuditLogs(filters map[string]interface{}) ([][]string, error) {
	var logs []models.AuditLog

	query := "SELECT * FROM audit_logs"

	var args []interface{}
	whereClause := " WHERE 1 = 1"
	argCount := 1

	for key, value := range filters {
		if value != "" {
			whereClause += fmt.Sprintf(" AND %s = $%d", key, argCount)
			args = append(args, value)
			argCount++
		}
	}

	query += whereClause
	query += " ORDER BY created_at DESC"

	err := pgxscan.Select(context.Background(), r.db, &logs, query, args...)
	if err != nil {
		return nil, err
	}

	var data [][]string
	data = append(data, []string{"ID", "UserID", "Action", "Resource", "Details", "IPAddress", "UserAgent", "CreatedAt"})

	for _, log := range logs {
		var userID, resource, ip, ua string
		if log.UserID != nil {
			userID = log.UserID.String()
		}
		if log.Resource != nil {
			resource = *log.Resource
		}
		if log.IPAddress != nil {
			ip = *log.IPAddress
		}
		if log.UserAgent != nil {
			ua = *log.UserAgent
		}
		data = append(data, []string{
			log.ID.String(),
			userID,
			log.Action,
			resource,
			string(log.Details),
			ip,
			ua,
			log.CreatedAt.String(),
		})
	}

	return data, nil
}
