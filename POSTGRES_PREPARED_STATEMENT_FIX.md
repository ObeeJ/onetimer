# PostgreSQL Prepared Statement Error Fix

## ❌ The Problem

**Error:** `ERROR: prepared statement "stmtcache_..." already exists (SQLSTATE 42P05)`

**What's happening:**
- PostgreSQL is trying to create a prepared statement that already exists
- This occurs when connection pooling reuses a connection with cached statements
- Happens frequently in production with high concurrency

**Affected endpoint:** `GET /api/user/profile` (user.controller.go:162)

---

## 🔧 Solutions

### Option 1: Disable Prepared Statement Cache (Quick Fix)

Update your database connection string to disable statement caching:

**In `.env` and `.env.production`:**
```bash
# Before
DATABASE_URL=postgresql://user:pass@host:5432/db

# After (add statement_cache_mode=describe)
DATABASE_URL=postgresql://user:pass@host:5432/db?statement_cache_mode=describe
```

**Pros:**
- ✅ Immediate fix
- ✅ No code changes

**Cons:**
- ⚠️ Slightly slower queries (no prepared statement benefits)

---

### Option 2: Use Connection Pool Settings (Recommended)

Update your database configuration to properly handle connection pooling:

**In `backend/database/connection.go` or wherever you initialize the DB:**

```go
import (
    "github.com/jackc/pgx/v5/pgxpool"
)

func InitDB(databaseURL string) (*pgxpool.Pool, error) {
    config, err := pgxpool.ParseConfig(databaseURL)
    if err != nil {
        return nil, err
    }

    // Configure connection pool
    config.MaxConns = 25                    // Maximum connections
    config.MinConns = 5                     // Minimum connections
    config.MaxConnLifetime = 30 * time.Minute  // Recycle connections
    config.MaxConnIdleTime = 5 * time.Minute   // Close idle connections

    // IMPORTANT: Disable automatic prepared statement caching
    config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

    pool, err := pgxpool.NewWithConfig(context.Background(), config)
    if err != nil {
        return nil, err
    }

    return pool, nil
}
```

**Pros:**
- ✅ Prevents statement conflicts
- ✅ Better connection lifecycle management
- ✅ Production-ready

**Cons:**
- ⚠️ Requires code changes and redeployment

---

### Option 3: Use Query Context with Explicit Mode (Best Practice)

For specific queries that have issues, use explicit query mode:

```go
// Instead of:
row := db.QueryRow(query, args...)

// Use:
row := db.QueryRowContext(
    context.Background(),
    query,
    args...,
)
```

---

## 🚀 Immediate Action

### Step 1: Update Database URL

**For Supabase (your current setup):**
```bash
# In .env.production
DATABASE_URL=postgresql://postgres.project:password@aws.pooler.supabase.com:5432/postgres?statement_cache_mode=describe

# Or disable completely:
DATABASE_URL=postgresql://postgres.project:password@aws.pooler.supabase.com:5432/postgres?statement_cache_mode=disable
```

### Step 2: Restart Backend

```bash
# If using Docker
docker-compose down && docker-compose up -d

# If running directly
pkill onetimer-backend
go build -o onetimer-backend cmd/onetimer-backend/main.go
./onetimer-backend
```

### Step 3: Monitor Sentry

Watch for the error to stop appearing:
```
ERROR: prepared statement "stmtcache_..." already exists
```

---

## 🧪 Test the Fix

```bash
# Get a valid JWT token
TOKEN="your-jwt-token"

# Test the affected endpoint multiple times
for i in {1..10}; do
  echo "Request $i:"
  curl -s http://localhost:3000/api/user/profile \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  sleep 0.5
done
```

**Expected:** All requests succeed without prepared statement errors

---

## 📊 Why This Happens

1. **Connection Pooling:** Your app reuses database connections
2. **Statement Caching:** pgx caches prepared statements per connection
3. **Connection Recycling:** When a connection is returned to pool, cached statements remain
4. **Name Collision:** Next query tries to prepare same statement name → ERROR

**The Fix:** Either:
- Disable caching entirely (`statement_cache_mode=disable`)
- Use describe mode (`statement_cache_mode=describe`) - safer, still fast
- Properly manage connection lifecycle with pool settings

---

## 🎯 Recommendation

**For Production:**
Use `statement_cache_mode=describe` in your `DATABASE_URL`

**Why?**
- ✅ Fixes the error
- ✅ Still benefits from some query optimization
- ✅ No code changes needed
- ✅ Works immediately

**Update your Render.com environment variable:**
1. Go to Render.com dashboard
2. Navigate to your backend service
3. Go to **Environment** tab
4. Update `DATABASE_URL` to include `?statement_cache_mode=describe`
5. Click **Save Changes**
6. Render will automatically redeploy

---

## 📝 Long-term Solution

Eventually, update your DB initialization code (Option 2 above) for better control over connection pooling and statement caching.

**File to update:** `backend/database/connection.go` or similar DB setup file
