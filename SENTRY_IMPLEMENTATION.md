# Sentry Implementation Summary

## ✅ Implementation Complete

Production-ready Sentry integration with all advanced options configured for scalability and security.

## Files Modified/Created

### Created
- `backend/observability/sentry.go` - Core Sentry package
- `backend/observability/README.md` - Documentation
- `.env.example` - Environment template
- `SENTRY_IMPLEMENTATION.md` - This file

### Modified
- `backend/config/config.go` - Added Sentry config fields
- `backend/cmd/onetimer-backend/main.go` - Integrated observability package
- `backend/errors/errors.go` - Auto-capture 5xx errors
- `backend/utils/logger.go` - Send errors to Sentry
- `.env` - Added Sentry environment variables

## Configuration Options Implemented

### Core Options
- ✅ **Dsn**: Read from `SENTRY_DSN` environment variable
- ✅ **Environment**: Read from `ENV` (development/staging/production)
- ✅ **Release**: Read from `SENTRY_RELEASE` for deployment tracking
- ✅ **ServerName**: Read from `SENTRY_SERVER_NAME` for multi-instance tracking
- ✅ **Debug**: Auto-enabled in development, disabled in production
- ✅ **SampleRate**: 100% for all errors (environment-aware)
- ✅ **TracesSampleRate**: Environment-aware (10% prod, 30% staging, 100% dev)

### Advanced Options
- ✅ **EnableTracing**: Enabled for performance monitoring
- ✅ **EnableLogs**: Enabled for log capture
- ✅ **AttachStacktrace**: Enabled for all messages
- ✅ **SendDefaultPII**: Disabled (manual PII filtering via BeforeSend)
- ✅ **MaxBreadcrumbs**: 50 (optimized for payload size)
- ✅ **MaxErrorDepth**: 10 (prevents long error chains)
- ✅ **MaxSpans**: 1000 (default, prevents payload overflow)

### Hooks Implemented
- ✅ **BeforeSend**: PII filtering for errors
- ✅ **BeforeSendTransaction**: PII filtering for transactions
- ✅ **BeforeBreadcrumb**: PII filtering for breadcrumbs

### Filtering
- ✅ **IgnoreErrors**: `context canceled`, `connection reset by peer`, `EOF`
- ✅ **IgnoreTransactions**: `/healthz`, `/api/healthz`, `/metrics`

## Environment Variables

```bash
# Required
SENTRY_DSN=https://7d8ee87badeeb2195ab4d0205bf0b014@o4510474134224896.ingest.us.sentry.io/4510491762819072
ENV=production

# Optional
SENTRY_RELEASE=onetimer-backend@v1.0.0
SENTRY_SERVER_NAME=api-server-01
```

## Sampling Strategy (Cost Optimization)

### Error Events (SampleRate)
- **All Environments**: 100% (capture every error)
- **Rationale**: Critical for debugging production issues

### Performance Traces (TracesSampleRate)
- **Production**: 10% (1 in 10 requests)
- **Staging**: 30% (1 in 3 requests)
- **Development**: 100% (all requests)
- **Rationale**: Reduces quota usage by 90% in production while maintaining representative data

### Cost Impact
For 1M requests/month:
- **Without sampling**: 1M transactions = ~$26/month
- **With 10% sampling**: 100K transactions = ~$2.60/month
- **Savings**: ~$23.40/month (90% reduction)

## Security Features

### Automatic PII Redaction
All sensitive fields automatically redacted before sending to Sentry:

**Field Names**:
- `password`, `token`, `secret`, `api_key`, `authorization`
- `credit_card`, `cvv`, `ssn`, `jwt`, `bearer`
- `smtp_pass`, `aws_secret`

**Pattern Matching**:
- JWT tokens: `eyJ...` → `[JWT_REDACTED]`
- Bearer tokens: `Bearer abc123` → `Bearer [REDACTED]`

**Data Masking**:
- Emails: `user@example.com` → `us***@example.com`
- IPs: `192.168.1.100` → `192.168.1.***`
- Cookies: Completely removed

### Applied To
- Request headers
- Request data
- Event extra data
- Breadcrumbs
- User information

## Integration Points

### 1. Error Handler (`backend/errors/errors.go`)
Automatically captures all 5xx errors with context:
```go
// Automatic - no code changes needed
return errors.HandleError(c, err)
```

### 2. Logger (`backend/utils/logger.go`)
All `LogError()` calls sent to Sentry with trace context:
```go
utils.LogError(ctx, "Payment failed", err, "user_id", userID)
```

### 3. Fiber Middleware
Captures panics and unhandled errors automatically.

### 4. Manual Capture
```go
import "onetimer-backend/observability"

// Capture error with tags
observability.CaptureError(err, 
    map[string]string{"component": "payment"},
    map[string]interface{}{"amount": 1000})

// Capture message
observability.CaptureMessage("Payment processed", 
    sentry.LevelInfo,
    map[string]string{"user_id": "123"})
```

## Deployment

### Development
```bash
ENV=development go run ./cmd/onetimer-backend
```

### Production with Release Tracking
```bash
# Set release to Git SHA
export SENTRY_RELEASE="onetimer-backend@$(git rev-parse --short HEAD)"
export ENV=production
./onetimer-backend
```

### Docker Build with Release
```dockerfile
ARG GIT_SHA=dev
ENV SENTRY_RELEASE=onetimer-backend@${GIT_SHA}
```

Build:
```bash
docker build --build-arg GIT_SHA=$(git rev-parse --short HEAD) -t onetimer-backend .
```

### Multi-Instance Deployment
```bash
# Identify each server instance
export SENTRY_SERVER_NAME=api-server-01
export ENV=production
./onetimer-backend
```

## Monitoring & Alerts

### Sentry Dashboard
Monitor:
- Error frequency and trends
- Performance bottlenecks (P50, P95, P99)
- Release comparisons (regression detection)
- User impact (affected users count)
- Server-specific issues (via ServerName tag)

### Recommended Alerts
1. **Error Spike**: >100 errors in 5 minutes
2. **New Error Type**: First occurrence of new error
3. **Performance Degradation**: P95 > 2 seconds
4. **Release Regression**: New errors in latest release

## Scalability Considerations

### Current Configuration
- **MaxBreadcrumbs**: 50 (vs default 100) - Reduces payload size
- **MaxErrorDepth**: 10 (vs default 100) - Prevents long error chains
- **MaxSpans**: 1000 (default) - Adequate for most transactions
- **IgnoreTransactions**: Health checks excluded - Reduces noise

### Adjustments for High Traffic
If you exceed 10M requests/month:

1. **Reduce TracesSampleRate**:
```go
// In observability/sentry.go
case "production":
    return 0.05  // 5% instead of 10%
```

2. **Add More IgnoreTransactions**:
```go
IgnoreTransactions: []string{
    "/healthz",
    "/metrics",
    "/favicon.ico",
    "/static/*",
},
```

3. **Use TracesSampler** for dynamic sampling:
```go
TracesSampler: func(ctx sentry.SamplingContext) float64 {
    if ctx.Span.Name == "GET /api/expensive" {
        return 0.01  // 1% for expensive endpoints
    }
    return 0.1  // 10% for others
},
```

## Testing

### Verify Sentry Integration
```bash
# Start server
ENV=development go run ./cmd/onetimer-backend

# Trigger test error
curl http://localhost:8080/api/test-error

# Check Sentry dashboard for event
```

### Test PII Filtering
```bash
# Send request with sensitive data
curl -X POST http://localhost:8080/api/test \
  -H "Authorization: Bearer secret-token" \
  -d '{"password": "test123"}'

# Verify in Sentry: password and token should be [REDACTED]
```

## Troubleshooting

### Sentry Not Capturing Events
1. Check DSN: `echo $SENTRY_DSN`
2. Check logs for initialization message
3. Verify network connectivity: `curl https://sentry.io`
4. Check Debug mode: `ENV=development` enables verbose logging

### Too Many Events
1. Reduce `TracesSampleRate` in production
2. Add more patterns to `IgnoreErrors`
3. Add endpoints to `IgnoreTransactions`

### PII Still Visible
1. Add field to `sensitiveFields` array
2. Update `scrubSensitiveString()` regex patterns
3. Test with `BeforeSend` hook

## Compliance

### GDPR/CCPA Ready
- ✅ PII automatically filtered before transmission
- ✅ IP addresses masked
- ✅ Email addresses masked
- ✅ Cookies removed
- ✅ No default PII collection (`SendDefaultPII: false`)

### Data Retention
Configure in Sentry dashboard:
- Settings → Data Management → Data Retention
- Recommended: 30 days for compliance

## Next Steps

1. **Set up Alerts**: Configure Sentry alerts for critical errors
2. **Create Dashboards**: Build custom dashboards for key metrics
3. **Release Tracking**: Use Git SHA in production deployments
4. **Performance Monitoring**: Analyze slow transactions
5. **Error Grouping**: Review and merge duplicate error groups

## Support

- Documentation: `backend/observability/README.md`
- Sentry Docs: https://docs.sentry.io/platforms/go/
- Issues: Check Sentry dashboard for real-time errors
