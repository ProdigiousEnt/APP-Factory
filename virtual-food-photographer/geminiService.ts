
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PhotographyStyle, ImageSize, Dish } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseMenu = async (menuText: string): Promise<Partial<Dish>[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract a list of dishes from this restaurant menu text. For each dish, provide a "name" and a concise "description" focused on visual appearance for food photography. Return as a JSON array of objects. \n\nMenu Text: ${menuText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse menu JSON", e);
    return [];
  }
};

export const generateFoodImage = async (
  dish: Dish,
  style: PhotographyStyle,
  size: ImageSize
): Promise<string> => {
  const ai = getAI();
  
  const stylePrompts = {
    'Rustic/Dark': "Moody, low-key lighting, dark wood background, rustic ceramic plate, deep shadows, cinematic and dramatic.",
    'Bright/Modern': "High-key lighting, clean white or marble background, minimalist plating, fresh and airy, commercial food photography style.",
    'Social Media (Top-down)': "Flat lay perspective, vibrant colors, trendy props like linen napkins and scattered herbs, overhead view, perfect for Instagram."
  };

  const prompt = `Professional high-end food photography of "${dish.name}". Description: ${dish.description}. ${stylePrompts[style]} Extremely appetizing, 8k resolution, photorealistic, shallow depth of field, commercial quality.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from model");
};

export const editFoodImage = async (
  base64Image: string,
  instruction: string
): Promise<string> => {
  const ai = getAI();
  const imageData = base64Image.split(',')[1];
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/png'
          }
        },
        { text: instruction }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No edited image data returned");
};
