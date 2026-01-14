
export type Tone = 'Professional' | 'Witty' | 'Urgent';
export type Platform = 'LinkedIn' | 'Twitter/X' | 'Instagram' | 'Facebook' | 'Pinterest' | 'Threads';
export type ImageSize = '1K' | '2K';
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export interface GeneratedContent {
  platform: Platform;
  text: string;
  imageUrl: string;
  status: 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export interface AppState {
  idea: string;
  tone: Tone;
  imageSize: ImageSize;
  aspectRatio: AspectRatio;
  selectedPlatforms: Platform[];
  results: Record<Platform, GeneratedContent | null>;
  isGenerating: boolean;
}
