#!/bin/bash

# Catalyst Education - Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting Catalyst Education Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is provided
if [ -z "$1" ]; then
    log_error "Environment not specified. Usage: ./deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

log_info "Deploying to: $ENVIRONMENT"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Check if required files exist
if [ ! -f ".env.$ENVIRONMENT" ]; then
    log_error "Environment file .env.$ENVIRONMENT not found"
    exit 1
fi

# Backup current deployment (if exists)
if [ -d "dist" ]; then
    log_info "Backing up current deployment..."
    mv dist "dist.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Install dependencies
log_info "Installing dependencies..."
npm ci --only=production

# Run tests (if they exist)
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    log_info "Running tests..."
    npm test || {
        log_error "Tests failed. Deployment aborted."
        exit 1
    }
fi

# Type checking
log_info "Running type check..."
npm run typecheck || {
    log_warning "Type check failed, but continuing..."
}

# Copy environment file
log_info "Setting up environment for $ENVIRONMENT..."
cp ".env.$ENVIRONMENT" .env

# Build the application
log_info "Building application for $ENVIRONMENT..."
npm run build || {
    log_error "Build failed. Deployment aborted."
    exit 1
}

# Validate build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    log_error "Build validation failed. dist/index.html not found."
    exit 1
fi

log_success "Build completed successfully!"

# Deploy based on environment
case $ENVIRONMENT in
    "staging")
        log_info "Deploying to staging..."
        # Add staging deployment commands here
        # Example: rsync -av dist/ user@staging-server:/var/www/html/
        ;;
    "production")
        log_info "Deploying to production..."
        # Add production deployment commands here
        # Example: rsync -av dist/ user@production-server:/var/www/html/
        ;;
esac

# Post-deployment checks
log_info "Running post-deployment checks..."

# Check if critical files exist
CRITICAL_FILES=("dist/index.html" "dist/assets")
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "dist/$file" ]; then
        log_error "Critical file missing: $file"
        exit 1
    fi
done

# Health check (if deployed to server)
# Uncomment and modify for your deployment
# if curl -f "https://your-domain.com/health" > /dev/null 2>&1; then
#     log_success "Health check passed"
# else
#     log_error "Health check failed"
#     exit 1
# fi

log_success "Deployment to $ENVIRONMENT completed successfully! 🎉"

# Optional: Cleanup old backups (keep last 5)
log_info "Cleaning up old backups..."
ls -t dist.backup.* 2>/dev/null | tail -n +6 | xargs rm -rf

log_info "Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Build Size: $(du -sh dist | cut -f1)"
echo "  Timestamp: $(date)"

log_success "Catalyst Education is now live! 🚀"
