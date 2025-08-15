#!/bin/bash

# Render Deployment Script for Catalyst Education Platform
echo "🚀 Starting Render deployment for Catalyst Education..."

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ VITE_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ VITE_SUPABASE_ANON_KEY not set"
    exit 1
fi

echo "✅ Environment variables verified"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Test health endpoint exists
if [ ! -f "dist/health.json" ]; then
    echo "⚠️  Health endpoint not found, creating..."
    echo '{"status":"healthy","version":"1.0.0","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > dist/health.json
fi

echo "🎓 Catalyst Education Platform ready for deployment!"
echo "📊 Build size: $(du -sh dist | cut -f1)"
echo "🔗 Health check: /health.json"
