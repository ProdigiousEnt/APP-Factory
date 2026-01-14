# SocialGenie Pro: Testing Guide

This guide details how to verify every layer of your app—from the AI brain to the monetization engine—using the Xcode Sandbox environment.

## 1. Launching the App
1.  In your terminal, run: `npx cap open ios`.
2.  Once Xcode opens, select your target device (e.g., **iPhone 16 Pro Simulator** or your **Physical iPhone**).
3.  Press **Cmd + R** (or click the Play button) to build and run.

## 2. Testing the Neural Brain (Gemini 2.0)
*   **Action**: Enter an idea (e.g., "AI and the future of coding"), choose a tone, and hit **Generate**.
*   **Verification**: Ensure all three platforms (LinkedIn, Twitter, Instagram) generate both a unique text caption and a generated image.
*   **Failure Check**: If generations fail, verify your `GEMINI_API_KEY` is still active.

## 3. Testing Intelligence Archives (Supabase)
*   **Action**: After a successful generation, click the **Archives** button in the header.
*   **Verification**: Your latest generation should appear at the top.
*   **Cloud Check**: Open your [Supabase Dashboard](https://supabase.com/dashboard/) and verify the record exists in the `history` table with `app_id: socialgenie-pro`.

## 4. Testing Monetization (RevenueCat Sandbox)
*   **Action 1: Triggering the Paywall**: 
    - Set the **Resolution** to **2K Fidelity**.
    - Hit **Generate**.
    - The **Aero Paywall** should slide up immediately.
*   **Action 2: The Purchase Flow**:
    - Click **Upgrade to Pro**.
    - An Apple System Dialog will appear. It should say: `[Environment: Sandbox]`.
    - Sign in with an Apple ID (or use a Sandbox Tester account from App Store Connect).
    - On success, the paywall should close, and you should now be able to generate in 2K.
*   **Action 3: Restore**:
    - Uninstall and reinstall the app.
    - Click **Restore Purchases** on the paywall.
    - Your "Neural Active" status should return without a new purchase.

---

### 🎨 Pro Tip: The Visual Upgrade
While you test, you'll notice the home screen icon is likely still the default Capacitor logo. If you'd like, I can automate the process of baking the **Genie Lamp Logo** I generated into your project now.
