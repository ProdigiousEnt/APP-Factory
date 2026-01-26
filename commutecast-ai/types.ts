
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source?: string;
}

export interface SummaryConfig {
  persona: 'professional' | 'chill' | 'enthusiastic' | 'concise';
  duration: 'short' | 'medium' | 'long';
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}

export interface GeneratedSummary {
  text: string;
  audioData?: string; // base64 PCM
}

export enum AppStatus {
  IDLE = 'IDLE',
  SUMMARIZING = 'SUMMARIZING',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}
