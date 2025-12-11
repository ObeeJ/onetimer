# Deployment Guide

## Environment Configuration

### Development
```bash
ENV=development go run ./backend/cmd/onetimer-backend
```

### Production

#### Option 1: Using .env.production file
```bash
cp .env.production backend/.env.production
cd backend
ENV=production go run ./cmd/onetimer-backend
```

#### Option 2: Export environment variables
```bash
export SENTRY_DSN="https://7d8ee87badeeb2195ab4d0205bf0b014@o4510474134224896.ingest.us.sentry.io/4510491762819072"
export SENTRY_RELEASE="onetimer-backend@$(git rev-parse --short HEAD)"
export SENTRY_SERVER_NAME="api-server-01"
export ENV="production"

cd backend
go run ./cmd/onetimer-backend
```

#### Option 3: Docker with Git SHA
```bash
# Build with release tracking
docker build \
  --build-arg GIT_SHA=$(git rev-parse --short HEAD) \
  -t onetimer-backend:latest \
  -f backend/Dockerfile .

# Run with production config
docker run -d \
  --env-file .env.production \
  -e SENTRY_RELEASE="onetimer-backend@$(git rev-parse --short HEAD)" \
  -p 8080:8080 \
  onetimer-backend:latest
```

## Sentry Configuration by Environment

### Development
- **Traces**: 100% (all requests)
- **Errors**: 100% (all errors)
- **Debug**: Enabled
- **PII Filtering**: Active

### Staging
- **Traces**: 30% (1 in 3 requests)
- **Errors**: 100% (all errors)
- **Debug**: Disabled
- **PII Filtering**: Active

### Production
- **Traces**: 10% (1 in 10 requests)
- **Errors**: 100% (all errors)
- **Debug**: Disabled
- **PII Filtering**: Active

## Multi-Instance Deployment

For multiple server instances, set unique server names:

```bash
# Server 1
export SENTRY_SERVER_NAME="api-server-01"

# Server 2
export SENTRY_SERVER_NAME="api-server-02"

# Server 3
export SENTRY_SERVER_NAME="api-server-03"
```

## Verify Deployment

### 1. Check Sentry Initialization
```bash
# Look for this log message
✅ Sentry initialized: env=production, sample_rate=1.00, traces_sample_rate=0.10
```

### 2. Test Error Capture
```bash
# Trigger a test error
curl http://your-domain.com/api/test-error

# Check Sentry dashboard for the event
```

### 3. Monitor Logs
```bash
# Watch for Sentry events
tail -f backend/server.log | grep -i sentry
```

## Release Tracking

### Automatic (Recommended)
Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Deploy with Sentry Release
  run: |
    export SENTRY_RELEASE="onetimer-backend@${{ github.sha }}"
    ./deploy.sh
```

### Manual
```bash
# Get current Git SHA
GIT_SHA=$(git rev-parse --short HEAD)

# Set release
export SENTRY_RELEASE="onetimer-backend@${GIT_SHA}"

# Deploy
./deploy.sh
```

## Troubleshooting

### Sentry Not Capturing Events
1. Verify DSN: `echo $SENTRY_DSN`
2. Check environment: `echo $ENV`
3. Enable debug mode temporarily: `export ENV=development`
4. Check network: `curl https://sentry.io`

### Too Many Events
1. Reduce traces: Edit `backend/observability/sentry.go`
2. Add ignore patterns: Update `IgnoreTransactions`
3. Check sampling rates in logs

### PII Leaking
1. Review `sensitiveFields` in `backend/observability/sentry.go`
2. Test with: `curl -H "Authorization: Bearer test" http://localhost:8080/api/test`
3. Verify in Sentry dashboard that token is `[REDACTED]`

## Monitoring

### Sentry Dashboard
- Errors: https://sentry.io/organizations/your-org/issues/
- Performance: https://sentry.io/organizations/your-org/performance/
- Releases: https://sentry.io/organizations/your-org/releases/

### Set Up Alerts
1. Go to Sentry → Alerts
2. Create alert for "Issues"
3. Filter: `monitor.slug equals onetimer-backend`
4. Action: Email/Slack notification

## Cost Management

### Current Configuration (1M requests/month)
- **Development**: ~$26/month (100% traces)
- **Production**: ~$2.60/month (10% traces)

### If Costs Increase
Reduce production traces to 5%:
```go
// backend/observability/sentry.go
case "production":
    return 0.05  // 5% instead of 10%
```

## Security Checklist

- ✅ PII filtering enabled
- ✅ Cookies removed
- ✅ Emails masked
- ✅ IPs masked
- ✅ JWT tokens redacted
- ✅ SendDefaultPII disabled
- ✅ HTTPS only (Sentry endpoint)

## Support

- Implementation: `SENTRY_IMPLEMENTATION.md`
- Usage: `backend/observability/README.md`
- Sentry Docs: https://docs.sentry.io/platforms/go/
