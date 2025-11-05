# OneTimer Logging Setup

## Overview

OneTimer uses **Docker's JSON File logging driver** with log rotation to ensure:
- ✅ **Persistent logs** - Logs survive container restarts
- ✅ **Automatic rotation** - Logs don't consume unlimited disk space
- ✅ **Easy access** - Logs stored in standard Docker locations
- ✅ **Production-ready** - Works in both development and production

## Configuration

### Log Driver Settings (in docker-compose.yml)

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "100m"      # Max size per log file
    max-file: "10"        # Keep last 10 rotated files
    labels: "service=onetimer"
```

### Storage Details

- **Location**: `/var/lib/docker/containers/<container-id>/<container-id>-json.log`
- **Max per file**: 100MB
- **Max files kept**: 10
- **Total max storage**: ~1GB per container
- **Rotation**: Automatic when file reaches max-size

## Viewing Logs

### Using the Helper Script (Recommended)

```bash
# View all logs (live)
./view-logs.sh all

# Show only errors
./view-logs.sh errors

# Show only warnings
./view-logs.sh warnings

# Last 200 lines
./view-logs.sh tail 200

# WebSocket logs
./view-logs.sh websocket

# Database logs
./view-logs.sh db

# Redis cache logs
./view-logs.sh redis

# Help
./view-logs.sh help
```

### Using Docker Directly

```bash
# View live logs
docker-compose logs -f onetimer

# Last 100 lines with timestamps
docker-compose logs --tail=100 -f --timestamps onetimer

# Only postgres
docker-compose logs -f postgres

# Only redis
docker-compose logs -f redis

# All services
docker-compose logs -f
```

### Using Docker CLI

```bash
# Get container ID
CONTAINER_ID=$(docker-compose ps -q onetimer)

# View logs
docker logs -f --timestamps "$CONTAINER_ID"

# Follow errors only
docker logs -f "$CONTAINER_ID" | grep -i error
```

## Log Levels

The application logs important events with prefixes:

- ✅ **Success** - `✅` Green - Operation completed successfully
- ⚠️ **Warning** - `⚠️` Yellow - Potential issues to monitor
- ❌ **Error** - `❌` Red - Critical errors that need attention
- 📨 **Messages** - `📨` Blue - Information messages
- 🔌 **WebSocket** - `🔌` - Real-time connection events

### Examples

```
✅ Rate limiter initialized successfully
⚠️ Rate limiter initialization failed: connection timeout
❌ Failed to save waitlist entry: database error
📨 Message sent to user abc123: new_survey
🔌 WebSocket connection established for user abc123
```

## Filtering Logs

### Find Errors

```bash
./view-logs.sh errors
# or
docker logs <container-id> | grep -i "error\|failed\|❌"
```

### Find WebSocket Activity

```bash
./view-logs.sh websocket
# or
docker logs <container-id> | grep -E "WebSocket|ws|📨|🔌"
```

### Find Database Issues

```bash
docker logs postgres | grep -i "error\|fatal"
```

### Find Performance Issues

```bash
docker logs <container-id> | grep -i "slow\|timeout\|deadline"
```

## Production Deployment

### For Render.com

Render automatically collects Docker logs. Access them in:
1. **Render Dashboard** → Your Service → **Logs**
2. Logs are automatically rotated
3. History retained for 7 days

### For AWS/DigitalOcean

Mount logs to a persistent volume:

```yaml
volumes:
  - /var/lib/docker/containers:/docker-logs
```

Then access with:
```bash
tail -f /docker-logs/*/\*-json.log
```

### For Cloud Run

Cloud Run automatically streams logs to Cloud Logging.
Access via:
```bash
gcloud logging read "resource.type=cloud_run_revision"
```

## Log Rotation Strategy

| Setting | Value | Purpose |
|---------|-------|---------|
| `max-size` | 100MB | When a log file reaches 100MB, rotate it |
| `max-file` | 10 | Keep the 10 most recent rotated files |
| **Total Storage** | ~1GB | Prevents disk space issues |
| **Retention** | ~1-2 weeks | Depending on log volume |

## Accessing Old Logs

Old rotated logs are stored as:
- `-json.log.1` (oldest)
- `-json.log.2`
- ... up to `-json.log.10` (newest before current)

View them with:
```bash
docker logs <container-id>  # Shows all rotated logs + current
```

## Monitoring

### Set Up Alerts (for production)

Watch for error patterns:
```bash
# Check error rate
docker logs --since 1h <container-id> | grep -c "❌"

# Monitor WebSocket connections
docker logs --since 10m <container-id> | grep "🔌"
```

### Real-time Monitoring Script

```bash
#!/bin/bash
while true; do
  clear
  echo "=== OneTimer Logs (Last 20 lines) ==="
  docker logs --tail=20 <container-id>
  echo ""
  echo "=== Error Count (Last Hour) ==="
  docker logs --since 1h <container-id> | grep -c "❌" || echo "0"
  sleep 5
done
```

## Troubleshooting

### Logs Not Showing

```bash
# Check container is running
docker-compose ps

# Verify container has logs
docker logs <container-id>

# Check disk space
df -h /var/lib/docker
```

### Logs Taking Up Disk Space

Docker log rotation should handle this, but if not:

```bash
# Check log file size
du -sh /var/lib/docker/containers/*/*.log

# Force rotation (restart container)
docker-compose restart onetimer
```

### Find Container ID

```bash
# Get OneTimer container ID
docker-compose ps -q onetimer

# Get all container IDs
docker ps
```

## Best Practices

1. **Regular Monitoring** - Check logs weekly for errors
2. **Archive Old Logs** - Backup logs older than 30 days
3. **Set Alerts** - Monitor error rates
4. **Document Issues** - Keep log of known issues and solutions
5. **Rotate Credentials** - If credentials appear in logs, rotate them

## Integration with Other Tools

### Send Logs to External Service

For production, consider:
- **Sentry** (errors) - `go get github.com/getsentry/sentry-go`
- **Datadog** (monitoring) - Agent-based monitoring
- **CloudWatch** (AWS) - Native AWS logging
- **Stackdriver** (GCP) - Native GCP logging

Setup example for Sentry:
```go
import "github.com/getsentry/sentry-go"

func init() {
    sentry.Init(sentry.ClientOptions{
        Dsn: os.Getenv("SENTRY_DSN"),
    })
}
```

## Support

For logging issues, check:
1. Docker version: `docker --version`
2. Disk space: `df -h`
3. Container status: `docker-compose ps`
4. Recent logs: `./view-logs.sh tail 100`

---

**Last Updated**: 2024
**Version**: 1.0
