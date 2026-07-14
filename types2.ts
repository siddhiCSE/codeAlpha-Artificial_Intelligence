export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  matchScore?: number; // Similarity score (0 to 1)
  matchedQuestion?: string; // The question it matched with
  isFallback?: boolean; // Whether it used Gemini fallback
}

export interface DetectedObject {
  id?: number; // Assigned tracking ID
  label: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  color?: string;
}

export interface Tracker {
  id: number;
  label: string;
  centroid: [number, number]; // [x, y]
  bbox: [number, number, number, number]; // [x, y, width, height]
  history: [number, number][]; // Last N points for path/trail
  inactiveCount: number; // For clearing old trackers
  color: string;
}
