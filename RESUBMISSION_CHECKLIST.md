# VibePaper Resubmission Checklist

## ✅ COMPLETED: Phase 1 - GitHub Pages Fix

**Status:** All legal documentation URLs are now working!

- ✅ Privacy Policy: https://prodigiousent.github.io/APP-Factory/vibepaper/privacy-policy.html
- ✅ Support Page: https://prodigiousent.github.io/APP-Factory/vibepaper/vibepaper_support.html

---

## 🔄 NEXT: Phase 2 - App Store Connect Updates

### Step 1: Update Age Rating to 17+

**Location:** App Store Connect → App Information → Age Rating

**Action Required:**
1. Click "Edit" next to Age Rating
2. Retake the Age Rating Questionnaire
3. For the question about **"Sexual Content or Nudity"**:
   - Change from: "None"
   - Change to: **"Frequent/Intense"**
4. This will automatically update the age rating to **17+**
5. Save changes

**Rationale:**
- Gemini 2.5 Flash allows artistic mature content
- Aligns with Midjourney (17+) and industry standards
- Accurately reflects potential AI-generated content

---

### Step 2: Update Subscription Metadata

**Location:** App Store Connect → In-App Purchases → Subscription Groups → VibePaper Pro

**Action Required:**
1. Navigate to subscription group settings
2. Add **Privacy Policy URL:**
   ```
   https://prodigiousent.github.io/APP-Factory/vibepaper/privacy-policy.html
   ```
3. Add **Terms of Use:**
   - Option A: Use Apple's Standard EULA (recommended)
   - Option B: Create custom Terms of Use and add URL
4. Save all changes

---

### Step 3: Update App Information

**Location:** App Store Connect → App Information

**Action Required:**
1. Update **Support URL** to:
   ```
   https://prodigiousent.github.io/APP-Factory/vibepaper/vibepaper_support.html
   ```
2. Verify **Privacy Policy URL** is set to:
   ```
   https://prodigiousent.github.io/APP-Factory/vibepaper/privacy-policy.html
   ```
3. Save changes

---

### Step 4: Add App Review Notes

**Location:** App Store Connect → Version → App Review Information

**Action Required:**
Copy the content from `APP_REVIEW_NOTES_JAN2026.md` into the "Notes" field.

**Key points to include:**
- Explanation of 404 fix
- Justification for 17+ rating
- Description of Gemini safety filters
- Recommended test prompts for reviewers

---

## 📱 Phase 3 - Resubmission (Optional: New Build)

### Do You Need a New Build?

**NO** - If the app code hasn't changed and only metadata was updated  
**YES** - If you want to add in-app content warnings (recommended but optional)

### If Submitting Without Code Changes:
1. Complete all App Store Connect updates above
2. Click "Submit for Review"
3. Wait for Apple's response

### If Adding In-App Content Warning (Recommended):
1. Add a one-time content advisory modal (see implementation plan)
2. Archive new build in Xcode
3. Upload to App Store Connect
4. Complete metadata updates
5. Submit for review

---

## 📋 Pre-Submission Verification

Before clicking "Submit for Review", verify:

- [ ] Age rating shows **17+**
- [ ] Privacy Policy URL works: https://prodigiousent.github.io/APP-Factory/vibepaper/privacy-policy.html
- [ ] Support URL works: https://prodigiousent.github.io/APP-Factory/vibepaper/vibepaper_support.html
- [ ] Subscription group has Privacy Policy URL
- [ ] Subscription group has Terms of Use (EULA)
- [ ] App Review Notes are comprehensive
- [ ] All screenshots are current
- [ ] App description mentions 17+ rating (optional but recommended)

---

## 🎯 Expected Outcome

With these changes, VibePaper should pass App Store review because:

1. ✅ **Guideline 2.1 (App Completeness)** - Legal links now work
2. ✅ **Guideline 3.1.2 (Subscriptions)** - Metadata complete
3. ✅ **Guideline 1.5 (Safety)** - Support URL functional
4. ✅ **Guideline 2.3.6 (Accurate Metadata)** - Age rating matches content

---

## 📞 Support

If you have questions during the resubmission process:
- Review: `implementation_plan.md` for detailed guidance
- Review: `APP_REVIEW_NOTES_JAN2026.md` for reviewer communication
- Review: `walkthrough.md` for technical details on the fix

---

## ⏱️ Timeline Estimate

- **App Store Connect Updates:** 15-20 minutes
- **Review Submission:** 5 minutes
- **Apple Review Time:** 1-3 days (typically)

Good luck with the resubmission! 🚀
