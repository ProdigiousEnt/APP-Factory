
export interface GameChoice {
  id: string;
  text: string;
  action: string;
}

export interface GameState {
  currentStory: string;
  choices: GameChoice[];
  inventory: string[];
  currentQuest: string;
  location: string;
  imagePrompt: string;
  artStyleContext: string;
}

export interface HistoryItem {
  role: 'user' | 'model';
  content: string;
}

export type ImageSize = '1K' | '2K' | '4K';
