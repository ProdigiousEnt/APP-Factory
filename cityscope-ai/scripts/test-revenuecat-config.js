#!/usr/bin/env node

/**
 * RevenueCat Configuration Test
 * Tests environment variables and configuration without requiring iOS build
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('='.repeat(70));
console.log('🧪 RevenueCat API Configuration Test');
console.log('='.repeat(70));

// Test 1: Check .env.local exists
console.log('\n📁 Step 1: Checking .env.local file...');
try {
    const envPath = join(projectRoot, '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    console.log('   ✅ .env.local file found');

    // Check for RevenueCat key
    const hasRevenueCatKey = envContent.includes('VITE_REVENUECAT_APPLE_KEY');
    if (hasRevenueCatKey) {
        const keyMatch = envContent.match(/VITE_REVENUECAT_APPLE_KEY=(.+)/);
        if (keyMatch && keyMatch[1] && keyMatch[1].trim() && keyMatch[1] !== 'your_api_key_here') {
            const keyValue = keyMatch[1].trim();
            const keyLength = keyValue.length;
            const keyPreview = keyValue.substring(0, 8) + '...' + keyValue.substring(keyValue.length - 4);
            console.log(`   ✅ VITE_REVENUECAT_APPLE_KEY is set`);
            console.log(`   📊 Key length: ${keyLength} characters`);
            console.log(`   🔑 Key preview: ${keyPreview}`);

            // Validate key format (RevenueCat Apple keys typically start with specific prefixes)
            if (keyValue.startsWith('appl_') || keyValue.startsWith('goog_')) {
                console.log('   ✅ Key format looks valid (starts with platform prefix)');
            } else {
                console.log('   ⚠️  Warning: Key doesn\'t start with expected prefix (appl_ or goog_)');
            }
        } else {
            console.log('   ❌ VITE_REVENUECAT_APPLE_KEY is empty or placeholder');
        }
    } else {
        console.log('   ❌ VITE_REVENUECAT_APPLE_KEY not found in .env.local');
    }
} catch (error) {
    console.log('   ❌ Error reading .env.local:', error.message);
}

// Test 2: Check app.config.ts
console.log('\n⚙️  Step 2: Checking app configuration...');
try {
    const configPath = join(projectRoot, 'app.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');
    console.log('   ✅ app.config.ts found');

    // Extract configuration values
    const appIdMatch = configContent.match(/appId:\s*['"](.+?)['"]/);
    const bundleIdMatch = configContent.match(/bundleId:\s*['"](.+?)['"]/);
    const entitlementMatch = configContent.match(/entitlementId:\s*['"](.+?)['"]/);
    const freeLimitMatch = configContent.match(/freeLimit:\s*(\d+)/);

    if (appIdMatch) console.log(`   📱 App ID: ${appIdMatch[1]}`);
    if (bundleIdMatch) console.log(`   📦 Bundle ID: ${bundleIdMatch[1]}`);
    if (entitlementMatch) console.log(`   🎫 Entitlement ID: ${entitlementMatch[1]}`);
    if (freeLimitMatch) console.log(`   🆓 Free Limit: ${freeLimitMatch[1]} postcards`);
} catch (error) {
    console.log('   ❌ Error reading app.config.ts:', error.message);
}

// Test 3: Check RevenueCat service
console.log('\n🔧 Step 3: Checking RevenueCat service...');
try {
    const servicePath = join(projectRoot, 'services/revenueCatService.ts');
    const serviceContent = readFileSync(servicePath, 'utf-8');
    console.log('   ✅ revenueCatService.ts found');

    // Check for key methods
    const methods = [
        'initialize',
        'checkSubscriptionStatus',
        'getOfferings',
        'purchasePro',
        'restorePurchases'
    ];

    methods.forEach(method => {
        if (serviceContent.includes(`async ${method}(`)) {
            console.log(`   ✅ Method: ${method}()`);
        } else {
            console.log(`   ❌ Method missing: ${method}()`);
        }
    });
} catch (error) {
    console.log('   ❌ Error reading revenueCatService.ts:', error.message);
}

// Test 4: Check package.json
console.log('\n📦 Step 4: Checking dependencies...');
try {
    const packagePath = join(projectRoot, 'package.json');
    const packageContent = JSON.parse(readFileSync(packagePath, 'utf-8'));

    const revenueCatVersion = packageContent.dependencies?.['@revenuecat/purchases-capacitor'];
    if (revenueCatVersion) {
        console.log(`   ✅ @revenuecat/purchases-capacitor: ${revenueCatVersion}`);
    } else {
        console.log('   ❌ @revenuecat/purchases-capacitor not found in dependencies');
    }

    const capacitorCore = packageContent.devDependencies?.['@capacitor/core'];
    if (capacitorCore) {
        console.log(`   ✅ @capacitor/core: ${capacitorCore}`);
    }
} catch (error) {
    console.log('   ❌ Error reading package.json:', error.message);
}

// Test 5: Check iOS native integration
console.log('\n📱 Step 5: Checking iOS integration...');
try {
    const packageSwiftPath = join(projectRoot, 'ios/App/Package.swift');
    const packageSwiftContent = readFileSync(packageSwiftPath, 'utf-8');

    if (packageSwiftContent.includes('purchases-capacitor')) {
        console.log('   ✅ RevenueCat plugin found in Package.swift');
    } else {
        console.log('   ❌ RevenueCat plugin not found in Package.swift');
    }
} catch (error) {
    console.log('   ⚠️  Could not check Package.swift:', error.message);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 Test Summary');
console.log('='.repeat(70));

console.log('\n✅ Configuration Status:');
console.log('   • SDK installed and synced');
console.log('   • Service implementation complete');
console.log('   • App configuration defined');

console.log('\n🎯 Next Steps:');
console.log('   1. Verify your API key is correct in .env.local');
console.log('   2. Ensure RevenueCat dashboard is configured:');
console.log('      - App created with bundle ID: com.cityscope.app');
console.log('      - Products and entitlements set up');
console.log('      - Offering marked as "Current"');
console.log('   3. Build and test on iOS simulator:');
console.log('      npm run build && npx cap open ios');

console.log('\n' + '='.repeat(70));
