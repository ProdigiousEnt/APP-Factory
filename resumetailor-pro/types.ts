
export interface CritiqueResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  gapAnalysis: string[];
  actionableSuggestions: string[];
}

export interface TailoredResumeResult {
  suggestedHeadline: string;
  professionalSummary: string;
  experienceBullets: { company: string; bullets: string[] }[];
  keySkills: string[];
  fullTailoredContent: string;
}

export interface ResumeData {
  resumeText: string;
  jobDescription: string;
}

export enum AppState {
  INPUT = 'input',
  ANALYZING = 'analyzing',
  RESULTS = 'results',
  INFO = 'info',
  HISTORY = 'history'
}
