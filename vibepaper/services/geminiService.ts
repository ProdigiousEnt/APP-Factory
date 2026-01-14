
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

export const generateSingleImage = async (
  prompt: string,
  config: {
    aspectRatio: AspectRatio;
    imageSize: ImageSize;
    referenceImageBase64?: string;
  }
): Promise<string> => {
  // Use Vite's environment access for the API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const contents: any[] = [];

  if (config.referenceImageBase64) {
    // Extract actual base64 data if it contains the data:image prefix
    const base64Data = config.referenceImageBase64.includes(',')
      ? config.referenceImageBase64.split(',')[1]
      : config.referenceImageBase64;

    contents.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png'
      }
    });

    contents.push({
      text: `Using this image as a structural and thematic reference, generate a new wallpaper based on this vibe: ${prompt}. Maintain the color palette and mood.`
    });
  } else {
    contents.push({ text: `A high-quality artistic mobile wallpaper with the vibe: ${prompt}. Professional lighting, 8k resolution, cinematic composition.` });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,  // Direct array, not wrapped in { parts: contents }
      config: {
        responseModalities: ['Image'], // Correct location for responseModalities
        imageConfig: {
          aspectRatio: config.aspectRatio,
          // Note: imageSize is only supported in gemini-3-pro-image-preview, not gemini-2.5-flash-image
          // For now, we'll omit it to avoid errors
        }
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No image generated in response.");
    }

    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    throw new Error("Could not find image data in the response parts.");
  } catch (error: any) {
    console.error("Gemini Generation Error Details:", error);
    const errorMessage = error.message || JSON.stringify(error) || "Unknown generation error";

    // Handle key reset condition as per guidelines
    if (errorMessage.includes("Requested entity was not found")) {
      throw new Error("KEY_NOT_FOUND");
    }
    throw new Error(errorMessage);
  }
};
