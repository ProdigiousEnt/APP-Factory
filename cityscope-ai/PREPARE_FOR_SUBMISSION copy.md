# App Factory: App Store Submission Guide

**Version:** 1.0  
**Last Updated:** January 13, 2026  
**Applies To:** All App Factory apps

---

## Table of Contents

1. [Repository Architecture](#repository-architecture)
2. [Age Rating Guidelines](#age-rating-guidelines)
3. [Monetization Strategy](#monetization-strategy)
4. [Legal Documentation Requirements](#legal-documentation-requirements)
5. [App Store Connect Checklist](#app-store-connect-checklist)
6. [RevenueCat Configuration](#revenuecat-configuration)
7. [Common Rejection Issues](#common-rejection-issues)
8. [App Review Notes Template](#app-review-notes-template)

---

## Repository Architecture

### Public/Private Repository Split

The App Factory uses a **dual-repository architecture** to maintain code privacy while providing public access to legal documentation.

#### 🔒 Private Repository: `APP-Factory-Private`

**URL:** `https://github.com/ProdigiousEnt/APP-Factory-Private.git`

**Contains:**
- All source code for every app
- Development files and configurations
- Environment files (`.env.local`)
- Build artifacts (`dist/`, `ios/`, `node_modules/`)

**Structure:**
```
APP-Factory-Private/
├── .gitignore                    # Excludes app dirs from public repo
├── .github/workflows/            # CI/CD and monitoring
├── docs/                         # Legal documentation (synced to public)
│   ├── socialgenie-pro/
│   ├── cityscope-ai/
│   ├── splitsmart/
│   ├── vibepaper/
│   └── zensynth-ai-meditation/
├── socialgenie-pro/              # ❌ Excluded from public repo
├── cityscope-ai/                 # ❌ Excluded from public repo
├── splitsmart/                   # ❌ Excluded from public repo
├── vibepaper/                    # ❌ Excluded from public repo
└── zensynth-ai-meditation/       # ❌ Excluded from public repo
```

#### 🌐 Public Repository: `APP-Factory`

**URL:** `https://github.com/ProdigiousEnt/APP-Factory.git`  
**GitHub Pages:** `https://prodigiousent.github.io/APP-Factory/`

**Contains:**
- Legal documentation ONLY
- Privacy policies, terms of use, support pages
- Publicly accessible via GitHub Pages

**Structure:**
```
APP-Factory/
├── .nojekyll                     # Disables Jekyll processing
├── docs/                         # Nested structure (legacy)
│   ├── socialgenie-pro/
│   ├── cityscope-ai/
│   ├── splitsmart/
│   └── vibepaper/
├── socialgenie-pro/              # Root-level (for URL compatibility)
├── cityscope-ai/
├── splitsmart/
└── vibepaper/
```

### Legal Documentation URL Patterns

Each app's legal documentation is accessible via GitHub Pages:

**URL Format:**
```
https://prodigiousent.github.io/APP-Factory/{app-name}/{document}.html
```

**Examples:**
- Privacy Policy: `https://prodigiousent.github.io/APP-Factory/vibepaper/privacy-policy.html`
- Support Page: `https://prodigiousent.github.io/APP-Factory/vibepaper/support.html`
- Terms of Use: `https://prodigiousent.github.io/APP-Factory/vibepaper/terms-of-use.html`

### Updating Legal Documentation

1. **Edit in Private Repo:**
   ```bash
   cd /path/to/APP-Factory-Private
   vim docs/{app-name}/privacy-policy.html
   git add docs/
   git commit -m "Update {app-name} privacy policy"
   git push
   ```

2. **Sync to Public Repo:**
   ```bash
   cd /path/to/APP-Factory
   cp -r ../APP-Factory-Private/docs/{app-name}/ {app-name}/
   git add {app-name}/
   git commit -m "Sync {app-name} legal docs from private repo"
   git push
   ```

3. **Verify GitHub Pages:**
   - Wait 1-2 minutes for rebuild
   - Test URLs in browser
   - Confirm 200 OK status (not 404)

---

## Age Rating Guidelines

### Recommended Ratings by App Type

| App Type | Recommended Rating | Key Reason |
|----------|-------------------|------------|
| **AI Image Generation** (Gemini 2.5 Flash) | **12+** | Infrequent mature/suggestive themes (artistic) |
| **AI Text Generation** | **9+** | Text-only, mild innuendo possible |
| **City/Venue Discovery** | **9+** | Venue recommendations (bars, nightlife) |
| **Utility Apps** (Receipt scanner, etc.) | **4+** | No mature content |

### Gemini 2.5 Flash Safety Filters

**What Gemini BLOCKS (Always Active):**
- Explicit nudity and sexual content
- Child safety violations
- Graphic violence and harmful content
- Hate speech and illegal activities

**What Gemini ALLOWS (Artistic Content):**
- Sexual innuendo, sensual or suggestive imagery
- Censored or implied nudity (classical art style)
- Dark, gothic, or horror aesthetics
- Fashion/swimwear content

### Age Rating Questionnaire Answers

#### For AI Image Generation Apps (12+ Rating)

| Category | Question | Answer |
|----------|----------|--------|
| **In-App Controls** | Parental Controls | No |
| **In-App Controls** | Age Assurance | No |
| **Capabilities** | Unrestricted Web Access | No |
| **Capabilities** | User-Generated Content | No |
| **Capabilities** | Messaging and Chat | No |
| **Capabilities** | Advertising | No (unless you have ads) |
| **Mature Themes** | Profanity or Crude Humor | None |
| **Mature Themes** | Horror/Fear Themes | Infrequent/Mild |
| **Mature Themes** | Alcohol/Tobacco/Drug References | None |
| **Sexuality or Nudity** | Mature or Suggestive Themes | **Infrequent/Mild** ✅ |
| **Sexuality or Nudity** | Sexual Content or Nudity | None |
| **Sexuality or Nudity** | Graphic Sexual Content | None |
| **Violence** | Cartoon or Fantasy Violence | Infrequent/Mild |
| **Violence** | Realistic Violence | None |
| **Violence** | Prolonged Graphic Violence | None |
| **Violence** | Guns or Other Weapons | None |
| **Medical/Wellness** | Medical Information | None |
| **Medical/Wellness** | Health Topics | None |
| **Chance-Based** | Gambling | None |
| **Chance-Based** | Simulated Gambling | None |
| **Chance-Based** | Contests | None |
| **Chance-Based** | Loot Boxes | None |

**Expected Rating:** 12+

#### For AI Text Generation Apps (9+ Rating)

Same as above, but:
- **Mature or Suggestive Themes:** Infrequent/Mild
- **Profanity or Crude Humor:** Infrequent/Mild

**Expected Rating:** 9+

#### For Utility Apps (4+ Rating)

All categories: **None** or **Not Applicable**

**Expected Rating:** 4+

---

## Monetization Strategy

### Fleet-Wide Subscription Model

**Standard Pricing:** $4.99/month  
**Exception:** SplitSmart remains at $4.99/year (tax seasonality)

### Product Naming Convention

```
{app_slug}_pro_monthly
```

**Examples:**
- `vibepaper_pro_monthly`
- `socialgenie_pro_monthly`
- `cityscope_pro_monthly`

### RevenueCat Entitlement

**Standard Entitlement:** `pro`

All monthly products should map to the same `pro` entitlement in RevenueCat.

### Batch Release Strategy

**Batch #1 Launch:** Early February 2026

**Apps in Batch:**
- SocialGenie Pro
- CityScope AI
- VibePaper
- MemeGenius (in development)

**Process:**
1. Set all apps to **Manual Release** in App Store Connect
2. Wait for all apps to reach "Ready for Distribution"
3. Manually release all apps simultaneously
4. Coordinated marketing announcement

---

## Legal Documentation Requirements

### Required Documents

Every app must have:

1. **Privacy Policy** (`privacy-policy.html`)
2. **Support Page** (`support.html` or `{app}_support.html`)
3. **Terms of Use** (optional - can use Apple Standard EULA)

### Fleet-Wide Standards

**Support Email:** `appfactory1970@gmail.com`

**Privacy Policy Must Include:**
- Information collected (device identifiers, usage data)
- How information is used
- Third-party services (Google Gemini, RevenueCat, Supabase)
- Data storage and retention
- User rights (access, deletion, opt-out)
- Children's privacy (COPPA compliance)
- Contact information

**Support Page Must Include:**
- App description and features
- How to use the app
- Common questions/troubleshooting
- Contact information
- Links to Privacy Policy and Terms

### GitHub Pages Deployment

1. **Create legal docs** in private repo: `docs/{app-name}/`
2. **Copy to public repo** at root level: `{app-name}/`
3. **Verify URLs** are accessible
4. **Update App Store Connect** with correct URLs

---

## App Store Connect Checklist

### App Information

- [ ] **App Name:** Matches bundle display name
- [ ] **Subtitle:** Concise feature description (30 chars max)
- [ ] **Privacy Policy URL:** `https://prodigiousent.github.io/APP-Factory/{app-name}/privacy-policy.html`
- [ ] **Support URL:** `https://prodigiousent.github.io/APP-Factory/{app-name}/support.html`
- [ ] **Marketing URL:** (Optional)
- [ ] **Category:** Primary and Secondary
- [ ] **Content Rights:** Check if app uses third-party content

### Age Rating

- [ ] Complete age rating questionnaire
- [ ] Verify calculated rating matches expectations
- [ ] Override to higher rating if needed (e.g., EULA requirements)
- [ ] Save and confirm rating displays correctly

### Pricing and Availability

- [ ] **Price:** Free (with in-app purchases)
- [ ] **Availability:** All territories (or select specific)
- [ ] **Pre-Order:** Not applicable (for initial release)

### In-App Purchases

#### Subscription Group Setup

- [ ] Create subscription group: `{App Name} Pro`
- [ ] **Group Display Name:** `{App Name} Pro`
- [ ] **Privacy Policy URL:** Same as app-level
- [ ] **Terms of Use:** Apple Standard EULA (or custom URL)

#### Monthly Subscription Product

- [ ] **Reference Name:** `{App Name} Pro Monthly`
- [ ] **Product ID:** `{app_slug}_pro_monthly`
- [ ] **Type:** Auto-Renewable Subscription
- [ ] **Duration:** 1 month
- [ ] **Price:** $4.99 (Tier 5)
- [ ] **Localization (English - U.S.):**
  - Display Name: `{App Name} Pro`
  - Description: Clear description of benefits
- [ ] **Review Screenshot:** Paywall screenshot showing price and terms
- [ ] **Review Notes:** Brief explanation of subscription value

### App Privacy

Complete the App Privacy questionnaire:

- [ ] **Data Types Collected:**
  - Device ID (for analytics)
  - Usage Data (for feature improvement)
  - User Content (AI prompts - not linked to user)
- [ ] **Data Usage:**
  - Analytics
  - App Functionality
  - Product Personalization
- [ ] **Third-Party Partners:**
  - Google (Gemini AI)
  - RevenueCat (Subscriptions)
  - Supabase (Optional - if used)

### Version Information

- [ ] **Version Number:** Matches Xcode (e.g., 1.0)
- [ ] **Build Number:** Matches Xcode (e.g., 1, 2, 3...)
- [ ] **What's New:** Release notes for updates (not needed for v1.0)
- [ ] **Copyright:** `© 2026 Prodigious Entertainment`

### App Review Information

- [ ] **Contact Information:**
  - First Name: Dennis
  - Last Name: Harrington
  - Email: `appfactory1970@gmail.com`
- [ ] **Demo Account:** (If app requires login)
- [ ] **Notes:** Comprehensive review notes (see template below)
- [ ] **Attachments:** Additional screenshots or documentation

### Screenshots

**Required Sizes:**
- iPhone 6.9" (iPhone 16 Pro Max): 1320 x 2868
- iPhone 6.7" (iPhone 15 Pro Max): 1290 x 2796
- iPad Pro 13" (6th gen): 2048 x 2732

**Recommended:**
- 3-5 screenshots per device type
- Show key features and paywall
- Include captions explaining features

---

## RevenueCat Configuration

### Dashboard Setup

1. **Create Project** (if new app)
   - Project Name: `{App Name}`
   - Platform: iOS

2. **Configure App**
   - Bundle ID: `com.{company}.{app-slug}`
   - App-Specific Shared Secret: From App Store Connect

3. **Create Entitlement**
   - Entitlement ID: `pro`
   - Display Name: `Pro`

4. **Import Products**
   - Import `{app_slug}_pro_monthly` from App Store Connect
   - Link to `pro` entitlement

5. **Create Offering**
   - Offering ID: `default`
   - Add monthly product as **Primary** package
   - Set as **Current** offering

### Code Integration

**Install SDK:**
```bash
npm install @revenuecat/purchases-capacitor
```

**Initialize in App:**
```typescript
import Purchases from '@revenuecat/purchases-capacitor';

await Purchases.configure({
  apiKey: 'appl_YOUR_API_KEY',
  appUserID: undefined // Anonymous users
});
```

**Check Subscription Status:**
```typescript
const { customerInfo } = await Purchases.getCustomerInfo();
const isPro = customerInfo.entitlements.active['pro'] !== undefined;
```

**Purchase Subscription:**
```typescript
const offerings = await Purchases.getOfferings();
const monthlyPackage = offerings.current?.availablePackages[0];

if (monthlyPackage) {
  const { customerInfo } = await Purchases.purchasePackage({
    aPackage: monthlyPackage
  });
}
```

---

## Common Rejection Issues

### Guideline 2.1 - App Completeness

**Issue:** Broken links, 404 errors, missing functionality

**Solutions:**
- ✅ Verify all legal links work (Privacy Policy, Terms, Support)
- ✅ Test paywall displays correctly
- ✅ Ensure subscription purchase flow works
- ✅ Test on physical device, not just simulator

### Guideline 3.1.2 - Subscriptions

**Issue:** Missing subscription metadata, unclear pricing, missing legal links

**Solutions:**
- ✅ Add Privacy Policy URL to subscription group
- ✅ Add Terms of Use (or use Apple Standard EULA)
- ✅ Ensure paywall shows:
  - Clear pricing ($4.99/month)
  - Duration (monthly)
  - Auto-renewal disclaimer
  - Functional legal links at bottom

### Guideline 1.5 - Safety

**Issue:** Support URL not working or missing

**Solutions:**
- ✅ Verify Support URL returns 200 OK (not 404)
- ✅ Support page must include contact information
- ✅ Email must be functional: `appfactory1970@gmail.com`

### Guideline 2.3.6 - Accurate Metadata

**Issue:** Age rating doesn't match content

**Solutions:**
- ✅ For AI image apps: Rate 12+ (not 4+)
- ✅ Answer questionnaire accurately
- ✅ Select "Infrequent/Mild Mature or Suggestive Themes"
- ✅ Explain in App Review Notes why rating is appropriate

### Guideline 4.3 - Spam

**Issue:** Too similar to other apps, minimal functionality

**Solutions:**
- ✅ Differentiate each app clearly
- ✅ Unique value proposition in description
- ✅ Different UI/UX for each app
- ✅ Avoid copy-paste descriptions

---

## App Review Notes Template

Use this template in the "Notes" field of App Review Information:

```
APP OVERVIEW:

[App Name] is an AI-powered [description] that uses Google Gemini 2.5 Flash 
to [primary function]. The app provides [key benefit] for users who want to 
[use case].

---

SUBSCRIPTION INFORMATION:

Product: [App Name] Pro Monthly
Price: $4.99/month
Entitlement: Unlimited [feature] access

The subscription is managed through RevenueCat and follows Apple's 
auto-renewable subscription guidelines. All required information 
(pricing, duration, auto-renewal terms, and legal links) is displayed 
on the paywall.

---

LEGAL DOCUMENTATION:

All legal documentation is publicly accessible via GitHub Pages:

- Privacy Policy: https://prodigiousent.github.io/APP-Factory/[app-name]/privacy-policy.html
- Support Page: https://prodigiousent.github.io/APP-Factory/[app-name]/support.html
- Terms of Use: Apple Standard EULA

Support Email: appfactory1970@gmail.com

---

AGE RATING EXPLANATION:

This app is rated [12+/9+/4+] because:
- [Reason 1 - e.g., AI may generate artistic/suggestive content]
- [Reason 2 - e.g., Google Gemini has built-in safety filters]
- [Reason 3 - e.g., No user-generated content or community features]

This rating aligns with similar apps:
- DALL-E (ChatGPT): 12+
- [Other comparable apps]

---

CONTENT SAFETY (For AI Image Apps):

Google Gemini 2.5 Flash includes industry-leading safety filters that 
automatically block:
- Explicit nudity and sexual content
- Child safety violations
- Graphic violence and harmful content
- Hate speech and illegal activities

The app does NOT actively promote mature content generation. Any artistic 
or suggestive content is generated based on user prompts and is within 
the bounds of the [12+] age rating.

---

TESTING INSTRUCTIONS:

Recommended Test Prompts (Safe Content):
1. "[Example prompt 1]"
2. "[Example prompt 2]"
3. "[Example prompt 3]"

To Access Paywall:
1. Launch app
2. Tap "[Button name]" in top-right corner
3. Paywall modal displays with pricing and legal links

Subscription Testing:
- RevenueCat is configured for sandbox testing
- Test subscription will be available during review
- No actual charges will occur

---

ADDITIONAL NOTES:

[Any app-specific information, known issues, or special instructions]

Thank you for your review!
```

---

## Pre-Submission Verification Checklist

Before clicking "Submit for Review":

### Technical Verification

- [ ] App builds and runs on physical device
- [ ] All features work as expected
- [ ] No crashes or critical bugs
- [ ] Paywall displays correctly
- [ ] Subscription purchase flow works (sandbox)
- [ ] Legal links open correctly
- [ ] Support email is functional

### App Store Connect Verification

- [ ] Age rating is correct
- [ ] Privacy Policy URL works (200 OK, not 404)
- [ ] Support URL works (200 OK, not 404)
- [ ] Subscription group has Privacy Policy URL
- [ ] Subscription group has Terms of Use
- [ ] App Review Notes are comprehensive
- [ ] Screenshots are uploaded for all required sizes
- [ ] App description is clear and accurate
- [ ] Keywords are relevant (max 100 chars)

### RevenueCat Verification

- [ ] Product imported and linked to `pro` entitlement
- [ ] Offering is set to **Current**
- [ ] Monthly package is **Primary**
- [ ] Sandbox testing works
- [ ] API key is correct in app code

### Legal Documentation Verification

- [ ] Privacy Policy is live on GitHub Pages
- [ ] Support page is live on GitHub Pages
- [ ] Terms of Use is live (or using Apple Standard EULA)
- [ ] All URLs use correct format: `https://prodigiousent.github.io/APP-Factory/{app-name}/`
- [ ] Support email is `appfactory1970@gmail.com`

---

## Post-Submission Actions

### If Approved

1. **Manual Release (Batch #1 Apps):**
   - Do NOT release immediately
   - Wait for all Batch #1 apps to be approved
   - Coordinate simultaneous release

2. **Standard Release:**
   - App goes live automatically (if not set to Manual Release)
   - Monitor for user feedback
   - Check RevenueCat dashboard for subscriptions

### If Rejected

1. **Read Rejection Carefully:**
   - Note specific guideline violations
   - Check attached screenshots/videos from Apple

2. **Fix Issues:**
   - Address each rejection reason
   - Test fixes thoroughly
   - Update App Review Notes to explain fixes

3. **Resubmit:**
   - Increment build number (if code changes)
   - Update "What's New" to mention fixes
   - Resubmit for review

---

## Quick Reference

### Important URLs

- **Private Repo:** `https://github.com/ProdigiousEnt/APP-Factory-Private.git`
- **Public Repo:** `https://github.com/ProdigiousEnt/APP-Factory.git`
- **GitHub Pages:** `https://prodigiousent.github.io/APP-Factory/`
- **App Store Connect:** `https://appstoreconnect.apple.com`
- **RevenueCat Dashboard:** `https://app.revenuecat.com`

### Contact Information

- **Support Email:** `appfactory1970@gmail.com`
- **Developer:** Prodigious Entertainment
- **Copyright:** `© 2026 Prodigious Entertainment`

### Standard Pricing

- **Monthly Subscription:** $4.99/month (Tier 5)
- **Exception (SplitSmart):** $4.99/year

### Standard Entitlement

- **RevenueCat Entitlement ID:** `pro`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 13, 2026 | Initial version - Comprehensive submission guide |

---

**End of Document**

For app-specific guidance, refer to individual app KIs in the knowledge base.
