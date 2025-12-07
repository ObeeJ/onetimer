# Sentry Observability Package

Production-ready Sentry integration with automatic PII filtering, environment-aware sampling, and error tracking.

## Features

- **Environment-Aware Sampling**: Automatic adjustment based on ENV
  - Development: 100% traces, 100% errors
  - Staging: 30% traces, 100% errors  
  - Production: 10% traces, 100% errors

- **PII Filtering**: Automatic redaction of sensitive data
  - Passwords, tokens, API keys, JWT tokens
  - Email masking (e.g., `aj***@gmail.com`)
  - IP masking (e.g., `192.168.1.***`)
  - Request headers, cookies, and breadcrumbs

- **Advanced Options**:
  - Release tracking for deployment correlation
  - Server name for multi-instance identification
  - MaxErrorDepth (10) to prevent long error chains
  - MaxSpans (1000) for performance monitoring
  - Breadcrumb filtering with PII scrubbing
  - Transaction filtering (ignores /healthz, /metrics)
  
- **Stack Traces**: Automatic attachment to all errors
- **Integration**: Works with existing error handlers and loggers

## Configuration

### Environment Variables

```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_RELEASE=onetimer-backend@v1.0.0  # Optional, defaults to @dev
SENTRY_SERVER_NAME=api-server-01  # Optional, identifies server instance
ENV=production  # development, staging, or production
```

### Production Release Tracking

For production deployments, set release to Git SHA:

```bash
export SENTRY_RELEASE="onetimer-backend@$(git rev-parse --short HEAD)"
```

Or in CI/CD:

```bash
SENTRY_RELEASE=onetimer-backend@${GITHUB_SHA:0:7}
```

## Usage

### Automatic Error Capture

Errors are automatically captured in:

1. **Error Handler** (`errors/errors.go`): All 5xx errors
2. **Logger** (`utils/logger.go`): All `LogError()` calls
3. **Fiber Middleware**: Panics and unhandled errors

### Manual Error Capture

```go
import "onetimer-backend/observability"

// Capture error with tags and extra context
observability.CaptureError(err, 
    map[string]string{"component": "payment"},
    map[string]interface{}{"amount": 1000})

// Capture message
observability.CaptureMessage("Payment processed", 
    sentry.LevelInfo,
    map[string]string{"user_id": "123"})
```

## Security

### Sensitive Fields Automatically Redacted

- `password`, `token`, `secret`, `api_key`, `authorization`
- `credit_card`, `cvv`, `ssn`, `jwt`, `bearer`
- `smtp_pass`, `aws_secret`

### Pattern Matching

- JWT tokens: `eyJ...` → `[JWT_REDACTED]`
- Bearer tokens: `Bearer abc123` → `Bearer [REDACTED]`

## Cost Optimization

### Sampling Rates Explained

**Traces (Performance Monitoring)**:
- Production: 10% = 1 in 10 requests tracked
- Reduces quota usage by 90%
- Still provides representative performance data

**Errors**:
- All environments: 100% = every error captured
- Critical for debugging production issues

### Estimated Costs

For 1M requests/month:
- Without sampling: 1M transactions = ~$26/month
- With 10% sampling: 100K transactions = ~$2.60/month

## Testing

### Development

```bash
ENV=development go run ./cmd/onetimer-backend
```

All errors and traces captured for debugging.

### Staging

```bash
ENV=staging go run ./cmd/onetimer-backend
```

30% of traces captured, all errors.

### Production

```bash
ENV=production ./onetimer-backend
```

10% of traces, all errors, PII filtered.

## Monitoring

Check Sentry dashboard for:
- Error frequency and trends
- Performance bottlenecks
- Release comparisons
- User impact

## Troubleshooting

### Sentry not capturing errors

1. Check DSN is set: `echo $SENTRY_DSN`
2. Check logs for initialization message
3. Verify network connectivity to Sentry

### Too many events

Reduce `TracesSampleRate` in `observability/sentry.go`:

```go
case "production":
    return 0.05  // 5% instead of 10%
```

### PII still visible

Add field to `sensitiveFields` in `observability/sentry.go`:

```go
var sensitiveFields = []string{
    "your_field_name",
    // ...
}
```
