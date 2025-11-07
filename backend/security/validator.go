package security

import (
	"net/mail"
	"regexp"
	"strings"
	"unicode"

	"github.com/gofiber/fiber/v2"
)

var (
	emailRegex   = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	phoneRegex   = regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
	nameRegex    = regexp.MustCompile(`^[a-zA-Z\s'-]{2,50}$`)
	sqlInjection = regexp.MustCompile(`(?i)(union|select|insert|update|delete|drop|create|alter|exec|script|javascript|<script|</script>)`)
	xssPattern   = regexp.MustCompile(`(?i)(<script|</script>|javascript:|on\w+\s*=|<iframe|</iframe>)`)
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type Validator struct {
	errors []ValidationError
}

func NewValidator() *Validator {
	return &Validator{errors: make([]ValidationError, 0)}
}

func (v *Validator) ValidateEmail(email string) *Validator {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		v.errors = append(v.errors, ValidationError{"email", "Email is required"})
		return v
	}

	if len(email) > 255 {
		v.errors = append(v.errors, ValidationError{"email", "Email too long"})
		return v
	}

	if _, err := mail.ParseAddress(email); err != nil {
		v.errors = append(v.errors, ValidationError{"email", "Invalid email format"})
		return v
	}

	if !emailRegex.MatchString(email) {
		v.errors = append(v.errors, ValidationError{"email", "Invalid email format"})
	}

	return v
}

func (v *Validator) ValidatePassword(password string) *Validator {
	if len(password) < 8 {
		v.errors = append(v.errors, ValidationError{"password", "Password must be at least 8 characters"})
		return v
	}

	if len(password) > 128 {
		v.errors = append(v.errors, ValidationError{"password", "Password too long"})
		return v
	}

	var hasUpper, hasLower, hasDigit, hasSpecial bool
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	if !hasUpper || !hasLower || !hasDigit || !hasSpecial {
		v.errors = append(v.errors, ValidationError{"password", "Password must contain uppercase, lowercase, digit, and special character"})
	}

	return v
}

func (v *Validator) ValidateName(name string) *Validator {
	name = strings.TrimSpace(name)

	if name == "" {
		v.errors = append(v.errors, ValidationError{"name", "Name is required"})
		return v
	}

	if len(name) < 2 || len(name) > 100 {
		v.errors = append(v.errors, ValidationError{"name", "Name must be 2-100 characters"})
		return v
	}

	if !nameRegex.MatchString(name) {
		v.errors = append(v.errors, ValidationError{"name", "Name contains invalid characters"})
	}

	return v
}

func (v *Validator) SanitizeInput(input string) string {
	input = xssPattern.ReplaceAllString(input, "")
	input = sqlInjection.ReplaceAllString(input, "")
	input = strings.TrimSpace(input)
	if len(input) > 1000 {
		input = input[:1000]
	}
	return input
}

func (v *Validator) HasErrors() bool {
	return len(v.errors) > 0
}

func (v *Validator) GetErrors() []ValidationError {
	return v.errors
}

func (v *Validator) SendErrorResponse(c *fiber.Ctx) error {
	return c.Status(400).JSON(fiber.Map{
		"error":  "Validation failed",
		"errors": v.errors,
	})
}
