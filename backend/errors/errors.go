package errors

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

type APIError struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

func (e APIError) Error() string {
	return e.Message
}

// Predefined error types
var (
	ErrValidation     = APIError{Code: "VALIDATION_ERROR", Message: "Validation failed"}
	ErrUnauthorized   = APIError{Code: "UNAUTHORIZED", Message: "Authentication required"}
	ErrForbidden      = APIError{Code: "FORBIDDEN", Message: "Access denied"}
	ErrNotFound       = APIError{Code: "NOT_FOUND", Message: "Resource not found"}
	ErrConflict       = APIError{Code: "CONFLICT", Message: "Resource already exists"}
	ErrInternalServer = APIError{Code: "INTERNAL_ERROR", Message: "Internal server error"}
	ErrBadRequest     = APIError{Code: "BAD_REQUEST", Message: "Invalid request"}
)

func NewValidationError(details map[string]interface{}) APIError {
	return APIError{
		Code:    "VALIDATION_ERROR",
		Message: "Validation failed",
		Details: details,
	}
}

func NewNotFoundError(resource string) APIError {
	return APIError{
		Code:    "NOT_FOUND",
		Message: resource + " not found",
	}
}

func NewConflictError(resource string) APIError {
	return APIError{
		Code:    "CONFLICT",
		Message: resource + " already exists",
	}
}

func HandleError(c *fiber.Ctx, err error) error {
	switch e := err.(type) {
	case APIError:
		return c.Status(getStatusCode(e.Code)).JSON(e)
	default:
		return c.Status(http.StatusInternalServerError).JSON(ErrInternalServer)
	}
}

func getStatusCode(code string) int {
	switch code {
	case "VALIDATION_ERROR", "BAD_REQUEST":
		return http.StatusBadRequest
	case "UNAUTHORIZED":
		return http.StatusUnauthorized
	case "FORBIDDEN":
		return http.StatusForbidden
	case "NOT_FOUND":
		return http.StatusNotFound
	case "CONFLICT":
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}
