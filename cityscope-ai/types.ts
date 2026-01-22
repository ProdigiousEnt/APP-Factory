
export interface LandmarkAnalysis {
  name: string;
  description: string;
  estimatedLocation: string;
  keyFeatures: string[];
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface LandmarkHistory {
  fullStory: string;
  historicalEra: string;
  funFacts: string[];
  sources: SearchSource[];
}

export interface StylePreset {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export interface CityRecommendation {
  name: string;
  description: string;
  category: string;
  estimatedDuration: string;
  uniqueFact: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESEARCHING = 'RESEARCHING',
  NARRATING = 'NARRATING',
  EDITING = 'EDITING',
  READY = 'READY',
  ERROR = 'ERROR',
  FETCHING_RECOMMENDATIONS = 'FETCHING_RECOMMENDATIONS'
}
