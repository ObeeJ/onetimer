#!/bin/bash
# OneTimer Log Viewer
# Easily view and filter logs from Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}═════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═════════════════════════════════════${NC}"
}

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Get container ID for onetimer service
CONTAINER_ID=$(docker-compose ps -q onetimer 2>/dev/null || echo "")

if [ -z "$CONTAINER_ID" ]; then
    echo -e "${RED}❌ OneTimer container is not running${NC}"
    echo -e "${YELLOW}Start containers with: docker-compose up${NC}"
    exit 1
fi

# Parse command line arguments
case "${1:-all}" in
    all)
        print_header "🔍 Viewing ALL logs (follow mode)"
        docker logs -f --timestamps "$CONTAINER_ID"
        ;;
    errors)
        print_header "❌ Viewing ERROR logs"
        docker logs --timestamps "$CONTAINER_ID" | grep -i "error\|failed\|❌" || echo -e "${GREEN}✅ No errors found${NC}"
        ;;
    warnings)
        print_header "⚠️ Viewing WARNING logs"
        docker logs --timestamps "$CONTAINER_ID" | grep -i "warn\|⚠️" || echo -e "${GREEN}✅ No warnings found${NC}"
        ;;
    success)
        print_header "✅ Viewing SUCCESS logs"
        docker logs --timestamps "$CONTAINER_ID" | grep -i "success\|✅" || echo -e "${YELLOW}No success messages found${NC}"
        ;;
    last)
        print_header "📋 Last 50 lines"
        docker logs --timestamps --tail=50 "$CONTAINER_ID"
        ;;
    follow)
        print_header "🔴 Following logs in real-time"
        docker logs -f --timestamps "$CONTAINER_ID"
        ;;
    tail)
        LINES="${2:-100}"
        print_header "📋 Last $LINES lines"
        docker logs --timestamps --tail="$LINES" "$CONTAINER_ID"
        ;;
    websocket)
        print_header "🔌 WebSocket connection logs"
        docker logs --timestamps "$CONTAINER_ID" | grep -i "websocket\|ws\|📨" || echo -e "${YELLOW}No WebSocket logs found${NC}"
        ;;
    db)
        print_header "🗄️ Database logs"
        docker logs --timestamps -f postgres
        ;;
    redis)
        print_header "⚡ Redis cache logs"
        docker logs --timestamps -f redis
        ;;
    help|usage|-h|--help)
        cat <<EOF
${GREEN}OneTimer Log Viewer${NC}

${YELLOW}Usage:${NC}
  ./view-logs.sh [COMMAND] [ARGS]

${YELLOW}Commands:${NC}
  all            View all logs (live follow) - ${GREEN}default${NC}
  errors         Show error logs only
  warnings       Show warning logs only
  success        Show success logs only
  last           Show last 50 lines
  follow         Follow logs in real-time (same as 'all')
  tail N         Show last N lines (default: 100)
  websocket      Show WebSocket connection logs
  db             View PostgreSQL database logs
  redis          View Redis cache logs
  help           Show this help message

${YELLOW}Examples:${NC}
  ./view-logs.sh errors              # Show only errors
  ./view-logs.sh tail 200            # Last 200 lines
  ./view-logs.sh warnings            # Show warnings
  ./view-logs.sh websocket           # WebSocket activity

${YELLOW}Log Storage Location:${NC}
  Container logs: /var/lib/docker/containers/<id>/<id>-json.log

${YELLOW}Log Rotation:${NC}
  Max file size: 100MB
  Max files: 10
  Total max storage: ~1GB per container

${GREEN}✅ Logs are persisted even after container restart${NC}
EOF
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${YELLOW}Use './view-logs.sh help' for usage information${NC}"
        exit 1
        ;;
esac
