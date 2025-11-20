package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID        uuid.UUID       `json:"id" db:"id"`
	UserID    *uuid.UUID      `json:"user_id" db:"user_id"`
	Action    string          `json:"action" db:"action"`
	Resource  *string         `json:"resource" db:"resource"`
	Details   json.RawMessage `json:"details" db:"details"`
	IPAddress *string         `json:"ip_address" db:"ip_address"`
	UserAgent *string         `json:"user_agent" db:"user_agent"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
}
