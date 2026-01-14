# ⚠️ CRITICAL: GitHub Repository Information

## NEVER CREATE A NEW REPOSITORY

**The correct repository is:** `ProdigiousEnt/APP-Factory`

**Repository URL:** https://github.com/ProdigiousEnt/APP-Factory

## Deployment Instructions for Legal Pages

### Step 1: Navigate to APP Factory Root
```bash
cd "/Users/dennisharrington/Documents/APP Factory"
```

### Step 2: Set Correct Remote (if not already set)
```bash
git remote remove origin  # Remove incorrect remote if exists
git remote add origin https://github.com/ProdigiousEnt/APP-Factory.git
```

### Step 3: Create docs structure and copy legal files
```bash
mkdir -p docs/socialgenie-pro
cp socialgenie-pro/privacy-policy.html docs/socialgenie-pro/
cp socialgenie-pro/terms-of-use.html docs/socialgenie-pro/
```

### Step 4: Commit and Push
```bash
git add docs/socialgenie-pro/
git commit -m "Add SocialGenie Pro legal documentation"
git pull origin main --rebase  # Pull latest changes first
git push origin main
```

### Step 5: Enable GitHub Pages
1. Go to: https://github.com/ProdigiousEnt/APP-Factory/settings/pages
2. Source: "Deploy from a branch"
3. Branch: "main"
4. Folder: "/docs"
5. Click "Save"

### Step 6: Update Paywall.tsx URLs
Once GitHub Pages is deployed, the URLs will be:
- Privacy Policy: `https://prodigiousent.github.io/APP-Factory/socialgenie-pro/privacy-policy.html`
- Terms of Use: `https://prodigiousent.github.io/APP-Factory/socialgenie-pro/terms-of-use.html`

**Current Paywall.tsx has incorrect URL and needs to be updated!**

## Current Status
❌ Wrong repo was created (Almostcivilized/app-factory) - needs to be deleted
❌ Paywall.tsx has wrong URL
⏳ Need to push to correct repo: ProdigiousEnt/APP-Factory
⏳ Need to enable GitHub Pages on correct repo
⏳ Need to update Paywall.tsx with correct URLs
