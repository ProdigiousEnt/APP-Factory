
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// API Key should be in .env.local as VITE_REVENUECAT_APPLE_KEY
const APPLE_API_KEY = (import.meta as any).env.VITE_REVENUECAT_APPLE_KEY || '';
// Support both products during review (reviewer may be grandfathered into yearly)
const PRIMARY_PRODUCT_ID = 'vibepaper_pro_monthly'; // Primary product for new subscribers
const LEGACY_PRODUCT_ID = 'vibepaper_pro_yearly1'; // Legacy product for grandfathered users (matches ASC)
const ENTITLEMENT_ID = 'pro';

export const revenueCatService = {
    async initialize() {
        if (Capacitor.getPlatform() === 'web') {
            console.log("RevenueCat: Skipping initialization on web.");
            return;
        }

        try {
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
            await Purchases.configure({
                apiKey: APPLE_API_KEY,
                appUserID: null // Using anonymous ID
            });
            console.log("RevenueCat: Initialized successfully.");
        } catch (err) {
            console.error("RevenueCat Init Error:", err);
        }
    },

    async checkSubscriptionStatus(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return true; // Unlock for dev on web

        try {
            const { customerInfo } = await Purchases.getCustomerInfo();
            return customerInfo.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
        } catch (err) {
            console.error("RevenueCat check status error:", err);
            return false;
        }
    },

    async purchasePro(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') {
            alert("Purchases are not available on web.");
            return false;
        }

        try {
            console.log('[RevenueCat] 🛒 Starting purchase flow...');

            const offerings = await Purchases.getOfferings();
            console.log('[RevenueCat] 📦 Offerings fetched:', {
                hasCurrentOffering: !!offerings.current,
                packageCount: offerings.current?.availablePackages.length || 0
            });

            if (!offerings.current || offerings.current.availablePackages.length === 0) {
                console.error('[RevenueCat] ❌ No offerings available');
                alert('Unable to load subscription options. Please check your internet connection and try again.');
                return false;
            }

            const targetPackage = offerings.current.availablePackages[0];

            // Defensive logging to catch product ID mismatches
            console.log(`[RevenueCat] 🎯 Purchasing product: ${targetPackage.product.identifier}`);
            console.log(`[RevenueCat] 💰 Price: ${targetPackage.product.priceString}`);
            console.log(`[RevenueCat] 📝 Supported products: ${PRIMARY_PRODUCT_ID}, ${LEGACY_PRODUCT_ID}`);

            const { customerInfo } = await Purchases.purchasePackage({
                aPackage: targetPackage
            });

            const hasEntitlement = customerInfo.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;

            if (hasEntitlement) {
                console.log('[RevenueCat] ✅ Purchase successful - Pro unlocked');
            } else {
                console.warn('[RevenueCat] ⚠️ Purchase completed but entitlement not active');
            }

            return hasEntitlement;
        } catch (err: any) {
            if (err.userCancelled) {
                console.log('[RevenueCat] 🚫 User cancelled the purchase');
                return false;
            } else {
                console.error('[RevenueCat] ❌ Purchase error:', err);
                console.error('[RevenueCat] Error details:', {
                    message: err.message,
                    code: err.code,
                    underlyingErrorMessage: err.underlyingErrorMessage
                });
                alert(`Purchase failed: ${err.message || 'Unknown error'}. Please try again or contact support.`);
                return false;
            }
        }
    },

    async restorePurchases(): Promise<boolean> {
        console.log('[RevenueCat] 🔄 Restore Purchases initiated');

        if (Capacitor.getPlatform() === 'web') {
            console.log('[RevenueCat] ⚠️ Skipping restore - running on web platform');
            alert("Restore is not available on web.");
            return false;
        }

        try {
            console.log('[RevenueCat] 📡 Calling Purchases.restorePurchases() API...');
            const { customerInfo } = await Purchases.restorePurchases();

            console.log('[RevenueCat] ✅ API call successful');
            console.log('[RevenueCat] 📊 Customer Info:', {
                originalAppUserId: customerInfo.originalAppUserId,
                activeEntitlements: Object.keys(customerInfo.entitlements?.active || {}),
                allEntitlements: Object.keys(customerInfo.entitlements?.all || {})
            });

            const hasActiveSubscription = customerInfo.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;

            if (hasActiveSubscription) {
                console.log(`[RevenueCat] ✅ Successfully restored "${ENTITLEMENT_ID}" subscription`);
                console.log('[RevenueCat] 🎉 Pro features will be unlocked');
            } else {
                console.log(`[RevenueCat] ⚠️ No active "${ENTITLEMENT_ID}" entitlement found`);
                console.log('[RevenueCat] 💡 User may need to purchase or subscription may have expired');
            }

            return hasActiveSubscription;
        } catch (err) {
            console.error('[RevenueCat] ❌ Restore error:', err);
            console.error('[RevenueCat] Error details:', JSON.stringify(err, null, 2));
            return false;
        }
    }
};
