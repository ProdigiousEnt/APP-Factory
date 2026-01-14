# GitHub Pages Deployment Guide

## Overview
This guide explains how to deploy the legal documentation (privacy-policy.html and terms-of-use.html) to GitHub Pages under a centralized APP Factory repository.

## Steps

### 1. Initialize Git Repository (if not already done)
```bash
cd "/Users/dennisharrington/Documents/APP Factory"
git init
```

### 2. Create GitHub Repository
```bash
gh repo create app-factory --public --source=. --remote=origin
```

### 3. Copy Legal Files to Root
```bash
# Create a docs folder for GitHub Pages
mkdir -p docs/socialgenie-pro

# Copy legal files
cp socialgenie-pro/privacy-policy.html docs/socialgenie-pro/
cp socialgenie-pro/terms-of-use.html docs/socialgenie-pro/
```

### 4. Commit and Push
```bash
git add docs/
git commit -m "Add SocialGenie Pro legal documentation"
git push -u origin main
```

### 5. Enable GitHub Pages
1. Go to https://github.com/dennisharrington/app-factory/settings/pages
2. Under "Source", select "Deploy from a branch"
3. Select branch: `main`
4. Select folder: `/docs`
5. Click "Save"

### 6. Verify Deployment
After a few minutes, your legal pages will be available at:
- Privacy Policy: `https://dennisharrington.github.io/app-factory/socialgenie-pro/privacy-policy.html`
- Terms of Use: `https://dennisharrington.github.io/app-factory/socialgenie-pro/terms-of-use.html`

### 7. Update Paywall Component
Once deployed, update the Privacy Policy URL in `components/Paywall.tsx`:
```typescript
onClick={() => handleOpenLink('https://dennisharrington.github.io/app-factory/socialgenie-pro/privacy-policy.html')}
```

## Current Status
✅ Legal files created in socialgenie-pro directory
⏳ Waiting for GitHub Pages deployment
⏳ Need to update Paywall.tsx with final URL

## Alternative: Quick Deploy Script
```bash
#!/bin/bash
cd "/Users/dennisharrington/Documents/APP Factory"

# Initialize if needed
if [ ! -d ".git" ]; then
    git init
    gh repo create app-factory --public --source=. --remote=origin
fi

# Create docs structure
mkdir -p docs/socialgenie-pro
cp socialgenie-pro/privacy-policy.html docs/socialgenie-pro/
cp socialgenie-pro/terms-of-use.html docs/socialgenie-pro/

# Commit and push
git add docs/
git commit -m "Add SocialGenie Pro legal documentation"
git push -u origin main

echo "✅ Deployed! Enable GitHub Pages at: https://github.com/dennisharrington/app-factory/settings/pages"
```
