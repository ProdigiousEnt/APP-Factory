export const APP_CONFIG = {
    // App Branding
    name: "ZenSynth",
    shortName: "ZenSynth",
    bundleId: "com.zensynth.app",
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
        scriptTemplate: "Create a 5-minute immersive meditation script. Use highly descriptive sensory language focusing on {theme}. Break it into short paragraphs for pacing."
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
