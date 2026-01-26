
export interface Review {
  date: string;
  text: string;
  sentiment: number; // -1 to 1
  category: string;
  keywords: string[];
}

export interface AnalysisSummary {
  executiveSummary: string;
  topComplaints: string[];
  topPraises: string[];
  actionableInsights: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

export interface DashboardData {
  reviews: Review[];
  summary: AnalysisSummary;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
}
