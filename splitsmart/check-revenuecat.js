#!/usr/bin/env node

/**
 * RevenueCat API Configuration Checker
 * 
 * This script checks your RevenueCat configuration without running the full app.
 * Run with: node check-revenuecat.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log('🔍 RevenueCat Configuration Checker\n');

// Check for .env.local file
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
    console.log('❌ .env.local file not found');
    console.log('   Create a .env.local file with your RevenueCat API key\n');
    process.exit(1);
}

console.log('✅ .env.local file found');

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
        }
    }
});

console.log('\n📋 Environment Variables Found:');
Object.keys(envVars).forEach(key => {
    const value = envVars[key];
    const maskedValue = value.length > 10
        ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
        : '***';
    console.log(`   ${key}: ${maskedValue}`);
});

// Check for RevenueCat API key
const rcKey = envVars['VITE_REVENUECAT_APPLE_KEY'];

console.log('\n🔑 RevenueCat API Key Check:');

if (!rcKey) {
    console.log('❌ VITE_REVENUECAT_APPLE_KEY not found');
    console.log('   Add this line to your .env.local:');
    console.log('   VITE_REVENUECAT_APPLE_KEY=appl_your_key_here\n');
    process.exit(1);
}

console.log('✅ VITE_REVENUECAT_APPLE_KEY is set');

// Validate key format
const isAppleKey = rcKey.startsWith('appl_');
const isGoogleKey = rcKey.startsWith('goog_');

if (isAppleKey) {
    console.log('✅ Valid Apple API key format detected');
} else if (isGoogleKey) {
    console.log('⚠️  Google API key detected (expected Apple key for iOS)');
} else {
    console.log('⚠️  Unusual key format (should start with "appl_" or "goog_")');
}

console.log(`   Key prefix: ${rcKey.substring(0, 10)}...`);
console.log(`   Key length: ${rcKey.length} characters`);

// Check package.json for RevenueCat dependency
console.log('\n📦 Dependencies Check:');

const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const rcVersion = packageJson.dependencies?.['@revenuecat/purchases-capacitor'];

    if (rcVersion) {
        console.log(`✅ @revenuecat/purchases-capacitor: ${rcVersion}`);
    } else {
        console.log('❌ @revenuecat/purchases-capacitor not found in dependencies');
        console.log('   Run: npm install @revenuecat/purchases-capacitor');
    }
} else {
    console.log('⚠️  package.json not found');
}

// Check for RevenueCat service file
console.log('\n📄 Service Files Check:');

const servicePath = path.join(__dirname, 'services', 'revenueCatService.ts');
if (fs.existsSync(servicePath)) {
    console.log('✅ revenueCatService.ts found');

    const serviceContent = fs.readFileSync(servicePath, 'utf8');

    // Check for key functions
    const hasInit = serviceContent.includes('initRevenueCat');
    const hasCheckStatus = serviceContent.includes('checkSubscriptionStatus');
    const hasPurchase = serviceContent.includes('purchasePro');

    console.log(`   ${hasInit ? '✅' : '❌'} initRevenueCat function`);
    console.log(`   ${hasCheckStatus ? '✅' : '❌'} checkSubscriptionStatus function`);
    console.log(`   ${hasPurchase ? '✅' : '❌'} purchasePro function`);

    // Check entitlement name
    const entitlementMatch = serviceContent.match(/['"]([^'"]*Pro)['"]/);
    if (entitlementMatch) {
        console.log(`   ℹ️  Entitlement: "${entitlementMatch[1]}"`);
    }
} else {
    console.log('❌ services/revenueCatService.ts not found');
}

console.log('\n✨ Configuration check complete!\n');

// Summary
console.log('📊 Summary:');
console.log('   To test RevenueCat in your app:');
console.log('   1. Build and run on iOS simulator or device');
console.log('   2. Check console logs for RevenueCat initialization');
console.log('   3. Look for "RevenueCat initialized successfully" message');
console.log('   4. Test subscription flow in Settings\n');

console.log('💡 Next Steps:');
console.log('   - Ensure you have products configured in RevenueCat dashboard');
console.log('   - Create an offering with at least one package');
console.log('   - Set up "Splitsmart Pro" entitlement');
console.log('   - Link your App Store Connect account\n');
