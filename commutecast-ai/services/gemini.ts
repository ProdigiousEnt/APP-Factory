
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { NewsArticle, SummaryConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeArticles = async (articles: NewsArticle[], config: SummaryConfig): Promise<string> => {
  const prompt = `
    You are a professional podcast script writer. I will provide a list of news articles. 
    Your job is to create a seamless, engaging audio script for a morning commute summary.
    
    Persona: ${config.persona}
    Requested Length: ${config.duration}
    
    Articles:
    ${articles.map(a => `Title: ${a.title}\nContent: ${a.content}`).join('\n\n')}
    
    Output ONLY the script text. Do not include stage directions like [Music] or [Intro]. 
    Make it sound natural for a narrator to read.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text || "Could not generate summary.";
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  // Use gemini-2.5-flash-preview-tts as requested
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned from Gemini TTS");
  return base64Audio;
};
