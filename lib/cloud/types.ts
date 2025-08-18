// Cloud LLM Types for Strategic Analysis

export interface SessionAnalysisInput {
  sessionId: string;
  exerciseId: string;
  userId: string;
  aggregatedMetrics: {
    totalReps: number;
    avgQuality: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    commonErrors: Record<string, number>;
    fatigueIndicators: number[];
    asymmetryTrend: number[];
    sessionDuration: number;
    peakQuality: number;
    lowQuality: number;
  };
  historicalData: {
    previousSessions: SessionSummary[];
    progressionTrend: 'positive' | 'plateau' | 'regressing';
    userGoals: string[];
    userLevel: 'beginner' | 'intermediate' | 'advanced';
    strugglingAreas: string[];
    strengths: string[];
  };
  contextualInfo: {
    timeOfDay: string;
    daysSinceLastSession: number;
    currentWeekProgress: number;
    monthlyGoal: number;
    deviceUsed: string;
    environmentalFactors: string[];
  };
}

export interface SessionSummary {
  sessionId: string;
  date: string;
  exerciseType: string;
  totalReps: number;
  avgQuality: number;
  duration: number;
  topErrors: string[];
  personalBests: boolean;
  notes?: string;
}

export interface StrategicAnalysis {
  sessionSummary: string;
  progressAssessment: string;
  technicalGuidance: string;
  nextSteps: string;
  motivationalMessage: string;
  redFlags: string[];
  recommendations: {
    immediateActions: string[];
    weeklyFocus: string[];
    techniqueImprovements: string[];
    motivationalStrategies: string[];
  };
  insights: {
    strengthsIdentified: string[];
    areasForImprovement: string[];
    progressIndicators: string[];
    riskFactors: string[];
  };
  personalization: {
    adjustedDifficulty?: 'increase' | 'maintain' | 'decrease';
    recommendedFrequency?: string;
    suggestedExerciseVariations?: string[];
    motivationStyle?: 'encouraging' | 'challenging' | 'educational';
  };
  confidence: number;
  timestamp: number;
}

export interface CloudLLMTriggers {
  sessionComplete: boolean;           // End of exercise session
  significantDrop: boolean;           // >30% quality drop across session
  errorPatternDetected: boolean;      // Recurring errors across multiple reps
  liveCoachMode: boolean;            // User-activated live coaching
  weeklyReview: boolean;             // Weekly progress review
  plateauDetected: boolean;          // No improvement for 5+ sessions
  personalBestAchieved: boolean;     // New quality or rep record
  strugglingDetected: boolean;       // Consistent low performance
  inconsistentPerformance: boolean;  // High quality variance
  longTermGoalCheck: boolean;        // Monthly/quarterly assessment
}

export interface CloudLLMConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  enableStreaming: boolean;
  enableFunctions: boolean;
  rateLimitPerUser: number;
  cacheDuration: number;
}

export interface EdgeFunctionRequest {
  sessionData: SessionAnalysisInput;
  analysisType: 'session_summary' | 'weekly_review' | 'live_coaching' | 'plateau_analysis';
  userPreferences: {
    language: 'pl' | 'en';
    detailLevel: 'brief' | 'detailed' | 'comprehensive';
    focusAreas: string[];
    communicationStyle: 'formal' | 'casual' | 'motivational';
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface EdgeFunctionResponse {
  success: boolean;
  analysis?: StrategicAnalysis;
  error?: string;
  tokensUsed: number;
  processingTime: number;
  cacheHit: boolean;
  cost: number;
  requestId: string;
}

export interface WeeklyProgressReport {
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: {
    totalSessions: number;
    totalReps: number;
    avgQualityImprovement: number;
    consistencyScore: number;
    goalsAchieved: number;
    goalsTotal: number;
  };
  exerciseBreakdown: Array<{
    exerciseType: string;
    sessions: number;
    avgQuality: number;
    improvement: number;
    topIssues: string[];
  }>;
  achievements: string[];
  challenges: string[];
  nextWeekGoals: string[];
  strategicInsights: StrategicAnalysis;
}

export interface LiveCoachingContext {
  currentSession: {
    sessionId: string;
    exerciseType: string;
    currentRep: number;
    recentQuality: number[];
    activeErrors: string[];
    timeElapsed: number;
  };
  userState: {
    frustrationLevel: 'low' | 'medium' | 'high';
    energyLevel: 'low' | 'medium' | 'high';
    focusLevel: 'low' | 'medium' | 'high';
    motivationNeeded: boolean;
  };
  urgency: 'immediate' | 'next_rep' | 'end_of_set';
}

export enum CloudTriggerType {
  SESSION_COMPLETE = 'session_complete',
  QUALITY_CRISIS = 'quality_crisis',
  ERROR_PATTERN = 'error_pattern',
  LIVE_COACHING = 'live_coaching',
  WEEKLY_REVIEW = 'weekly_review',
  PLATEAU_ANALYSIS = 'plateau_analysis',
  PERSONAL_BEST = 'personal_best',
  CONSISTENCY_ISSUES = 'consistency_issues',
  GOAL_EVALUATION = 'goal_evaluation',
  LONG_TERM_ASSESSMENT = 'long_term_assessment'
}