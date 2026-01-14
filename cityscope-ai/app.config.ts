export const APP_CONFIG = {
    appId: 'Cityscope',
    name: "CityScope AI",
    shortName: "CityScope",
    bundleId: "com.cityscopeai.app",

    // Design System
    theme: {
        primary: "blue-600",
        gradient: "from-blue-600 to-blue-800",
        accent: "blue-500"
    },

    // AI Persona
    persona: {
        name: "CityScope AI",
        role: "AI Tour Guide & Artist",
        promptBase: "You are CityScope AI, a world-class AI tour guide and artistic photographer. You turn simple travel photos into historical masterpieces.",
        voices: [
            { id: 'en-US-Neural2-F', label: 'Classic Tour Guide (Female)', description: 'Warm and informative' },
            { id: 'en-US-Neural2-D', label: 'The Historian (Male)', description: 'Enthusiastic and deep' }
        ]
    },

    // Monetization & Limits
    freeLimit: 3,
    entitlementId: "pro_postcard",

    // Testing Mode - Set to true to bypass paywall
    testingMode: false  // Production mode - paywall enabled
};
