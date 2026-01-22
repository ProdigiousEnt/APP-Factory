
import { GoogleGenAI, Type } from "@google/genai";
import { CritiqueResult, TailoredResumeResult } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const analyzeResumeAndJob = async (resume: string, jd: string): Promise<{ critique: CritiqueResult; tailored: TailoredResumeResult }> => {
  const modelName = 'gemini-2.5-flash';

  const prompt = `
    Analyze the following resume in the context of the provided job description.
    
    Job Description:
    ${jd}
    
    Resume:
    ${resume}
    
    Provide:
    1. A detailed critique (score 0-100, strengths, weaknesses, gaps, action items).
    2. A tailored version of the resume content that optimizes for the JD keywords and requirements.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          critique: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              gapAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["overallScore", "strengths", "weaknesses", "gapAnalysis", "actionableSuggestions"],
          },
          tailored: {
            type: Type.OBJECT,
            properties: {
              suggestedHeadline: { type: Type.STRING },
              professionalSummary: { type: Type.STRING },
              experienceBullets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["company", "bullets"]
                }
              },
              keySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              fullTailoredContent: { type: Type.STRING }
            },
            required: ["suggestedHeadline", "professionalSummary", "experienceBullets", "keySkills", "fullTailoredContent"]
          }
        },
        required: ["critique", "tailored"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return data;
};
