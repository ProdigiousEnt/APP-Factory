
export interface ArtifactAnalysis {
  name: string;
  category: string;
  estimatedPeriod: string;
  description: string;
  historicalContext: string;
  inspectionGuide: string;
  authenticityMarkers: string[];
  counterfeitSigns: string[];
  marketValueFactors: string;
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
