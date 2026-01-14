export const APP_CONFIG = {
    // App Branding
    name: "ZenSynth",
    shortName: "ZenSynth",
    bundleId: "com.zensynth.app",
    appId: "zensynth",
    logoUrl: "/logo.png",

    // Design System (Colors)
    theme: {
        primary: "indigo", // Tailwind color base
        background: "slate-950",
        accent: "indigo-400",
        gradient: "from-slate-950 via-indigo-950/30 to-slate-950"
    },

    // AI Personas (The "Soul" of the App)
    persona: {
        name: "Orleans",
        role: "Sensory Meditation Architect",
        promptBase: "You are a master meditation teacher and sensory architect. Your goal is to guide the user into a deep, visceral state of relaxation.",
        scriptTemplate: "Create a 3-minute immersive meditation script focusing on {theme}. Use highly descriptive sensory language. Keep it concise with 3-4 short paragraphs for pacing. Include breathing cues.",
        popularThemes: ["Zen Garden", "Deep Space", "Ocean Waves", "Rainforest"],
        voices: [
            {
                id: "Kore",
                label: "Kore",
                description: "Soft, ethereal, and calming",
                geminiVoiceId: "Kore",
                pitch: -2.0,
                speakingRate: 0.85
            },
            {
                id: "Aoede",
                label: "Aoede",
                description: "Bright, encouraging, and warm",
                geminiVoiceId: "Aoede",
                pitch: 0.0,
                speakingRate: 0.85
            },
            {
                id: "Charon",
                label: "Charon",
                description: "Deep, grounded, and steady",
                geminiVoiceId: "Puck",
                pitch: -4.0,
                speakingRate: 0.80
            }
        ]
    },

    // Visualization Config
    visualization: {
        imagePromptPrefix: "A serene, cinematic, ultra-wide landscape for a meditation app depicting: ",
        imagePromptSuffix: ". No people, soft lighting, ethereal colors, 8k resolution, photorealistic but dreamlike."
    },

    // Monetization & Limits
    freeLimit: 3,
    entitlementId: "pro",

    // Metadata for SEO/Stores
    title: "ZenSynth | AI-Generated Sensory Meditations",
    description: "Experience infinite, AI-crafted meditation journeys tailored to your current mood and environment."
};
