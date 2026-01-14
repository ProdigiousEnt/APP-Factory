/**
 * RevenueCat API Test Script
 * 
 * This script tests the RevenueCat integration for SplitSmart.
 * Run this in a browser console or as part of your app initialization.
 */

import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

interface TestResult {
    test: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    data?: any;
}

class RevenueCatTester {
    private results: TestResult[] = [];
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private log(result: TestResult) {
        this.results.push(result);
        const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${emoji} ${result.test}: ${result.message}`);
        if (result.data) {
            console.log('   Data:', result.data);
        }
    }

    async runAllTests(): Promise<TestResult[]> {
        console.log('🚀 Starting RevenueCat API Tests...\n');

        await this.testApiKeyConfiguration();
        await this.testPlatformDetection();
        await this.testInitialization();
        await this.testCustomerInfo();
        await this.testOfferings();
        await this.testEntitlements();

        console.log('\n📊 Test Summary:');
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warned = this.results.filter(r => r.status === 'WARN').length;

        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   ⚠️  Warnings: ${warned}`);

        return this.results;
    }

    private async testApiKeyConfiguration() {
        if (!this.apiKey || this.apiKey.trim() === '') {
            this.log({
                test: 'API Key Configuration',
                status: 'FAIL',
                message: 'API key is missing or empty. Check VITE_REVENUECAT_APPLE_KEY in .env.local'
            });
            return;
        }

        // Check if it looks like a valid RevenueCat key
        const isAppleKey = this.apiKey.startsWith('appl_');
        const isGoogleKey = this.apiKey.startsWith('goog_');

        if (!isAppleKey && !isGoogleKey) {
            this.log({
                test: 'API Key Configuration',
                status: 'WARN',
                message: 'API key format unusual. RevenueCat keys typically start with "appl_" or "goog_"',
                data: { keyPrefix: this.apiKey.substring(0, 5) + '...' }
            });
        } else {
            this.log({
                test: 'API Key Configuration',
                status: 'PASS',
                message: `Valid ${isAppleKey ? 'Apple' : 'Google'} API key detected`,
                data: { keyPrefix: this.apiKey.substring(0, 10) + '...' }
            });
        }
    }

    private async testPlatformDetection() {
        try {
            const platform = Capacitor.getPlatform();
            const isNative = Capacitor.isNativePlatform();

            this.log({
                test: 'Platform Detection',
                status: 'PASS',
                message: `Running on ${platform}${isNative ? ' (native)' : ' (web)'}`,
                data: { platform, isNative }
            });

            if (!isNative) {
                this.log({
                    test: 'Platform Warning',
                    status: 'WARN',
                    message: 'RevenueCat requires a native platform (iOS/Android). Web testing is limited.'
                });
            }
        } catch (error) {
            this.log({
                test: 'Platform Detection',
                status: 'FAIL',
                message: `Failed to detect platform: ${error}`
            });
        }
    }

    private async testInitialization() {
        try {
            // Set debug logging
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

            this.log({
                test: 'Log Level Configuration',
                status: 'PASS',
                message: 'Debug logging enabled'
            });

            // Initialize RevenueCat
            await Purchases.configure({ apiKey: this.apiKey });

            this.log({
                test: 'RevenueCat Initialization',
                status: 'PASS',
                message: 'Successfully initialized RevenueCat SDK'
            });
        } catch (error: any) {
            this.log({
                test: 'RevenueCat Initialization',
                status: 'FAIL',
                message: `Initialization failed: ${error.message || error}`,
                data: { error }
            });
        }
    }

    private async testCustomerInfo() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();

            this.log({
                test: 'Customer Info Retrieval',
                status: 'PASS',
                message: 'Successfully retrieved customer information',
                data: {
                    originalAppUserId: customerInfo.customerInfo.originalAppUserId,
                    firstSeen: customerInfo.customerInfo.firstSeen,
                    activeSubscriptions: customerInfo.customerInfo.activeSubscriptions,
                    allPurchasedProductIdentifiers: customerInfo.customerInfo.allPurchasedProductIdentifiers
                }
            });

            // Check for any active entitlements
            const activeEntitlements = customerInfo.customerInfo.entitlements?.active || {};
            const entitlementCount = Object.keys(activeEntitlements).length;

            if (entitlementCount > 0) {
                this.log({
                    test: 'Active Entitlements',
                    status: 'PASS',
                    message: `Found ${entitlementCount} active entitlement(s)`,
                    data: { entitlements: Object.keys(activeEntitlements) }
                });
            } else {
                this.log({
                    test: 'Active Entitlements',
                    status: 'WARN',
                    message: 'No active entitlements found (user is not subscribed)',
                    data: { entitlementCount: 0 }
                });
            }
        } catch (error: any) {
            this.log({
                test: 'Customer Info Retrieval',
                status: 'FAIL',
                message: `Failed to retrieve customer info: ${error.message || error}`,
                data: { error }
            });
        }
    }

    private async testOfferings() {
        try {
            const offerings = await Purchases.getOfferings();

            if (!offerings.current) {
                this.log({
                    test: 'Offerings Retrieval',
                    status: 'WARN',
                    message: 'No current offering configured in RevenueCat dashboard',
                    data: {
                        allOfferingsCount: Object.keys(offerings.all || {}).length
                    }
                });
                return;
            }

            const currentOffering = offerings.current;
            const packageCount = currentOffering.availablePackages?.length || 0;

            this.log({
                test: 'Offerings Retrieval',
                status: 'PASS',
                message: `Found current offering with ${packageCount} package(s)`,
                data: {
                    identifier: currentOffering.identifier,
                    serverDescription: currentOffering.serverDescription,
                    packageCount
                }
            });

            // Test each package
            if (currentOffering.availablePackages && currentOffering.availablePackages.length > 0) {
                currentOffering.availablePackages.forEach((pkg, index) => {
                    this.log({
                        test: `Package ${index + 1} Details`,
                        status: 'PASS',
                        message: `Package: ${pkg.identifier}`,
                        data: {
                            identifier: pkg.identifier,
                            packageType: pkg.packageType,
                            product: {
                                identifier: pkg.product.identifier,
                                description: pkg.product.description,
                                title: pkg.product.title,
                                price: pkg.product.price,
                                priceString: pkg.product.priceString,
                                currencyCode: pkg.product.currencyCode
                            }
                        }
                    });
                });
            }
        } catch (error: any) {
            this.log({
                test: 'Offerings Retrieval',
                status: 'FAIL',
                message: `Failed to retrieve offerings: ${error.message || error}`,
                data: { error }
            });
        }
    }

    private async testEntitlements() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const targetEntitlement = 'Splitsmart Pro';

            const hasEntitlement = customerInfo.customerInfo.entitlements?.active?.[targetEntitlement] !== undefined;

            if (hasEntitlement) {
                const entitlement = customerInfo.customerInfo.entitlements.active[targetEntitlement];
                this.log({
                    test: 'Entitlement Check',
                    status: 'PASS',
                    message: `User has active "${targetEntitlement}" entitlement`,
                    data: {
                        identifier: entitlement.identifier,
                        isActive: entitlement.isActive,
                        willRenew: entitlement.willRenew,
                        periodType: entitlement.periodType,
                        latestPurchaseDate: entitlement.latestPurchaseDate,
                        expirationDate: entitlement.expirationDate
                    }
                });
            } else {
                this.log({
                    test: 'Entitlement Check',
                    status: 'WARN',
                    message: `User does not have "${targetEntitlement}" entitlement`,
                    data: {
                        targetEntitlement,
                        availableEntitlements: Object.keys(customerInfo.customerInfo.entitlements?.active || {})
                    }
                });
            }
        } catch (error: any) {
            this.log({
                test: 'Entitlement Check',
                status: 'FAIL',
                message: `Failed to check entitlements: ${error.message || error}`,
                data: { error }
            });
        }
    }
}

// Export for use in app
export async function testRevenueCatAPI(apiKey: string): Promise<TestResult[]> {
    const tester = new RevenueCatTester(apiKey);
    return await tester.runAllTests();
}

// For direct browser console testing
if (typeof window !== 'undefined') {
    (window as any).testRevenueCat = async () => {
        const apiKey = (import.meta as any).env?.VITE_REVENUECAT_APPLE_KEY || '';
        if (!apiKey) {
            console.error('❌ No API key found. Set VITE_REVENUECAT_APPLE_KEY in .env.local');
            return;
        }
        return await testRevenueCatAPI(apiKey);
    };

    console.log('💡 RevenueCat test utility loaded. Run window.testRevenueCat() to test.');
}
