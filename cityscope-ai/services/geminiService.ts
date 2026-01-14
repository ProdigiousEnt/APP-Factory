import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { LandmarkAnalysis, LandmarkHistory, SearchSource } from "../types";

// The key provided by the user
const DEBUG_KEY = "AIzaSyAtUrBmTdfo-ZCFyDSvq5xz2rKRJk64Ng0";

const getAI = () => {
    console.log("Initializing @google/genai Unified SDK...");
    return new GoogleGenAI({ apiKey: DEBUG_KEY });
};

/**
 * Production-stable model configuration
 * Updated: January 2026 - Using Gemini 2.5 Flash Image (stable, production-ready)
 */
const MODELS = {
    // For image generation/editing - PRODUCTION STABLE
    IMAGE_GENERATION: 'gemini-2.5-flash-image',

    // For text-only operations - PRODUCTION STABLE
    TEXT_FAST: 'gemini-2.5-flash',
    TEXT_CAPABLE: 'gemini-2.5-pro',

    // Fallbacks (only if primary fails)
    IMAGE_FALLBACK: 'gemini-2.0-flash-preview-image-generation',
    TEXT_FALLBACK: 'gemini-2.0-flash'
};

/**
 * Retry logic with exponential backoff
 * Handles transient failures (network issues, rate limits, temporary unavailability)
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    operation: string = 'API call',
    maxRetries: number = 3
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries;

            if (isLastAttempt) {
                console.error(`${operation} failed after ${maxRetries} attempts:`, error.message);
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delayMs = 1000 * Math.pow(2, attempt - 1);
            console.warn(`${operation} attempt ${attempt} failed, retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw new Error('Retry logic failed unexpectedly');
}

/**
 * Step 1: Identify the landmark from the image using production-stable model
 */
export async function identifyLandmark(base64Image: string): Promise<LandmarkAnalysis> {
    console.log("identifyLandmark started...");
    const ai = getAI();

    try {
        const result = await retryWithBackoff(
            () => ai.models.generateContent({
                model: MODELS.TEXT_FAST,
                contents: [{
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Image,
                            },
                        },
                        {
                            text: `Identify the landmark in this photo. Return a JSON object with:
            - name: The specific name of the landmark.
            - description: A short, engaging intro.
            - estimatedLocation: City/Country.
            - keyFeatures: Array of 3 prominent visual features you see.`,
                        }
                    ],
                }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            estimatedLocation: { type: Type.STRING },
                            keyFeatures: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["name", "description", "estimatedLocation", "keyFeatures"]
                    }
                }
            }),
            'Landmark identification'
        );

        console.log("Result received, parsing text...");
        return JSON.parse(result.text) as LandmarkAnalysis;
    } catch (err: any) {
        console.error("Gemini Identify Landmark Error:", JSON.stringify(err, null, 2));
        throw err;
    }
}

/**
 * Step 2: Research landmark history using production-stable model
 */
export async function researchLandmark(landmarkName: string, location: string): Promise<LandmarkHistory> {
    console.log("researchLandmark started for:", landmarkName);
    const ai = getAI();
    const prompt = `Research the history and current status of "${landmarkName}" in ${location}. 
  Provide a comprehensive historical background, the era it belongs to, and 3-5 unique fun facts.
  Focus on interesting human stories and architectural significance.`;

    try {
        const response = await retryWithBackoff(
            () => ai.models.generateContent({
                model: MODELS.TEXT_FAST,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            fullStory: { type: Type.STRING },
                            historicalEra: { type: Type.STRING },
                            funFacts: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["fullStory", "historicalEra", "funFacts"]
                    }
                }
            }),
            'Landmark research'
        );

        const data = JSON.parse(response.text);
        return { ...data, sources: [] };
    } catch (err: any) {
        console.error("Gemini Research Error:", JSON.stringify(err, null, 2));
        throw err;
    }
}

/**
 * Step 2b: Parse user intent for style vs text
 */
export async function parsePostcardIntent(prompt: string): Promise<{ style: string, text: string }> {
    console.log("parsePostcardIntent started for:", prompt);
    const ai = getAI();

    const instruction = `Analyze this user request for a postcard: "${prompt}"
  Extract two things:
  1. style: The artistic or stylistic effect requested (e.g., "cyberpunk", "watercolor", "fireworks"). If none, use "cinematic".
  2. text: The specific greeting or message they want written on the card (e.g., "Greetings from Paris"). If none, use "".
  
  Return a JSON object.`;

    try {
        const response = await retryWithBackoff(
            () => ai.models.generateContent({
                model: MODELS.TEXT_FAST,
                contents: [{ role: 'user', parts: [{ text: instruction }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            style: { type: Type.STRING },
                            text: { type: Type.STRING }
                        },
                        required: ["style", "text"]
                    }
                }
            }),
            'Intent parsing'
        );
        return JSON.parse(response.text);
    } catch (err) {
        console.error("Intent Parsing Error - Returning defaults:", err);
        return { style: prompt, text: "" };
    }
}

/**
 * Step 3: Edit image using production-stable image generation model
 * Updated to use Gemini 2.5 Flash Image (stable, production-ready)
 */
export async function editLandmarkImage(base64Image: string, effectDescription: string, overlayText?: string): Promise<string> {
    console.log("editLandmarkImage started with effect:", effectDescription, "text:", overlayText);
    const ai = getAI();

    // Create a more descriptive prompt for simple inputs like "Fireworks"
    let expandedPrompt = `Transform this photo by applying the following stylistic change: ${effectDescription}. 
  Be bold and creative with the visual effects while keeping the landmark recognizable. 
  Focus on lighting, atmosphere, and artistic texture.`;

    if (overlayText) {
        expandedPrompt += `\n\nCRITICAL: You MUST also beautifully and naturally render this text onto the image: "${overlayText}". 
    Choose a font style and placement that complements the art. 
    Make the text legible but integrated into the scene.`;
    }

    expandedPrompt += `\n\nReturn ONLY the edited image data as an inline image part.`;

    try {
        const response = await retryWithBackoff(
            () => ai.models.generateContent({
                model: MODELS.IMAGE_GENERATION,  // Production-stable image generation model
                contents: [{
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                        { text: expandedPrompt },
                    ],
                }],
                config: {
                    responseModalities: ['IMAGE'],  // Required for gemini-2.5-flash-image
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                }
            }),
            'Image generation'
        );

        // Advanced Diagnostics
        const candidates = (response as any).candidates || [];
        console.log(`Checking ${candidates.length} candidates for image data...`);

        if (candidates.length === 0) {
            console.warn("No candidates returned. Checking prompt feedback...");
            const feedback = (response as any).promptFeedback;
            if (feedback) console.warn("Prompt Feedback:", JSON.stringify(feedback));
        }

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            const parts = candidate.content?.parts || [];
            console.log(`Candidate ${i}: ${parts.length} parts`);

            for (let j = 0; j < parts.length; j++) {
                const part = parts[j];
                if (part.inlineData) {
                    console.log(`Found image in candidate ${i}, part ${j}`);
                    return part.inlineData.data;
                }
            }
        }

        // Check top-level response for inlineData
        if ((response as any).inlineData?.data) {
            console.log("Found image in top-level response.inlineData");
            return (response as any).inlineData.data;
        }

        console.error("Primary model failed to return image. Trying fallback...");

        // Fallback to preview model (only if stable fails)
        const artistModels = [MODELS.IMAGE_FALLBACK];
        for (const modelName of artistModels) {
            console.log(`Trying artist fallback: ${modelName}...`);
            try {
                const fallbackResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: [{
                        role: 'user',
                        parts: [
                            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                            { text: expandedPrompt },
                        ],
                    }],
                    config: {
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        ]
                    }
                });

                const fallbackCandidates = (fallbackResponse as any).candidates || [];
                for (const candidate of fallbackCandidates) {
                    const parts = candidate.content?.parts || [];
                    for (const part of parts) {
                        if (part.inlineData) {
                            console.log(`Fallback ${modelName} succeeded!`);
                            return part.inlineData.data;
                        }
                    }
                }
            } catch (fallbackErr) {
                console.warn(`Fallback ${modelName} failed:`, fallbackErr);
            }
        }

        throw new Error("Unable to generate your postcard. Please check your internet connection and try again.");
    } catch (err: any) {
        console.error("Gemini Edit Image Error:", JSON.stringify(err, null, 2));
        throw new Error("Unable to generate your postcard. Please check your internet connection and try again.");
    }
}

/**
 * Step 4: Generate narration audio
 * Disabling for now to focus on resolving model availability
 */
export async function generateNarration(text: string): Promise<string> {
    console.log("Narration requested, but disabled for debug pass.");
    return "";
}

export function decodeBase64(base64: string) {
    if (!base64) return new Uint8Array(0);
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = (dataInt16[i * numChannels + channel] || 0) / 32768.0;
        }
    }
    return buffer;
}
