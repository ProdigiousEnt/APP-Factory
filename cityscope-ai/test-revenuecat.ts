/**
 * RevenueCat API Test Script
 * Tests the RevenueCat configuration and API connectivity
 */

import { revenueCatService } from './services/revenueCatService';
import { APP_CONFIG } from './app.config';

async function testRevenueCat() {
    console.log('='.repeat(60));
    console.log('RevenueCat API Test');
    console.log('='.repeat(60));

    // 1. Check Configuration
    console.log('\n📋 Configuration Check:');
    console.log(`   App ID: ${APP_CONFIG.appId}`);
    console.log(`   Bundle ID: ${APP_CONFIG.bundleId}`);
    console.log(`   Entitlement ID: ${APP_CONFIG.entitlementId}`);

    const apiKey = (import.meta as any).env.VITE_REVENUECAT_APPLE_KEY;
    console.log(`   API Key: ${apiKey ? '✅ Present (length: ' + apiKey.length + ')' : '❌ Missing'}`);

    // 2. Test Initialization
    console.log('\n🔧 Testing Initialization:');
    try {
        await revenueCatService.initialize();
        console.log('   ✅ Initialization successful');
    } catch (error) {
        console.error('   ❌ Initialization failed:', error);
        return;
    }

    // 3. Test Subscription Status Check
    console.log('\n🔍 Testing Subscription Status:');
    try {
        const hasAccess = await revenueCatService.checkSubscriptionStatus();
        console.log(`   Status: ${hasAccess ? '✅ Pro Access' : '⚠️  Free Tier'}`);
    } catch (error) {
        console.error('   ❌ Status check failed:', error);
    }

    // 4. Test Offerings Fetch
    console.log('\n💰 Testing Offerings:');
    try {
        const offerings = await revenueCatService.getOfferings();
        if (offerings) {
            console.log('   ✅ Offerings retrieved successfully');
            console.log(`   Current Offering: ${offerings.current?.identifier || 'None'}`);
            if (offerings.current) {
                console.log(`   Available Packages: ${offerings.current.availablePackages.length}`);
                offerings.current.availablePackages.forEach((pkg: any, idx: number) => {
                    console.log(`      ${idx + 1}. ${pkg.identifier} - ${pkg.product?.title || 'Unknown'}`);
                    console.log(`         Price: ${pkg.product?.priceString || 'N/A'}`);
                });
            }
        } else {
            console.log('   ⚠️  No offerings available (may be running on web)');
        }
    } catch (error) {
        console.error('   ❌ Offerings fetch failed:', error);
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Complete');
    console.log('='.repeat(60));
}

// Run the test
testRevenueCat().catch(console.error);
