# Repository Architecture: Public/Private Split Strategy

## Overview

The **App Factory** uses a **dual-repository architecture** to maintain code privacy while providing public access to legal documentation required for App Store compliance.

## Repository Structure

### 🔒 Private Repository: `APP-Factory-Private`
**Location:** `https://github.com/ProdigiousEnt/APP-Factory-Private.git`

**Purpose:** Contains all source code for the App Factory fleet

**Structure:**
```
APP-Factory-Private/
├── .gitignore                    # Mono-repo gitignore (excludes app dirs from public repo)
├── .github/workflows/            # CI/CD and monitoring
├── docs/                         # Legal documentation (synced to public repo)
│   ├── socialgenie-pro/
│   │   ├── privacy-policy.html
│   │   └── support.html
│   ├── cityscope-ai/
│   │   ├── privacy-policy.html
│   │   └── support.html
│   ├── splitsmart/
│   │   ├── privacy-policy.html
│   │   └── support.html
│   ├── vibepaper/
│   │   ├── privacy-policy.html
│   │   └── vibepaper_support.html
│   └── zensynth-ai-meditation/
│       ├── privacy-policy.html
│       └── support.html
├── socialgenie-pro/              # ❌ Excluded from public repo
│   ├── App.tsx
│   ├── components/
│   ├── services/
│   └── ...
├── cityscope-ai/                 # ❌ Excluded from public repo
├── splitsmart/                   # ❌ Excluded from public repo
├── vibepaper/                    # ❌ Excluded from public repo
└── zensynth-ai-meditation/       # ❌ Excluded from public repo
```

### 🌐 Public Repository: `APP-Factory` (GitHub Pages)
**Location:** `https://github.com/ProdigiousEnt/APP-Factory.git`

**Purpose:** Hosts legal documentation publicly via GitHub Pages for App Store compliance

**Structure:**
```
APP-Factory/
├── docs/                         # ✅ Only legal docs (synced from private repo)
│   ├── socialgenie-pro/
│   ├── cityscope-ai/
│   ├── splitsmart/
│   ├── vibepaper/
│   └── zensynth-ai-meditation/
└── .gitignore                    # Excludes all app source directories
```

**GitHub Pages URL:** `https://prodigiousent.github.io/APP-Factory/`

## Why This Architecture?

### ✅ Benefits

1. **Code Privacy**: All proprietary source code remains private
2. **Public Legal Compliance**: Privacy policies and terms of service are publicly accessible as required by Apple App Store
3. **Single Source of Truth**: Legal docs maintained in one place (`docs/` in private repo)
4. **GitHub Pages Hosting**: Free, reliable hosting for legal documentation
5. **Mono-Repo Efficiency**: All apps managed in one repository for easier maintenance

### 🎯 App Store Requirements

Apple requires:
- **Privacy Policy URL**: Must be publicly accessible
- **Support URL**: Must be publicly accessible
- **Terms of Use URL**: Must be publicly accessible (for subscriptions)

These URLs are embedded in:
- App Store Connect metadata
- In-app paywall modals (legal links)
- RevenueCat subscription configuration

## Public URL Patterns

Each app's legal documentation is accessible via GitHub Pages:

### SocialGenie Pro
- **Privacy Policy**: `https://prodigiousent.github.io/APP-Factory/socialgenie-pro/privacy-policy.html`
- **Support**: `https://prodigiousent.github.io/APP-Factory/socialgenie-pro/support.html`

### CityScope AI
- **Privacy Policy**: `https://prodigiousent.github.io/APP-Factory/cityscope-ai/privacy-policy.html`
- **Support**: `https://prodigiousent.github.io/APP-Factory/cityscope-ai/support.html`

### SplitSmart
- **Privacy Policy**: `https://prodigiousent.github.io/APP-Factory/splitsmart/privacy-policy.html`
- **Support**: `https://prodigiousent.github.io/APP-Factory/splitsmart/support.html`

### VibePaper
- **Privacy Policy**: `https://prodigiousent.github.io/APP-Factory/vibepaper/privacy-policy.html`
- **Support**: `https://prodigiousent.github.io/APP-Factory/vibepaper/vibepaper_support.html`

### ZenSynth AI Meditation
- **Privacy Policy**: `https://prodigiousent.github.io/APP-Factory/zensynth-ai-meditation/privacy-policy.html`
- **Support**: `https://prodigiousent.github.io/APP-Factory/zensynth-ai-meditation/support.html`

## Workflow: Updating Legal Documentation

### 1. Update in Private Repo
Edit the legal documentation in the private repository:
```bash
# Navigate to private repo
cd /Users/dennisharrington/Documents/APP\ Factory/vibepaper

# Edit legal docs
vim docs/vibepaper/privacy-policy.html

# Commit changes
git add docs/
git commit -m "Update VibePaper privacy policy"
git push
```

### 2. Sync to Public Repo
The `docs/` directory must be manually synced to the public repository:

```bash
# Copy docs to public repo
cp -r docs/ /path/to/APP-Factory/docs/

# Navigate to public repo
cd /path/to/APP-Factory

# Commit and push
git add docs/
git commit -m "Sync legal docs from private repo"
git push
```

> **Note**: GitHub Pages automatically rebuilds when changes are pushed to the public repo.

## .gitignore Strategy

### Private Repo `.gitignore`
The private repo's `.gitignore` **excludes app source directories** to prevent accidental commits to the public repo:

```gitignore
# App directories (managed separately or local only)
socialgenie-pro/
cityscope-ai/
splitsmart/
vibepaper/
zensynth-ai-meditation/
Triviarc/
_Blueprints/

# iOS/Xcode (Capacitor generates these, don't commit)
ios/

# Environment files (contains API keys)
.env.local
.env.*.local

# Build outputs
dist/
build/
node_modules/
```

### Public Repo `.gitignore`
The public repo's `.gitignore` **only allows the `docs/` directory**:

```gitignore
# Exclude everything except docs/
/*
!docs/
!.gitignore
!README.md
```

## Important Notes

### ⚠️ Never Commit Source Code to Public Repo
The `.gitignore` in the private repo is configured to prevent app source directories from being committed. **Do not modify this configuration** unless you understand the implications.

### 🔄 Sync Workflow is Manual
Currently, syncing `docs/` from private to public repo is a **manual process**. Consider automating this with GitHub Actions in the future.

### 📧 Fleet-Wide Support Email
All apps use the standardized support email: **`appfactory1970@gmail.com`**

### 🔗 Hardcoded URLs in Apps
Each app's paywall and App Store Connect metadata contains hardcoded GitHub Pages URLs. When updating legal docs, ensure:
1. Changes are committed to private repo
2. Changes are synced to public repo
3. GitHub Pages has rebuilt (usually within 1-2 minutes)
4. URLs are still accessible before submitting app updates

## Future Enhancements

### Automated Sync via GitHub Actions
Create a GitHub Action in the private repo to automatically sync `docs/` to the public repo on every commit:

```yaml
name: Sync Legal Docs to Public Repo
on:
  push:
    paths:
      - 'docs/**'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync to public repo
        # Implementation TBD
```

### Validation Script
Create a script to validate all legal documentation URLs are accessible:

```bash
#!/bin/bash
# validate_legal_urls.sh
apps=("socialgenie-pro" "cityscope-ai" "splitsmart" "vibepaper" "zensynth-ai-meditation")
for app in "${apps[@]}"; do
  curl -f "https://prodigiousent.github.io/APP-Factory/$app/privacy-policy.html" || echo "❌ $app privacy policy failed"
done
```

## Summary

This dual-repository architecture ensures:
- ✅ **Code remains private** in `APP-Factory-Private`
- ✅ **Legal docs are public** via GitHub Pages
- ✅ **App Store compliance** with publicly accessible URLs
- ✅ **Single source of truth** for all legal documentation
- ✅ **Mono-repo efficiency** for managing the entire App Factory fleet
