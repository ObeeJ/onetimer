#!/bin/bash

# Run Supabase migrations
echo "🚀 Running Supabase migrations..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Initialize Supabase if not already done
if [ ! -f "supabase/config.toml" ]; then
    echo "📝 Initializing Supabase project..."
    supabase init
fi

# Run migrations
echo "📊 Applying database migrations..."
supabase db push

echo "✅ Migrations completed successfully!"

# Optional: Generate TypeScript types
echo "🔧 Generating TypeScript types..."
supabase gen types typescript --local > types/supabase.ts

echo "🎉 Phase 1 setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your Supabase connection string in .env"
echo "2. Test the new validation endpoints"
echo "3. Update frontend to use new API responses"
