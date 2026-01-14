
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const APPLE_API_KEY = import.meta.env.VITE_REVENUECAT_APPLE_KEY || '';

export const RevenueCatService = {
    async initialize() {
        if (Capacitor.getPlatform() === 'web') {
            console.log('[RevenueCat] Web mode: Automatic Pro unlock active.');
            return;
        }

        if (!APPLE_API_KEY) {
            console.warn('[RevenueCat] Missing Apple API Key. Initialization skipped.');
            return;
        }

        try {
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
            await Purchases.configure({
                apiKey: APPLE_API_KEY,
                appUserID: null // Anonymous for frictionless onboarding
            });
            console.log('[RevenueCat] Initialized successfully.');
        } catch (err) {
            console.error("[RevenueCat] Initialization Error:", err);
        }
    },

    async checkSubscriptionStatus(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return true;
        try {
            const { customerInfo } = await Purchases.getCustomerInfo();
            return customerInfo.entitlements?.active?.["splitsmart_pro"] !== undefined;
        } catch (err) {
            console.error("[RevenueCat] Status Check Error:", err);
            return false;
        }
    },

    async getPrice(): Promise<string | null> {
        if (Capacitor.getPlatform() === 'web') return "$4.99/yr";
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current && offerings.current.availablePackages.length > 0) {
                return offerings.current.availablePackages[0].product.priceString;
            }
            return null;
        } catch (err) {
            return null;
        }
    },

    async purchasePro(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return false;
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current && offerings.current.availablePackages.length > 0) {
                const { customerInfo } = await Purchases.purchasePackage({
                    aPackage: offerings.current.availablePackages[0]
                });
                return customerInfo.entitlements?.active?.["splitsmart_pro"] !== undefined;
            }
            return false;
        } catch (err: any) {
            console.error("[RevenueCat] Purchase Error:", err);
            return false;
        }
    },

    async restore(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return true;
        try {
            const { customerInfo } = await Purchases.restorePurchases();
            return customerInfo.entitlements?.active?.["splitsmart_pro"] !== undefined;
        } catch (err) {
            console.error("[RevenueCat] Restore Error:", err);
            return false;
        }
    }
};
