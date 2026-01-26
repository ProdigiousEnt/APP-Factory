
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

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateMeditationScript(theme: string): Promise<string> {
    const prompt = APP_CONFIG.persona.scriptTemplate.replace('{theme}', theme);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${APP_CONFIG.persona.promptBase}\n\n${prompt}`,
      config: { temperature: 0.7 }
    });
    return response.text || "Breathe in deeply. Breathe out slowly.";
  },

  async generateMeditationImage(prompt: string, size: ImageSize = '1K'): Promise<string> {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${APP_CONFIG.visualization.imagePromptPrefix}${prompt}${APP_CONFIG.visualization.imagePromptSuffix}` }]
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
    return imageUrl;
  },

  async generateTTS(text: string, voiceName: string = 'Kore'): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{
        parts: [{
          text: `
        Read this script with a very slow, hypnotic cadence. 
        Use a soft, warm, compassionate tone. 
        Role: ${APP_CONFIG.persona.role}
        Script: ${text}`
        }]
      }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  },

  async chatWithGemini(message: string): Promise<string> {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: APP_CONFIG.persona.promptBase,
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "I'm here to support your journey.";
  }
};
