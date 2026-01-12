

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageSize = '1K' | '2K';

export interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  config: {
    aspectRatio: AspectRatio;
    imageSize: ImageSize;
  };
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  message: string;
  error: string | null;
}

// Added AIStudio interface and ensured Window.aistudio uses the correct type to match the environment
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Removed readonly to match the existing global aistudio definition and avoid identical modifiers error
    aistudio: AIStudio;
  }
}