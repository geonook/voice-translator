#!/bin/bash

# Voice Translator Extension Packaging Script
# This script creates a clean distribution package for Chrome Web Store

echo "🚀 Packaging Voice Translator Extension for Chrome Web Store..."

# Create dist directory
mkdir -p dist/voice-translator-extension

# Copy essential files only
echo "📁 Copying essential files..."
cp chrome-extension/manifest.json dist/voice-translator-extension/
cp chrome-extension/background.js dist/voice-translator-extension/
cp chrome-extension/content.js dist/voice-translator-extension/
cp chrome-extension/content.css dist/voice-translator-extension/
cp chrome-extension/popup.html dist/voice-translator-extension/
cp chrome-extension/popup.js dist/voice-translator-extension/
cp chrome-extension/popup.css dist/voice-translator-extension/

# Copy icons directory
echo "🎨 Copying icons..."
cp -r chrome-extension/icons dist/voice-translator-extension/

# Remove any debug files or unnecessary content
echo "🧹 Cleaning up..."
find dist/voice-translator-extension -name ".DS_Store" -delete
find dist/voice-translator-extension -name "*.log" -delete
find dist/voice-translator-extension -name "debug-*" -delete
find dist/voice-translator-extension -name "*test*" -delete

# Create ZIP file for Chrome Web Store
echo "📦 Creating ZIP package..."
cd dist/voice-translator-extension
zip -r ../voice-translator-extension.zip *
cd ../..

# Display package info
echo "✅ Package created successfully!"
echo "📍 Location: dist/voice-translator-extension.zip"
echo "📊 Package size: $(du -h dist/voice-translator-extension.zip | cut -f1)"
echo ""
echo "📋 Next steps:"
echo "1. Open create-png-icons.html to generate required PNG icons"
echo "2. Upload voice-translator-extension.zip to Chrome Web Store"
echo "3. Follow the checklist in PUBLISH_CHECKLIST.md"
echo ""
echo "🔗 Chrome Web Store Developer Dashboard:"
echo "https://chrome.google.com/webstore/devconsole"
