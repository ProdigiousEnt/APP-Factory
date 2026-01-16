// VibePaper App Configuration

export const appConfig = {
    // Testing Mode - Set to true during development to bypass Pro restrictions
    testingMode: false, // ❌ DISABLED FOR PRODUCTION - Tests real RevenueCat flow

    // Free tier configuration
    freeGenerationLimit: 3, // 3 free generations (lifetime) - Changed from 9999 for production
    freeBatchSize: 1, // Generate one image at a time

    // Pro tier configuration
    proBatchSize: 1, // Generate one image at a time to prevent API overload
    proGenerationLimit: 100, // 100 generations per month for Pro users (~3/day)

    // Pro subscription details
    subscription: {
        priceDisplay: '$4.99/month',
        features: [
            '100 wallpapers per month',
            '2K high-resolution output',
            'One-tap remix for variations',
            'Priority processing'
        ]
    }
};
