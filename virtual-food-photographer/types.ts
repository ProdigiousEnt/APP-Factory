
export type PhotographyStyle = 'Rustic/Dark' | 'Bright/Modern' | 'Social Media (Top-down)';
export type ImageSize = '1K' | '2K' | '4K';

export interface Dish {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error?: string;
}

export interface AppState {
  menuText: string;
  dishes: Dish[];
  selectedStyle: PhotographyStyle;
  selectedSize: ImageSize;
  isProcessingMenu: boolean;
  apiKeySelected: boolean;
}
