
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Recommendation } from "../types";

// Always initialize GoogleGenAI with named apiKey parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getGrumpyRecommendations(
  location: string,
  category: Category,
  lat?: number,
  lng?: number
): Promise<Recommendation[]> {
  // Use recommended model name for "flash lite" from guidelines
  const model = 'gemini-flash-lite-latest';
  
  const prompt = `
    You are the "Grumpy Old Tourist". You have zero patience for tourist traps, overpriced food, loud crowds, or "influencer" spots. 
    You only care about:
    1. Authenticity: Where the locals actually go.
    2. Peace and Quiet: Spots that are naturally uncrowded or have specific times when they are empty.
    3. Value: No "tourist tax" nonsense.

    I am currently in: ${location}${lat && lng ? ` (Coordinates: ${lat}, ${lng})` : ''}.
    Find me 3 to 4 specific recommendations for the category: ${category}.
    
    For each recommendation, provide:
    - Name of the place
    - Address
    - Why it's better than the popular version (be brutally honest and grumpy)
    - Specific advice on how to avoid the "hordes" (best hours, secret entrances, etc.)
    - The "Grumpy Rating" (1-5, where 5 is "Old Man Approved/Silent")

    Format your response as a JSON array of objects with the following keys:
    name, address, category (use "${category}"), whyItsGood, crowdAdvice, bestTime, rating.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        // responseMimeType and responseSchema are mandatory for robust JSON parsing.
        // The googleMaps tool is omitted as it is incompatible with responseMimeType and responseSchema.
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              category: { type: Type.STRING },
              whyItsGood: { type: Type.STRING },
              crowdAdvice: { type: Type.STRING },
              bestTime: { type: Type.STRING },
              rating: { type: Type.NUMBER }
            },
            required: ["name", "address", "category", "whyItsGood", "crowdAdvice", "bestTime", "rating"],
            propertyOrdering: ["name", "address", "category", "whyItsGood", "crowdAdvice", "bestTime", "rating"]
          }
        }
      }
    });

    // Access the .text property directly to get the extracted string output.
    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as Recommendation[];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
