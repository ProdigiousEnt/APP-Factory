
export enum Category {
  FOOD = 'FOOD',
  BEACHES = 'BEACHES',
  SHOPPING = 'SHOPPING',
  HIDDEN_GEMS = 'HIDDEN_GEMS'
}

export interface Recommendation {
  name: string;
  address: string;
  category: Category;
  whyItsGood: string;
  crowdAdvice: string;
  bestTime: string;
  rating: number; // 1-5 grumpy scale
  link?: string;
}

export interface LocationData {
  lat?: number;
  lng?: number;
  address?: string;
}
