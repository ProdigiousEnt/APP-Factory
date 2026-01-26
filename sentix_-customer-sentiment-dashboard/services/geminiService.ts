
import { GoogleGenAI, Type } from "@google/genai";
import { Review, AnalysisSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Parses raw text reviews into structured Review objects using Gemini 3 Flash for efficiency.
 */
export async function parseReviews(rawText: string): Promise<Review[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse the following raw customer reviews into a JSON array. 
    Each object should have: date (YYYY-MM-DD format, if not found use 2024-01-01), text (original review), 
    sentiment (float -1.0 to 1.0), category (e.g., Pricing, UI, Performance), and keywords (array of strings).
    
    Raw Reviews:
    ${rawText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            text: { type: Type.STRING },
            sentiment: { type: Type.NUMBER },
            category: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["date", "text", "sentiment", "category", "keywords"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
}

/**
 * Generates an executive summary and actionable insights using Gemini 3 Pro with deep reasoning.
 */
export async function generateExecutiveSummary(reviews: Review[]): Promise<AnalysisSummary> {
  const reviewsStr = JSON.stringify(reviews.slice(0, 100)); // Limit context to avoid hitting limits for huge batches
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze these customer reviews and provide a high-level executive summary, 
    top complaints, top praises, and 3 specific actionable areas for improvement.
    
    Reviews: ${reviewsStr}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          topComplaints: { type: Type.ARRAY, items: { type: Type.STRING } },
          topPraises: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionableInsights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING }
              }
            }
          }
        },
        required: ["executiveSummary", "topComplaints", "topPraises", "actionableInsights"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Chat with the model about the dashboard data.
 */
export async function askQuestionAboutData(
  question: string, 
  data: Review[], 
  history: { role: string; content: string }[]
) {
  const dataContext = JSON.stringify(data.slice(0, 50));
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      { text: `You are an expert sentiment analyst. Use the following context to answer the user's question. Context: ${dataContext}` },
      ...history.map(h => ({ text: h.content })),
      { text: question }
    ],
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text;
}
