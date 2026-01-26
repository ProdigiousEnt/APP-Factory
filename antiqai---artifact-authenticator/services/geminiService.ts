
import { GoogleGenAI, Type } from "@google/genai";
import { ArtifactAnalysis } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const analyzeArtifact = async (base64Image: string): Promise<ArtifactAnalysis> => {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    You are an expert antique appraiser and authenticator. Analyze this image in comprehensive detail.
    
    Provide a thorough, educational analysis covering:
    
    1. IDENTIFICATION: What is this item? Be specific about type, style, and likely period.
    
    2. ESTIMATED VALUE: Provide a realistic market value range in USD. Consider:
       - Current market conditions
       - Typical auction/dealer prices
       - Condition assumptions based on the image
       Format as a range (e.g., "$50-$150" or "$500-$1,200" or "$2,000-$5,000")
       If highly variable, explain why (e.g., "$100-$2,000 depending on condition and provenance")
    
    3. HISTORICAL CONTEXT: Provide background on this type of item, its cultural significance, 
       and how it was used during its period. Include information about the manufacturing 
       techniques common to this era.
    
    4. AUTHENTICITY MARKERS: List 8-12 specific details that indicate authenticity. Include:
       - Construction methods and materials
       - Patina and wear patterns
       - Maker's marks or signatures to look for
       - Period-appropriate design elements
       - Tool marks or manufacturing evidence
       - Weight, dimensions, or proportions
    
    5. INSPECTION GUIDE: Provide step-by-step instructions on how to physically inspect 
       this item for authenticity. What should someone look for, touch, measure, or test?
    
    6. RED FLAGS: List 8-12 warning signs of reproductions or fakes. Include:
       - Modern manufacturing techniques
       - Incorrect materials or finishes
       - Inconsistent aging or artificial distressing
       - Wrong proportions or design details
       - Common reproduction markers
    
    7. MARKET VALUE FACTORS: What affects the value of this type of item? Include:
       - Condition considerations
       - Rarity indicators
       - Provenance importance
       - Regional variations in value
    
    8. EXPERT CONSULTATION: List 3-5 specific types of experts, organizations, databases, 
       or resources someone should consult for formal authentication.
    
    Be thorough, educational, and specific. This analysis should empower the user to make 
    informed decisions. Emphasize that this is AI-assisted analysis, not a formal appraisal.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          estimatedPeriod: { type: Type.STRING },
          estimatedValue: {
            type: Type.STRING,
            description: "Estimated market value range in USD (e.g., '$50-$150' or '$500-$1,200')"
          },
          description: { type: Type.STRING },
          historicalContext: {
            type: Type.STRING,
            description: "Background on the item's cultural significance and manufacturing techniques"
          },
          inspectionGuide: {
            type: Type.STRING,
            description: "Step-by-step physical inspection instructions"
          },
          authenticityMarkers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "8-12 specific details found in genuine items"
          },
          counterfeitSigns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "8-12 warning signs of reproductions or fakes"
          },
          marketValueFactors: {
            type: Type.STRING,
            description: "Factors that affect the value of this type of item"
          },
          suggestedExperts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 specific experts, organizations, or resources for authentication"
          }
        },
        required: ["name", "category", "estimatedPeriod", "estimatedValue", "description", "historicalContext", "inspectionGuide", "authenticityMarkers", "counterfeitSigns", "marketValueFactors", "suggestedExperts"]
      }
    }
  });

  const analysis: ArtifactAnalysis = JSON.parse(response.text || '{}');

  return analysis;
};
