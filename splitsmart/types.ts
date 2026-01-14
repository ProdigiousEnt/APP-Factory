
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  tax: number;
  tip: number;
  total: number;
  currency: string;
}

export interface Assignment {
  personName: string;
  itemIds: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Totals {
  [personName: string]: {
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    items: { itemName: string, sharedWithCount: number, individualCost: number }[];
  };
}

export interface HistoryItem {
  id: string;
  created_at: string;
  items: ReceiptItem[];
  tax: number;
  tip: number;
  total: number;
  currency: string;
  assignments: Assignment[];
  note?: string;
}

