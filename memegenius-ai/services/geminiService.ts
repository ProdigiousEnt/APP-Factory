
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Generates 5 funny captions based on image analysis
   */
  async getMagicCaptions(base64Image: string): Promise<string[]> {
    const ai = getAI();
    const prompt = `Analyze this image and generate 5 funny, sarcastic, or viral meme captions. 
    The captions should be short and punchy. Return the result in a JSON format with a key 'captions' which is an array of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: "image/png" } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            captions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["captions"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '{"captions": []}');
      return data.captions;
    } catch (e) {
      console.error("Failed to parse AI response", e);
      return [];
    }
  },

  /**
   * Analyzes the image for details
   */
  async analyzeImage(base64Image: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: "image/png" } },
            { text: "Describe this image in detail and tell me why it would make a good meme. Highlight potential visual puns or emotional triggers." }
          ]
        }
      ]
    });
    return response.text || "No analysis available.";
  },

  /**
   * Edits image via prompt using Gemini 2.5 Flash Image
   */
  async editImage(base64Image: string, prompt: string): Promise<string | null> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }
};
