---
description: Managing dual git repositories (public legal docs + private source code)
---

# Git Dual-Repo Workflow for App Factory Fleet

## Overview
All App Factory apps use a **dual-repository strategy**:
- **Public Repo** (`origin`): `https://github.com/ProdigiousEnt/APP-Factory.git` - Contains ONLY legal documentation (privacy policies, terms of use) for GitHub Pages hosting
- **Private Repo** (`private`): `https://github.com/ProdigiousEnt/APP-Factory-Private.git` - Contains ALL source code and app files

## Repository Structure

### Root .gitignore (APP Factory/)
The root `.gitignore` excludes all app directories from the public repo:
```
# App directories (managed separately or local only)
socialgenie-pro/
cityscope-ai/
splitsmart/
vibepaper/
zensynth-ai-meditation/
Triviarc/
_Blueprints/
```

### Individual App .gitignore
Each app has its own `.gitignore` for build artifacts and dependencies:
```
node_modules/
dist/
*.log
.DS_Store
```

## Initial Setup (One-Time Per App)

### 1. Verify Remote Configuration
```bash
cd "/Users/dennisharrington/Documents/APP Factory/socialgenie-pro"
git remote -v
```

Expected output:
```
origin  https://github.com/ProdigiousEnt/APP-Factory.git (fetch)
origin  https://github.com/ProdigiousEnt/APP-Factory.git (push)
private https://github.com/ProdigiousEnt/APP-Factory-Private.git (fetch)
private https://github.com/ProdigiousEnt/APP-Factory-Private.git (push)
```

### 2. Add Private Remote (if not already configured)
```bash
git remote add private https://github.com/ProdigiousEnt/APP-Factory-Private.git
```

## Daily Workflow

### Checking Status
```bash
# Check current branch and uncommitted changes
git status

# View recent commits
git log --oneline -10

# Check all branches including remotes
git branch -a
```

### Making Changes

#### For Source Code Changes (Most Common)
```bash
# 1. Make your changes to source files
# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "Add feature X to SocialGenie Pro"

# 4. Push to PRIVATE repo only
git push private main
```

#### For Legal Documentation Changes
```bash
# 1. Make changes to privacy-policy.html or terms-of-use.html
# 2. Stage changes
git add privacy-policy.html terms-of-use.html

# 3. Commit with descriptive message
git commit -m "Update SocialGenie Pro privacy policy"

# 4. Push to BOTH repos
git push origin main
git push private main

# 5. Deploy to GitHub Pages (if needed)
./deploy-legal-pages.sh
```

### Syncing with Remote

#### Pull Latest Changes from Private Repo
```bash
# Fetch and rebase to avoid merge commits
git pull private main --rebase

# If conflicts occur, resolve them and continue
git rebase --continue
```

#### Pull Latest Changes from Public Repo
```bash
git pull origin main --rebase
```

### Handling Diverged Branches

If you see "rejected" when pushing:
```bash
# 1. Pull with rebase first
git pull private main --rebase

# 2. Resolve any conflicts if they occur
# 3. Push again
git push private main
```

## Common Scenarios

### Scenario 1: Adding a New App to the Fleet
```bash
# 1. Create app directory
cd "/Users/dennisharrington/Documents/APP Factory"
mkdir my-new-app
cd my-new-app

# 2. Initialize app files
# (create your source code, package.json, etc.)

# 3. Update root .gitignore to exclude new app from public repo
echo "my-new-app/" >> ../.gitignore

# 4. Commit and push to private repo only
cd ..
git add .
git commit -m "Add my-new-app to fleet"
git push private main
```

### Scenario 2: Updating Legal Docs for App Store Submission
```bash
# 1. Update privacy-policy.html and/or terms-of-use.html
# 2. Commit changes
git add privacy-policy.html terms-of-use.html
git commit -m "Update legal docs for App Store compliance"

# 3. Push to public repo for GitHub Pages
git push origin main

# 4. Also push to private repo for backup
git push private main

# 5. Deploy to GitHub Pages
./deploy-legal-pages.sh
```

### Scenario 3: Major Refactoring or Feature Addition
```bash
# 1. Create a feature branch (optional but recommended)
git checkout -b feature/new-ai-model

# 2. Make changes and commit
git add .
git commit -m "Integrate Gemini 2.5 Flash"

# 3. Push feature branch to private repo
git push private feature/new-ai-model

# 4. When ready, merge to main
git checkout main
git merge feature/new-ai-model

# 5. Push to private main
git push private main
```

### Scenario 4: Emergency Rollback
```bash
# 1. View commit history
git log --oneline -20

# 2. Reset to previous commit (replace COMMIT_HASH)
git reset --hard COMMIT_HASH

# 3. Force push to private repo (use with caution!)
git push private main --force
```

## Best Practices

### ✅ DO
- **Always push source code to `private` remote**
- **Push legal docs to both `origin` and `private`**
- **Use descriptive commit messages** (e.g., "Fix RevenueCat integration in SocialGenie Pro")
- **Pull with `--rebase`** to maintain clean history
- **Verify `.gitignore` excludes sensitive files** (API keys, certificates, etc.)
- **Commit frequently** with logical chunks of work

### ❌ DON'T
- **Never push source code to `origin` (public repo)**
- **Don't commit API keys, secrets, or certificates**
- **Don't force push to `main` unless absolutely necessary**
- **Don't commit `node_modules/` or `dist/` directories**
- **Don't use generic commit messages** like "update" or "fix"

## Verification Checklist

Before major pushes, verify:
- [ ] No sensitive data in commit (API keys, tokens, certificates)
- [ ] Pushing to correct remote (`private` for code, `origin` for legal docs)
- [ ] `.gitignore` properly configured
- [ ] Commit message is descriptive
- [ ] All tests pass (if applicable)
- [ ] Legal docs are up-to-date with app version

## Troubleshooting

### Problem: "Updates were rejected because the remote contains work that you do not have locally"
**Solution:**
```bash
git pull private main --rebase
git push private main
```

### Problem: "Access denied" when pushing to private repo
**Solution:**
```bash
# Verify GitHub authentication
git config --global user.name
git config --global user.email

# Re-authenticate with GitHub (may need to generate new token)
```

### Problem: Accidentally pushed source code to public repo
**Solution:**
```bash
# 1. Immediately remove from public repo
git push origin :main  # Delete remote branch

# 2. Force push only legal docs
git filter-branch --tree-filter 'rm -rf socialgenie-pro/' HEAD
git push origin main --force

# 3. Contact GitHub support if sensitive data was exposed
```

### Problem: Merge conflicts during rebase
**Solution:**
```bash
# 1. View conflicting files
git status

# 2. Manually resolve conflicts in editor
# 3. Stage resolved files
git add .

# 4. Continue rebase
git rebase --continue

# 5. If you want to abort
git rebase --abort
```

## Quick Reference

| Task | Command |
|------|---------|
| Check status | `git status` |
| View history | `git log --oneline -10` |
| Stage all changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push source code | `git push private main` |
| Push legal docs | `git push origin main && git push private main` |
| Pull latest | `git pull private main --rebase` |
| View remotes | `git remote -v` |
| View branches | `git branch -a` |
