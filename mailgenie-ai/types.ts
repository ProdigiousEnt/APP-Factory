
export interface EmailCampaign {
  id: string;
  title: string;
  subjectLines: string[];
  previewText: string;
  bodyText: string;
  imagePrompt: string;
  createdAt: number;
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface GeneratedImage {
  url: string;
  size: ImageSize;
}
