import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

class RevenueCatService {
    private initialized = false;

    async initialize() {
        if (this.initialized) return;

        try {
            const platform = Capacitor.getPlatform();

            // Only initialize on native platforms
            if (platform === 'web') {
                console.log('⚠️ RevenueCat: Skipping initialization on web platform');
                return;
            }

            const apiKey = platform === 'ios'
                ? import.meta.env.VITE_REVENUECAT_IOS_API_KEY
                : import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY;

            if (!apiKey || apiKey === 'YOUR_IOS_API_KEY_HERE' || apiKey === 'YOUR_ANDROID_API_KEY_HERE') {
                console.warn('⚠️ RevenueCat API key not configured');
                return;
            }

            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
            await Purchases.configure({ apiKey });

            this.initialized = true;
            console.log('✅ RevenueCat initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize RevenueCat:', error);
        }
    }

    async checkSubscriptionStatus(): Promise<boolean> {
        try {
            const platform = Capacitor.getPlatform();
            if (platform === 'web') return false;

            const { customerInfo } = await Purchases.getCustomerInfo();
            const entitlements = customerInfo.entitlements.active;

            // Check if user has 'pro' entitlement
            const isPro = 'pro' in entitlements;
            console.log('🔐 Subscription status:', isPro ? 'Pro' : 'Free');

            return isPro;
        } catch (error) {
            console.error('❌ Failed to check subscription:', error);
            return false;
        }
    }

    async getOfferings() {
        try {
            const platform = Capacitor.getPlatform();
            if (platform === 'web') return null;

            const offerings = await Purchases.getOfferings();
            console.log('📦 Available offerings:', offerings);
            return offerings;
        } catch (error) {
            console.error('❌ Failed to get offerings:', error);
            return null;
        }
    }

    /**
     * Purchase subscription using Pattern P.B.R (Package Binary Robustness)
     * Uses availablePackages[0] instead of string matching for reliability
     */
    async purchaseSubscription() {
        try {
            const offerings = await this.getOfferings();
            if (!offerings?.current) {
                throw new Error('No current offering available');
            }

            const currentOffering = offerings.current;
            const monthlyPackage = currentOffering.availablePackages[0];

            if (!monthlyPackage) {
                throw new Error('No packages available');
            }

            const { customerInfo } = await Purchases.purchasePackage({
                aPackage: monthlyPackage
            });

            console.log('✅ Purchase successful:', customerInfo);
            return customerInfo;
        } catch (error: any) {
            if (error.userCancelled) {
                console.log('ℹ️ User cancelled purchase');
            } else {
                console.error('❌ Purchase failed:', error);
            }
            throw error;
        }
    }

    async restorePurchases() {
        try {
            const platform = Capacitor.getPlatform();
            if (platform === 'web') {
                throw new Error('Restore not available on web');
            }

            const { customerInfo } = await Purchases.restorePurchases();
            console.log('✅ Purchases restored:', customerInfo);
            return customerInfo;
        } catch (error) {
            console.error('❌ Failed to restore purchases:', error);
            throw error;
        }
    }
}

export const revenueCatService = new RevenueCatService();
