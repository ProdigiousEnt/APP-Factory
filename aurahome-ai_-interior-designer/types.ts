
export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isImageEdit?: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING',
  READY = 'READY'
}
