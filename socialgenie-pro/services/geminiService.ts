
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Tone, Platform, ImageSize, AspectRatio } from "../types";
import { retryWithBackoff, sanitizeError, MODEL_CONFIG, mapAspectRatio } from "../utils/retryUtils";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // @ts-ignore
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generatePlatformText(idea: string, tone: Tone, platform: Platform): Promise<string> {
    const textPrompt = `You are a social media copywriter. Write a ${tone.toLowerCase()} post for ${platform} about: ${idea}

Platform-specific requirements:
- LinkedIn: Professional, long-form (150-300 words), insightful, use 3-5 hashtags
- Twitter/X: Short, punchy, max 280 characters, use 1-2 hashtags
- Instagram: Visual-focused, catchy first line, emojis, 5-10 hashtags at the bottom
- Facebook: Conversational, medium length (100-200 words), engaging, 2-4 hashtags
- Pinterest: Descriptive, keyword-rich (100-200 words), actionable, 3-5 hashtags
- Threads: Concise, conversational, max 500 characters, 1-3 hashtags

CRITICAL: Return ONLY the post text itself. Do NOT include:
- Any explanations like "Here is the post" or "Okay, here are..."
- Any meta-commentary about the post
- Any instructions or notes
- Just the raw post content that can be directly copied and pasted

Start your response with the first word of the actual post.`;

    try {
      console.log(`[Gemini] Generating text for ${platform} using ${MODEL_CONFIG.TEXT_MODEL}...`);

      // Layer 1: Retry with exponential backoff
      const response = await retryWithBackoff(async () => {
        return await this.ai.models.generateContent({
          model: MODEL_CONFIG.TEXT_MODEL,
          contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
          config: { temperature: 0.7 },
        });
      });

      console.log(`[Gemini] Text generation success for ${platform}`);
      return response.text || "Failed to generate text.";
    } catch (error: any) {
      console.error(`[Gemini] Text generation failed for ${platform}:`, error);
      // Layer 2: Sanitize error message
      throw new Error(sanitizeError(error));
    }
  }

  async generatePlatformImage(idea: string, platform: Platform, aspectRatio: AspectRatio, imageSize: ImageSize): Promise<string> {
    // @ts-ignore
    const apiKey = process.env.API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });

    // Platform-specific styling hints for better social media optimization
    const platformStyles: Record<Platform, string> = {
      'Instagram': 'vibrant, eye-catching, Instagram-worthy aesthetic',
      'Twitter/X': 'bold, attention-grabbing, news-worthy visual',
      'LinkedIn': 'professional, corporate, business-appropriate',
      'Facebook': 'warm, engaging, community-focused',
      'Pinterest': 'inspirational, pin-worthy, lifestyle aesthetic',
      'Threads': 'casual, conversational, authentic vibe'
    };

    const styleHint = platformStyles[platform] || 'modern, clean, visually engaging';

    // Map aspect ratio to explicit dimensions for better AI understanding
    const aspectRatioDimensions: Record<AspectRatio, string> = {
      '1:1': '1080x1080 (square)',
      '2:3': '1080x1620 (vertical portrait)',
      '3:2': '1620x1080 (horizontal landscape)',
      '3:4': '1080x1440 (portrait)',
      '4:3': '1440x1080 (landscape)',
      '9:16': '1080x1920 (vertical story/reel format)',
      '16:9': '1920x1080 (horizontal landscape)',
      '21:9': '2560x1080 (ultra-wide landscape)'
    };

    const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatio;

    const imagePrompt = `CRITICAL: Generate image in ${aspectRatio} aspect ratio (${dimensions}).

Create a high-quality, professional marketing image for ${platform} based on this idea: ${idea}

REQUIREMENTS:
- Aspect Ratio: ${aspectRatio} - ${dimensions} - THIS IS MANDATORY
- Style: ${styleHint}
- Format: ${aspectRatio === '9:16' || aspectRatio === '2:3' ? 'VERTICAL orientation' : aspectRatio === '16:9' || aspectRatio === '3:2' || aspectRatio === '21:9' ? 'HORIZONTAL orientation' : 'SQUARE format'}
- No text overlay in the image - pure visual content only
- Maintain exact ${aspectRatio} proportions

The image MUST be in ${aspectRatio} aspect ratio.`;

    // Layer 1: Retry with exponential backoff
    // Attempt 1: Primary Model - Gemini 2.5 Flash Image (Production Stable)
    try {
      console.log(`[Gemini] Generating image for ${platform} using ${MODEL_CONFIG.PRIMARY} (${aspectRatio})...`);

      const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: MODEL_CONFIG.PRIMARY,
          contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
          config: {
            // 🚨 MANDATORY for Gemini 2.5 Flash Image
            responseModalities: ['IMAGE'],
            // Safety settings for artistic freedom
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
          },
        });
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData) {
            console.log(`[Gemini] Image generation success (${MODEL_CONFIG.PRIMARY}) for ${platform}`);
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (error: any) {
      console.warn(`[Gemini] ${MODEL_CONFIG.PRIMARY} failed, attempting fallback model...`, error.message);

      // Layer 3: Model Fallback
      try {
        console.log(`[Gemini] Attempting fallback model ${MODEL_CONFIG.FALLBACK} for ${platform}...`);

        const response = await retryWithBackoff(async () => {
          return await ai.models.generateContent({
            model: MODEL_CONFIG.FALLBACK,
            contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
            config: {
              responseModalities: ['IMAGE'],
            },
          });
        });

        for (const candidate of response.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData) {
              console.log(`[Gemini] Image generation success (${MODEL_CONFIG.FALLBACK}) for ${platform}`);
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (fallbackError: any) {
        console.error(`[Gemini] All image generation attempts failed for ${platform}:`, fallbackError);
        // Layer 2: Sanitize error message
        throw new Error(sanitizeError(fallbackError));
      }
    }

    throw new Error("Unable to create your content. Please try again.");
  }
}
