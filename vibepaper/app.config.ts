// VibePaper App Configuration

export const appConfig = {
    // Testing Mode - Set to true during development to bypass Pro restrictions
    testingMode: true, // ✅ ENABLED FOR APP STORE REVIEW - Unlimited testing

    // Free tier configuration
    freeGenerationLimit: 9999, // Set high for reviewer testing
    freeBatchSize: 2, // Number of wallpapers generated per request for free users

    // Pro tier configuration
    proBatchSize: 4, // Number of wallpapers generated per request for Pro users

    // Pro subscription details
    subscription: {
        priceDisplay: '$4.99/year',
        features: [
            'Unlimited wallpaper generations',
            '2K high-resolution output',
            'Batch generation (4 variations at once)',
            'Priority processing'
        ]
    }
};
