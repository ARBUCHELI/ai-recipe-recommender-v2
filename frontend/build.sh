#!/bin/bash

echo "🚀 Starting NutriAgent AI Frontend Build for Render..."

# Set Node.js environment
export NODE_ENV=production

# Show environment info
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo "🔧 Environment: $NODE_ENV"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --only=production --no-audit

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build
echo "✅ Build completed!"
echo "📂 Build output:"
ls -la dist/

# Show bundle size info
if [ -d "dist" ]; then
    echo "📊 Bundle size analysis:"
    du -sh dist/*
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "🎉 Frontend build completed successfully!"