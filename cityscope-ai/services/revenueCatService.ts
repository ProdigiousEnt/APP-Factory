import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { APP_CONFIG } from '../app.config';

const APPLE_API_KEY = (import.meta as any).env.VITE_REVENUECAT_APPLE_KEY || '';

export const revenueCatService = {
    async initialize() {
        if (Capacitor.getPlatform() === 'web') {
            console.log("RevenueCat: Skipping initialization on web.");
            return;
        }

        if (!APPLE_API_KEY) {
            console.warn("RevenueCat: Apple API Key missing. Check .env.local");
            return;
        }

        try {
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
            await Purchases.configure({
                apiKey: APPLE_API_KEY,
                // Using a generic appUserID if not logged in, or can be null for anonymous
                appUserID: null
            });
            console.log("RevenueCat: Initialized successfully.");
        } catch (err) {
            console.error("RevenueCat: Initialization failed:", err);
        }
    },

    async checkSubscriptionStatus(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return true; // Unlock for local dev

        try {
            const customerInfo = await Purchases.getCustomerInfo();
            // Check for the specific entitlement defined in APP_CONFIG
            return customerInfo.customerInfo.entitlements?.active?.[APP_CONFIG.entitlementId] !== undefined;
        } catch (err) {
            console.error("RevenueCat: Error checking status:", err);
            return false;
        }
    },

    async getOfferings() {
        if (Capacitor.getPlatform() === 'web') return null;
        try {
            return await Purchases.getOfferings();
        } catch (err) {
            console.error("RevenueCat: Error fetching offerings:", err);
            return null;
        }
    },

    async purchasePro(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return false;

        try {
            const offerings = await this.getOfferings();
            if (offerings?.current && offerings.current.availablePackages.length > 0) {
                const result = await Purchases.purchasePackage({
                    aPackage: offerings.current.availablePackages[0]
                });
                return result.customerInfo.entitlements?.active?.[APP_CONFIG.entitlementId] !== undefined;
            }
            return false;
        } catch (err: any) {
            if (!err.userCancelled) {
                console.error("RevenueCat: Purchase failed:", err);
            }
            return false;
        }
    },

    async restorePurchases(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return false;
        try {
            const result = await Purchases.restorePurchases();
            return result.customerInfo.entitlements?.active?.[APP_CONFIG.entitlementId] !== undefined;
        } catch (err) {
            console.error("RevenueCat: Restore failed:", err);
            return false;
        }
    }
};
