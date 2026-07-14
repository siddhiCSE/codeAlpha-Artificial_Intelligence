export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: number;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  isFavorite?: boolean;
}

export interface WorkoutLog {
  id: string;
  type: string;
  duration: number; // in minutes
  calories: number;
  timestamp: number;
}

export interface DailyFitness {
  date: string; // YYYY-MM-DD
  steps: number;
  stepsGoal: number;
  water: number; // in ml
  waterGoal: number;
  workouts: WorkoutLog[];
  caloriesGoal: number;
}

export type LanguageCode = "es" | "fr" | "de" | "ja" | "it";

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
  nativeName: string;
}

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  category: "vocabulary" | "phrases" | "grammar";
  example: string;
  exampleTranslation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  id: string;
  languageCode: LanguageCode;
  category: string;
  score: number;
  total: number;
  date: number;
}

export interface InternshipTask {
  id: string;
  title: string;
  taskNumber: number;
  description: string;
  completed: boolean;
  keyFeatures: string[];
}
