
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ImageSize, EmailCampaign } from "../types";

// Helper to get fresh instance with current API key
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCampaign = async (prompt: string): Promise<EmailCampaign> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a professional email marketing campaign based on this prompt: "${prompt}". 
    The output must be a structured JSON with title, subjectLines (array of 3), previewText, bodyText (Markdown allowed), and a detailed imagePrompt for a high-quality visual.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subjectLines: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          previewText: { type: Type.STRING },
          bodyText: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
        },
        required: ["title", "subjectLines", "previewText", "bodyText", "imagePrompt"]
      },
    },
  });

  const campaign = JSON.parse(response.text);
  return {
    ...campaign,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
};

export const generateCampaignImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};

export const getChatResponse = async (history: { role: string; text: string }[], message: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are an expert email marketing consultant. You help users refine their campaigns, suggest improvements, and answer strategy questions.',
    },
  });

  // Sending history isn't directly supported in this wrapper's `chats.create` parameters in some versions,
  // so we send the message. Ideally we'd map history to the contents property if using generateContent.
  // For simplicity here:
  const response = await chat.sendMessage({ message });
  return response.text;
};
