export interface MeditationSession {
  id: string;
  theme: string;
  script: string;
  imageUrl: string;
  audioData?: string; // Base64-encoded TTS audio (optional for fallback)
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface GenerationStep {
  label: string;
  status: 'idle' | 'loading' | 'completed' | 'error';
}
