
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReceiptData, ReceiptItem } from "../types";

// User-provided API Key from environment
const getApiKey = () => {
  const rawKey = (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    ""
  ).toString().trim();

  // Strip all whitespace and potential surrounding quotes
  return rawKey.replace(/^["']|["']$/g, '').replace(/\s/g, '');
};

let client: GoogleGenerativeAI | null = null;

const getClient = () => {
  if (client) return client;
  const key = getApiKey();
  if (!key || key.length < 10) {
    console.warn("SplitSmart AI: Missing or invalid API Key.");
    return null;
  }
  client = new GoogleGenerativeAI(key);
  return client;
};

/**
 * Robust parsing using production-stable Gemini 2.5 Flash
 */
export const parseReceiptImage = async (base64Image: string): Promise<ReceiptData> => {
  const ai = getClient();
  if (!ai) throw new Error("AI not initialized. Check your API Key.");

  // Using production-stable model for App Store reliability
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    console.log("SplitSmart AI: Processing receipt with gemini-2.5-flash...");

    const prompt = `Extract all items, quantities, and prices from this receipt. Return ONLY strict JSON in this format: 
    { 
      "items": [{ "id": "string", "name": "string", "price": number, "quantity": number }], 
      "tax": number, 
      "tip": number, 
      "total": number, 
      "currency": "string" 
    }
    No markdown blocks, no extra text. Ensure all IDs are unique strings.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      },
      { text: prompt }
    ]);

    const response = await result.response;
    let text = response.text().trim();

    // Cleanup any accidental formatting
    text = text.replace(/```json|```/g, "").trim();

    console.log("SplitSmart AI: Response received, parsing JSON...");
    const parsed = JSON.parse(text);

    if (parsed.items) {
      parsed.items = parsed.items.map((item: any, idx: number) => ({
        ...item,
        id: item.id || `item-${idx}`
      }));
    }

    return parsed as ReceiptData;
  } catch (error: any) {
    console.error("SplitSmart AI: Gemini Error", error);
    if (error.status === 404) {
      throw new Error(`Model not found (404). Tried gemini-2.5-flash. Please verify that your API key project has access to this model in Google AI Studio.`);
    }
    throw error;
  }
};

/**
 * Chat command interpreter using production-stable Gemini 2.5 Flash
 */
export const interpretChatCommand = async (
  command: string,
  currentItems: ReceiptItem[],
  currentAssignments: { personName: string, itemIds: string[] }[]
) => {
  const ai = getClient();
  if (!ai) throw new Error("AI not initialized.");

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const prompt = `
      Context: Split bill.
      Items: ${JSON.stringify(currentItems)}
      Assignments: ${JSON.stringify(currentAssignments)}
      Command: ${command}
      
      Return JSON: [{"personName": "string", "addItemIds": ["string"], "removeItemIds": ["string"]}]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("SplitSmart AI: Chat error", error);
    throw error;
  }
};
