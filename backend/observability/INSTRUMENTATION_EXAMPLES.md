# Sentry Instrumentation Examples

## Database Query Instrumentation

Track database query performance and failures:

```go
import "onetimer-backend/observability"

func GetUserByEmail(ctx context.Context, email string) (*User, error) {
    // Start database span
    span := observability.StartDatabaseSpan(ctx, "SELECT * FROM users WHERE email = $1")
    defer span.Finish()

    // Execute query
    var user User
    err := db.QueryRow(ctx, "SELECT * FROM users WHERE email = $1", email).Scan(&user)
    if err != nil {
        span.SetTag("error", "true")
        return nil, err
    }

    span.SetTag("rows_affected", "1")
    return &user, nil
}
```

## External API Call Instrumentation

Track external API calls (Paystack, MailerSend, S3):

```go
import "onetimer-backend/observability"

func InitializePayment(ctx context.Context, amount int, email string) error {
    // Start external API span
    span := observability.StartExternalAPISpan(ctx, "POST", "https://api.paystack.co/transaction/initialize")
    defer span.Finish()

    // Make API call
    resp, err := http.Post(url, body)
    if err != nil {
        span.SetTag("error", "true")
        span.SetData("error_message", err.Error())
        return err
    }

    span.SetTag("status_code", resp.StatusCode)
    return nil
}
```

## Business Context Tracking

Add business-specific context to error reports:

```go
import "onetimer-backend/observability"

func ProcessSurveyResponse(ctx context.Context, surveyID, userID string, response map[string]interface{}) error {
    // Add business context
    observability.SetBusinessContext(ctx, "survey", map[string]interface{}{
        "survey_id": surveyID,
        "user_id": userID,
        "response_count": len(response),
    })

    // If an error occurs anywhere in this function,
    // Sentry will include the survey context
    err := validateResponse(response)
    if err != nil {
        return err // Sentry will capture with survey context
    }

    return nil
}
```

## User Context Tracking

Set user information for error attribution:

```go
import "onetimer-backend/observability"

func LoginHandler(c *fiber.Ctx) error {
    user, err := authenticate(c)
    if err != nil {
        return err
    }

    // Set user context in Sentry
    observability.SetUserContext(user.ID, user.Email, user.Role)

    // All subsequent errors will include user information
    return c.JSON(user)
}
```

## Complete Example: Payment Processing

```go
func ProcessWithdrawal(ctx context.Context, withdrawalID, userID string, amount int) error {
    // Add business context
    observability.SetBusinessContext(ctx, "withdrawal", map[string]interface{}{
        "withdrawal_id": withdrawalID,
        "user_id": userID,
        "amount": amount,
    })

    // Database operation with span
    span := observability.StartDatabaseSpan(ctx, "UPDATE withdrawals SET status = 'processing'")
    _, err := db.Exec(ctx, "UPDATE withdrawals SET status = 'processing' WHERE id = $1", withdrawalID)
    span.Finish()

    if err != nil {
        return err
    }

    // External API call with span
    apiSpan := observability.StartExternalAPISpan(ctx, "POST", "https://api.paystack.co/transfer")
    resp, err := paystackService.Transfer(amount, userID)
    apiSpan.Finish()

    if err != nil {
        apiSpan.SetTag("error", "true")
        return err
    }

    apiSpan.SetTag("status_code", resp.StatusCode)
    return nil
}
```

## What Gets Tracked in Sentry

With this instrumentation, Sentry will show:

1. **Performance Timeline**
   - Total request duration
   - Database query time
   - External API call time
   - Time spent in each operation

2. **Error Context**
   - Which database query failed
   - Which external API call failed
   - Survey/payment/user context
   - User information (masked)

3. **Distributed Tracing**
   - Full request flow from HTTP → DB → External API
   - Parent-child span relationships
   - Performance bottlenecks

## Sample Sentry Event

```json
{
  "event_id": "abc123",
  "message": "Payment processing failed",
  "contexts": {
    "withdrawal": {
      "withdrawal_id": "wd_456",
      "user_id": "user_789",
      "amount": 50000
    }
  },
  "user": {
    "id": "user_789",
    "email": "us***@example.com",
    "username": "creator"
  },
  "spans": [
    {
      "op": "db.query",
      "description": "UPDATE withdrawals SET status = 'processing'",
      "duration": 0.045
    },
    {
      "op": "http.client",
      "description": "POST https://api.paystack.co/transfer",
      "duration": 1.234,
      "tags": {
        "status_code": 400,
        "error": "true"
      }
    }
  ]
}
```
