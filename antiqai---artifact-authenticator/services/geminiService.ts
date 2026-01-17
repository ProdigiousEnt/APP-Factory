
import { GoogleGenAI, Type } from "@google/genai";
import { ArtifactAnalysis } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeArtifact = async (base64Image: string): Promise<ArtifactAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Analyze this image of an antique or artifact. 
    1. Identify what the item is.
    2. Determine its likely origin or period.
    3. Provide specific technical details a collector would look for to verify its authenticity.
    4. Provide specific red flags that indicate it might be a modern replica or fake.
    5. Suggest types of experts or specific databases to consult.
    
    Be objective and emphasize that this is an AI estimation, not a formal appraisal.
    Use Google Search to find current market verification standards for this type of object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        },
        { text: prompt }
      ]
    },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          estimatedPeriod: { type: Type.STRING },
          description: { type: Type.STRING },
          authenticityMarkers: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of details found in genuine items"
          },
          counterfeitSigns: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of common red flags for fakes"
          },
          suggestedExperts: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          }
        },
        required: ["name", "category", "estimatedPeriod", "description", "authenticityMarkers", "counterfeitSigns", "suggestedExperts"]
      }
    }
  });

  const analysis: ArtifactAnalysis = JSON.parse(response.text || '{}');
  
  // Extract search grounding if available
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    analysis.sources = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'External Resource',
        uri: chunk.web?.uri || '#'
      }));
  }

  return analysis;
};
