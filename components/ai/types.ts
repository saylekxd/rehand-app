export interface AnalysisResult {
  score: number;
  feedback: string;
  suggestions: string[];
}

export type LiveFeedbackPosition = 'top' | 'bottom';

export interface LiveMessage {
  id: string;
  text: string;
  level?: 'info' | 'warning' | 'success';
}


