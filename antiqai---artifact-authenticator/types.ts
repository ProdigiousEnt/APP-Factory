
export interface ArtifactAnalysis {
  name: string;
  category: string;
  estimatedPeriod: string;
  description: string;
  authenticityMarkers: string[];
  counterfeitSigns: string[];
  suggestedExperts: string[];
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
