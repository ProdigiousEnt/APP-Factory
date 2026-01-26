
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GameState, ImageSize } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Uses gemini-2.5-flash-lite-latest for low-latency story progression
  static async generateNextStep(
    prompt: string,
    history: string,
    currentInventory: string[],
    currentQuest: string,
    artStyle: string
  ): Promise<GameState> {
    const ai = this.getAI();
    const systemInstruction = `
      You are an expert Choose Your Own Adventure engine. 
      Your goal is to weave an infinite, reactive story based on user choices.
      The world should feel alive, consistent, and genuinely altered by user actions.
      
      Rules:
      1. Maintain the art style: "${artStyle}".
      2. Keep track of inventory and quests.
      3. Provide exactly 3 or 4 choices for the next step.
      4. Include an 'imagePrompt' that describes the CURRENT scene vividly, incorporating the established art style.
      5. Update 'inventory' and 'currentQuest' logically based on the story.
      
      Response must be valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: `History: ${history}\n\nUser Action: ${prompt}\n\nCurrent Inventory: ${currentInventory.join(', ')}\nCurrent Quest: ${currentQuest}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentStory: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  action: { type: Type.STRING },
                },
                required: ["id", "text", "action"],
              },
            },
            inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
            currentQuest: { type: Type.STRING },
            location: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["currentStory", "choices", "inventory", "currentQuest", "location", "imagePrompt"],
        },
      },
    });

    try {
      return JSON.parse(response.text || '{}') as GameState;
    } catch (e) {
      console.error("Failed to parse game state JSON", e);
      throw new Error("The storyteller tripped on their words. Please try again.");
    }
  }

  // Uses gemini-3-pro-image-preview for high-quality visuals
  static async generateSceneImage(prompt: string, size: ImageSize): Promise<string> {
    const ai = this.getAI();
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
    throw new Error("No image data received from the model.");
  }

  // Uses gemini-3-pro-preview for complex lore chat
  static async chatWithLoreMaster(message: string, context: string): Promise<string> {
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are the Chronicler of the Infinite Journey. You know all lore about this world. Current world context: ${context}. Answer the user's questions about the world, mechanics, or their journey in a mystical, helpful tone.`,
      },
    });

    const result = await chat.sendMessage({ message });
    return result.text || "The scrolls are blank for that query...";
  }
}
