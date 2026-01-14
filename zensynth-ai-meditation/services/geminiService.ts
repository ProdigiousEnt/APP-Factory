
/// <reference types="vite/client" />
import { GoogleGenAI, Modality } from "@google/genai";
import { ImageSize } from "../types";

// Helper for Base64 encoding/decoding
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Raw PCM Decoding for the TTS output
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

import { APP_CONFIG } from "../app.config";

// TEMPORARY: Hardcoded for testing - REMOVE BEFORE APP STORE SUBMISSION
const apiKey = 'AIzaSyAtUrBmTdfo-ZCFyDSvq5xz2rKRJk64Ng0';
const cloudApiKey = 'AIzaSyBTEBU96O8u2mWLdMKpkPxun4i5RFLHMyU';

console.log('[Gemini Service] Initializing with API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
console.log('[Gemini Service] Cloud TTS API key:', cloudApiKey ? `${cloudApiKey.substring(0, 10)}...` : 'MISSING');

if (!apiKey || apiKey === 'placeholder') {
  console.error('[Gemini Service] CRITICAL: No valid API key found. Check your .env.local file.');
}

if (!cloudApiKey) {
  console.warn('[Gemini Service] WARNING: No Cloud API key found. TTS will not work.');
}

const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async generateMeditationScript(theme: string): Promise<string> {
    const prompt = APP_CONFIG.persona.scriptTemplate.replace('{theme}', theme);
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `${APP_CONFIG.persona.promptBase}\n\n${prompt}`,
      config: { temperature: 0.7 }
    });
    return response.text || "Breathe in deeply. Breathe out slowly.";
  },

  async generateMeditationImage(prompt: string, size: ImageSize = '1K'): Promise<string> {
    try {
      const fullPrompt = `${APP_CONFIG.visualization.imagePromptPrefix}${prompt}${APP_CONFIG.visualization.imagePromptSuffix}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        console.warn('[Gemini Image] No image generated, using gradient placeholder');
        // Fallback to gradient
        const gradients = [
          'PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZTNhOGE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMmU1MDljO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+',
          'PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZjJlMjc7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWE0ZDJlO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+',
          'PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyYzE0NWE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNWIyMWI2O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+'
        ];
        imageUrl = `data:image/svg+xml;base64,${gradients[Math.floor(Math.random() * gradients.length)]}`;
      }

      return imageUrl;
    } catch (err: any) {
      console.error('[Gemini Image] Generation failed:', err.message);
      // Return gradient fallback
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZTNhOGE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMmU1MDljO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';
    }
  },

  async generateTTS(text: string, voiceName: string = 'Kore'): Promise<string> {
    try {
      console.log(`[TTS] Generating audio for voice: ${voiceName}`);
      console.log(`[TTS] Cloud API Key available:`, cloudApiKey ? 'YES' : 'NO');
      console.log(`[TTS] Cloud API Key value:`, cloudApiKey ? `${cloudApiKey.substring(0, 15)}...` : 'MISSING');

      if (!cloudApiKey) {
        console.error('[TTS] ERROR: Cloud API key is not available!');
        console.error('[TTS] Check that VITE_GOOGLE_CLOUD_API_KEY is in .env.local');
        return '';
      }

      // Voice mapping with style prompts
      const voiceConfig: Record<string, { speaker: string; prompt: string }> = {
        'Kore': {
          speaker: 'Kore',
          prompt: 'You are a gentle meditation guide. Speak in a soft, ethereal, and deeply calming voice with slow, peaceful pacing.'
        },
        'Aoede': {
          speaker: 'Aoede',
          prompt: 'You are an encouraging meditation teacher. Speak in a bright, warm, and uplifting voice with gentle energy.'
        },
        'Charon': {
          speaker: 'Puck',
          prompt: 'You are a grounded meditation master. Speak in a deep, steady, and reassuring voice with solid, anchoring presence.'
        }
      };

      const config = voiceConfig[voiceName] || voiceConfig['Kore'];

      // Enhance script with pause markup tags for better meditation pacing
      const enhancedText = this.enhanceScriptWithPauses(text);

      // Use WaveNet voices for highest quality
      const voiceMapping: Record<string, string> = {
        'Kore': 'en-US-Wavenet-F',     // Premium soft female voice
        'Aoede': 'en-US-Wavenet-C',    // Premium warm female voice
        'Charon': 'en-US-Wavenet-D'    // Premium deep male voice
      };

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${cloudApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { ssml: enhancedText },  // Use SSML instead of text
            voice: {
              languageCode: 'en-US',
              name: voiceMapping[voiceName] || voiceMapping['Kore']
            },
            audioConfig: {
              audioEncoding: 'LINEAR16',
              sampleRateHertz: 24000,
              pitch: voiceName === 'Kore' ? -2.0 : voiceName === 'Charon' ? -4.0 : 0.0,
              speakingRate: 0.85 // Slower for meditation
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TTS] API Error:', errorText);
        throw new Error(`TTS API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.audioContent) {
        console.warn('[TTS] No audio content in response');
        return '';
      }

      console.log('[TTS] Audio generated successfully');
      return data.audioContent; // Base64-encoded audio

    } catch (err: any) {
      console.error('[TTS] Generation failed:', err.message);
      // Return empty string to trigger fallback (ambient sound + text only)
      return '';
    }
  },

  // Helper function to enhance meditation scripts with SSML pause markup
  enhanceScriptWithPauses(script: string): string {
    // Wrap in SSML speak tags
    let ssml = '<speak>';

    ssml += script
      // Add pauses after sentences (1 second)
      .replace(/\. /g, '. <break time="1s"/> ')
      // Add longer pauses after paragraphs (2 seconds)
      .replace(/\.\n/g, '.\n<break time="2s"/>\n')
      // Add pauses for breathing cues
      .replace(/breathe in/gi, 'breathe in <break time="800ms"/>')
      .replace(/breathe out/gi, 'breathe out <break time="1.5s"/>')
      .replace(/inhale/gi, 'inhale <break time="800ms"/>')
      .replace(/exhale/gi, 'exhale <break time="1.5s"/>')
      // Add pauses before important phrases (500ms)
      .replace(/Feel /g, '<break time="500ms"/> Feel ')
      .replace(/Imagine /g, '<break time="500ms"/> Imagine ')
      .replace(/Notice /g, '<break time="500ms"/> Notice ');

    ssml += '</speak>';
    return ssml;
  },

  async chatWithGemini(message: string): Promise<string> {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-exp',
      config: {
        systemInstruction: APP_CONFIG.persona.promptBase,
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "I'm here to support your journey.";
  }
};
