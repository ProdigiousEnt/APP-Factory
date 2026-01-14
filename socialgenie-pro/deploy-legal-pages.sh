#!/bin/bash
# Deploy SocialGenie Pro legal documentation to GitHub Pages

set -e

echo "🚀 Deploying SocialGenie Pro legal documentation..."

# Navigate to APP Factory root
cd "/Users/dennisharrington/Documents/APP Factory"

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Create docs structure for GitHub Pages
echo "📁 Creating docs structure..."
mkdir -p docs/socialgenie-pro

# Copy legal files
echo "📄 Copying legal files..."
cp socialgenie-pro/privacy-policy.html docs/socialgenie-pro/
cp socialgenie-pro/terms-of-use.html docs/socialgenie-pro/

# Add and commit
echo "💾 Committing changes..."
git add docs/socialgenie-pro/
git commit -m "Add SocialGenie Pro legal documentation for App Store submission" || echo "No changes to commit"

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "⚠️  No remote 'origin' found. Creating GitHub repository..."
    gh repo create app-factory --public --source=. --remote=origin --push
else
    echo "📤 Pushing to GitHub..."
    git push -u origin main || git push -u origin master
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Enable GitHub Pages at: https://github.com/dennisharrington/app-factory/settings/pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main (or master)"
echo "   - Folder: /docs"
echo ""
echo "2. Your legal pages will be available at:"
echo "   - Privacy Policy: https://dennisharrington.github.io/app-factory/socialgenie-pro/privacy-policy.html"
echo "   - Terms of Use: https://dennisharrington.github.io/app-factory/socialgenie-pro/terms-of-use.html"
echo ""
echo "3. The Paywall component is already configured with these URLs!"
