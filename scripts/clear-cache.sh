#!/bin/bash

echo "🧹 Clearing Next.js cache and build artifacts..."

# Stop any running Next.js development servers
echo "Stopping any running Next.js development servers..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true

# Remove build cache
echo "Removing .next directory..."
rm -rf .next

# Remove Turbopack cache
echo "Removing .turbo directory..."
rm -rf .turbo

# Remove node_modules cache
echo "Removing node_modules cache..."
rm -rf node_modules/.cache
rm -rf node_modules/.next

# Clear npm cache (optional)
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

echo "✅ Cache cleared successfully!"
echo ""
echo "You can now restart your development server with:"
echo "  npm run dev        (without Turbopack - stable)"
echo "  npm run dev:turbo  (with Turbopack - faster but may have caching issues)"
echo "  npm run dev:safe   (same as npm run dev)"
echo ""
