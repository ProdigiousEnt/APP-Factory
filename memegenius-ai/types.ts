
export interface MemeState {
  image: string | null;
  topText: string;
  bottomText: string;
  fontSize: number;
  textColor: string;
}

export interface SuggestedCaption {
  id: string;
  text: string;
  position: 'top' | 'bottom';
}

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}
