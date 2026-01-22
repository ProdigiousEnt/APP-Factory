/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_REVENUECAT_IOS_API_KEY: string;
    readonly VITE_REVENUECAT_MONTHLY_PRODUCT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
