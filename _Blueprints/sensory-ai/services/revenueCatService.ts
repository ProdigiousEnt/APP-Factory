import { Purchases, PurchasesOffering } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const API_KEYS = {
    apple: process.env.VITE_REVENUECAT_API_KEY_IOS || '',
    google: process.env.VITE_REVENUECAT_API_KEY_ANDROID || ''
};

export const revenueCatService = {
    async initialize(appUserId: string) {
        if (Capacitor.getPlatform() === 'web') return;

        await Purchases.configure({
            apiKey: Capacitor.getPlatform() === 'ios' ? API_KEYS.apple : API_KEYS.google,
            appUserID: appUserId
        });
    },

    async getOfferings(): Promise<PurchasesOffering | null> {
        if (Capacitor.getPlatform() === 'web') return null;

        try {
            const offerings = await Purchases.getOfferings();
            return offerings.current;
        } catch (e) {
            console.error("Error fetching offerings:", e);
            return null;
        }
    },

    async checkEntitlement(): Promise<boolean> {
        if (Capacitor.getPlatform() === 'web') return true; // Web is free for now or handled differently

        try {
            const { customerInfo } = await Purchases.getCustomerInfo();
            return !!customerInfo.entitlements.active['pro'];
        } catch (e) {
            return false;
        }
    },

    async purchaseProduct(packageToPurchase: any) {
        try {
            const { customerInfo } = await Purchases.purchasePackage({
                aPackage: packageToPurchase
            });
            return !!customerInfo.entitlements.active['pro'];
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Purchase error:", e);
            }
            return false;
        }
    },

    async restorePurchases() {
        try {
            const { customerInfo } = await Purchases.restorePurchases();
            return !!customerInfo.entitlements.active['pro'];
        } catch (e) {
            return false;
        }
    }
};
