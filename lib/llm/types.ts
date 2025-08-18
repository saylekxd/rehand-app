// Local LLM Types for Exercise Feedback

export interface LocalLLMConfig {
  provider: 'ReactNativeAI' | 'MLC' | 'none';
  model: string;
  memoryRequirement: string;
  responseTime: string;
  language: 'pl' | 'en';
}

export interface LocalLLMOptions {
  ReactNativeAI: {
    models: ['phi-2', 'tinyllama', 'phi-3-mini'];
    memoryRequirement: '2-4GB';
    responseTime: '200-500ms';
    supported: boolean;
  };
  MLC: {
    models: ['llama2-7b-q4', 'vicuna-7b-q4', 'phi-2-q4'];
    memoryRequirement: '4-8GB';
    responseTime: '500-1000ms';
    supported: boolean;
  };
}

export interface LocalLLMPrompt {
  systemPrompt: string;
  userTemplate: string;
  maxTokens: number;
  temperature: number;
  context: {
    exerciseName: string;
    qualityScore: number;
    errors: string[];
    repNumber: number;
    sessionTime: number;
    userLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface LocalLLMResponse {
  message: string;
  confidence: number;
  responseTime: number;
  tokensGenerated: number;
  isFallback: boolean;
  timestamp: number;
}

export interface LocalLLMTriggers {
  repCompleted: boolean;        // After each rep
  qualityDrop: boolean;         // When quality drops >20 points
  errorDetected: boolean;       // When ML model detects error
  motivationalTimer: boolean;   // Every 30 seconds of activity
  encouragementNeeded: boolean; // When user seems to struggle
  sessionMilestone: boolean;    // Achievement unlocked
  longPause: boolean;           // User paused >10 seconds
}

export interface MotivationalContext {
  currentStreak: number;
  todayProgress: number;
  weeklyGoal: number;
  personalBest: number;
  strugglingArea: string;
  recentImprovement: string;
  userPreferences: {
    motivationStyle: 'encouraging' | 'challenging' | 'educational';
    responseLength: 'short' | 'medium' | 'detailed';
    language: 'pl' | 'en';
  };
}

export interface HardcodedMessages {
  completion: {
    excellent: string[];
    good: string[];
    needsWork: string[];
  };
  errors: {
    asymmetricMovement: string[];
    limitedROM: string[];
    improperTempo: string[];
    valgusKnee: string[];
    headForwardPosture: string[];
  };
  motivation: {
    general: string[];
    milestone: string[];
    comeback: string[];
    streak: string[];
  };
  encouragement: {
    struggling: string[];
    improvement: string[];
    consistency: string[];
  };
}

export enum LLMTriggerType {
  REP_COMPLETED = 'rep_completed',
  QUALITY_DROP = 'quality_drop',
  ERROR_DETECTED = 'error_detected',
  MOTIVATIONAL_TIMER = 'motivational_timer',
  ENCOURAGEMENT = 'encouragement',
  SESSION_MILESTONE = 'session_milestone',
  LONG_PAUSE = 'long_pause',
  SESSION_COMPLETE = 'session_complete',
  NEW_PERSONAL_BEST = 'new_personal_best'
}

export interface LLMTriggerEvent {
  type: LLMTriggerType;
  data: {
    exerciseType: string;
    qualityScore: number;
    currentErrors: string[];
    sessionStats: {
      repsCompleted: number;
      avgQuality: number;
      timeElapsed: number;
      streakCount: number;
    };
    userContext: MotivationalContext;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  shouldUseLocalLLM: boolean;
}