import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

class RevenueCatService {
    private initialized = false;

    async initialize() {
        if (this.initialized) return;

        try {
            const platform = Capacitor.getPlatform();
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
            const customerInfo = await Purchases.getCustomerInfo();
            const entitlements = customerInfo.customerInfo.entitlements.active;

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
            const offerings = await Purchases.getOfferings();
            console.log('📦 Available offerings:', offerings);
            return offerings;
        } catch (error) {
            console.error('❌ Failed to get offerings:', error);
            return null;
        }
    }

    async purchasePackage(packageId: string) {
        try {
            console.log('🔵 purchasePackage called with:', packageId);

            const offerings = await this.getOfferings();
            console.log('🔵 Got offerings:', offerings);

            if (!offerings?.current) {
                console.error('🔴 No current offering available');
                throw new Error('No current offering available');
            }

            const currentOffering = offerings.current;
            console.log('🔵 Current offering:', currentOffering);

            // Use the first available package (matches SocialGenie Pro pattern)
            if (!currentOffering.availablePackages || currentOffering.availablePackages.length === 0) {
                console.error('🔴 No packages available in current offering');
                throw new Error('No packages available in current offering');
            }

            const packageToPurchase = currentOffering.availablePackages[0];
            console.log('🔵 Package to purchase:', packageToPurchase);

            console.log('📦 Purchasing package:', {
                identifier: packageToPurchase.identifier,
                product: packageToPurchase.product.identifier,
                price: packageToPurchase.product.priceString
            });

            console.log('🔵 About to call Purchases.purchasePackage...');
            const purchaseResult = await Purchases.purchasePackage({
                aPackage: packageToPurchase
            });
            console.log('🔵 Purchase call completed');

            console.log('✅ Purchase successful:', purchaseResult);
            return purchaseResult;
        } catch (error: any) {
            console.error('🔴 Error caught in purchasePackage:', error);
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
            const customerInfo = await Purchases.restorePurchases();
            console.log('✅ Purchases restored:', customerInfo);
            return customerInfo;
        } catch (error) {
            console.error('❌ Failed to restore purchases:', error);
            throw error;
        }
    }
}

export const revenueCatService = new RevenueCatService();
