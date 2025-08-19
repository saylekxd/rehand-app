import { 
  LLMTriggerEvent, 
  LLMTriggerType, 
  LocalLLMTriggers,
  MotivationalContext 
} from './types';
import { MLModelOutput } from '../ml/types';

export class LLMTriggerSystem {
  private lastTriggerTimes = new Map<LLMTriggerType, number>();
  private sessionStats = {
    repsCompleted: 0,
    avgQuality: 0,
    qualityHistory: [] as number[],
    timeElapsed: 0,
    streakCount: 0,
    lastRepTime: 0,
    exerciseStartTime: Date.now(),
    totalScore: 0,
    errorCounts: {} as Record<string, number>
  };

  private thresholds = {
    qualityDrop: 20,        // Trigger when quality drops by 20+ points
    motivationalTimer: 30,   // Every 30 seconds during activity
    longPause: 10,          // After 10 seconds of inactivity
    encouragementQuality: 50, // When quality is below 50%
    milestoneReps: [5, 10, 15, 20, 25, 50], // Rep milestones
    excellentQuality: 85,    // Quality threshold for excellence
    minTimeBetweenSame: 5   // Min seconds between same trigger types
  };

  analyzeForTriggers(
    mlOutput: MLModelOutput,
    exerciseType: string,
    userContext: MotivationalContext
  ): LLMTriggerEvent[] {
    
    const triggers: LLMTriggerEvent[] = [];
    const currentTime = Date.now();
    this.updateSessionStats(mlOutput);

    // 1. Rep Completion Detection
    if (mlOutput.repEndProbability > 0.7) {
      this.sessionStats.repsCompleted++;
      this.sessionStats.lastRepTime = currentTime;

      const trigger = this.createRepCompletionTrigger(mlOutput, exerciseType, userContext);
      triggers.push(trigger);

      // Check for milestone
      if (this.thresholds.milestoneReps.includes(this.sessionStats.repsCompleted)) {
        const milestoneTriger = this.createMilestoneTrigger(mlOutput, exerciseType, userContext);
        triggers.push(milestoneTriger);
      }
    }

    // 2. Quality Drop Detection
    if (this.detectQualityDrop(mlOutput.qualityScore)) {
      const trigger = this.createQualityDropTrigger(mlOutput, exerciseType, userContext);
      if (this.shouldTrigger(LLMTriggerType.QUALITY_DROP)) {
        triggers.push(trigger);
      }
    }

    // 3. Error Detection
    if (this.detectSignificantErrors(mlOutput)) {
      const trigger = this.createErrorTrigger(mlOutput, exerciseType, userContext);
      if (this.shouldTrigger(LLMTriggerType.ERROR_DETECTED)) {
        triggers.push(trigger);
      }
    }

    // 4. Motivational Timer
    if (this.shouldTriggerMotivationalTimer()) {
      const trigger = this.createMotivationalTrigger(mlOutput, exerciseType, userContext);
      triggers.push(trigger);
    }

    // 5. Long Pause Detection
    if (this.detectLongPause()) {
      const trigger = this.createLongPauseTrigger(mlOutput, exerciseType, userContext);
      if (this.shouldTrigger(LLMTriggerType.LONG_PAUSE)) {
        triggers.push(trigger);
      }
    }

    // 6. Encouragement for Low Quality
    if (mlOutput.qualityScore < this.thresholds.encouragementQuality && 
        this.sessionStats.repsCompleted > 3) {
      const trigger = this.createEncouragementTrigger(mlOutput, exerciseType, userContext);
      if (this.shouldTrigger(LLMTriggerType.ENCOURAGEMENT)) {
        triggers.push(trigger);
      }
    }

    // 7. Personal Best Detection
    if (this.detectPersonalBest(mlOutput.qualityScore)) {
      const trigger = this.createPersonalBestTrigger(mlOutput, exerciseType, userContext);
      triggers.push(trigger);
    }

    // Update trigger times for successful triggers
    triggers.forEach(trigger => {
      this.lastTriggerTimes.set(trigger.type, currentTime);
    });

    return triggers;
  }

  private updateSessionStats(mlOutput: MLModelOutput): void {
    this.sessionStats.timeElapsed = Date.now() - this.sessionStats.exerciseStartTime;
    this.sessionStats.qualityHistory.push(mlOutput.qualityScore);
    this.sessionStats.totalScore += mlOutput.qualityScore;
    
    if (this.sessionStats.qualityHistory.length > 0) {
      this.sessionStats.avgQuality = this.sessionStats.totalScore / this.sessionStats.qualityHistory.length;
    }

    // Count errors
    Object.entries(mlOutput.commonErrors).forEach(([error, probability]) => {
      if (probability > 0.5) {
        this.sessionStats.errorCounts[error] = (this.sessionStats.errorCounts[error] || 0) + 1;
      }
    });
  }

  private createRepCompletionTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.REP_COMPLETED,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: mlOutput.qualityScore >= this.thresholds.excellentQuality ? 'high' : 'medium',
      shouldUseLocalLLM: true
    };
  }

  private createQualityDropTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.QUALITY_DROP,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: 'high',
      shouldUseLocalLLM: true
    };
  }

  private createErrorTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.ERROR_DETECTED,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: 'high',
      shouldUseLocalLLM: true
    };
  }

  private createMotivationalTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.MOTIVATIONAL_TIMER,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: 'medium',
      shouldUseLocalLLM: userContext.userPreferences.motivationStyle !== 'educational'
    };
  }

  private createMilestoneTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.SESSION_MILESTONE,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: 'high',
      shouldUseLocalLLM: true
    };
  }

  private createLongPauseTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.LONG_PAUSE,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: 'medium',
      shouldUseLocalLLM: true
    };
  }

  private createEncouragementTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.ENCOURAGEMENT,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: 'medium',
      shouldUseLocalLLM: true
    };
  }

  private createPersonalBestTrigger(
    mlOutput: MLModelOutput, 
    exerciseType: string, 
    userContext: MotivationalContext
  ): LLMTriggerEvent {
    return {
      type: LLMTriggerType.NEW_PERSONAL_BEST,
      data: {
        exerciseType,
        qualityScore: mlOutput.qualityScore,
        currentErrors: this.extractSignificantErrors(mlOutput),
        sessionStats: { ...this.sessionStats },
        userContext
      },
      priority: 'urgent',
      shouldUseLocalLLM: true
    };
  }

  // Detection methods
  private detectQualityDrop(currentQuality: number): boolean {
    if (this.sessionStats.qualityHistory.length < 3) return false;

    const recentQualities = this.sessionStats.qualityHistory.slice(-3);
    const avgRecent = recentQualities.reduce((a, b) => a + b) / recentQualities.length;

    return (avgRecent - currentQuality) >= this.thresholds.qualityDrop;
  }

  private detectSignificantErrors(mlOutput: MLModelOutput): boolean {
    return Object.values(mlOutput.commonErrors).some(probability => probability > 0.6);
  }

  private shouldTriggerMotivationalTimer(): boolean {
    const lastMotivational = this.lastTriggerTimes.get(LLMTriggerType.MOTIVATIONAL_TIMER) || 0;
    const timeSinceLastMotivational = (Date.now() - lastMotivational) / 1000;
    
    return timeSinceLastMotivational >= this.thresholds.motivationalTimer;
  }

  private detectLongPause(): boolean {
    if (this.sessionStats.lastRepTime === 0) return false;
    
    const timeSinceLastRep = (Date.now() - this.sessionStats.lastRepTime) / 1000;
    return timeSinceLastRep >= this.thresholds.longPause;
  }

  private detectPersonalBest(currentQuality: number): boolean {
    if (this.sessionStats.qualityHistory.length < 10) return false;

    const historicalMax = Math.max(...this.sessionStats.qualityHistory.slice(0, -1));
    return currentQuality > historicalMax && currentQuality >= this.thresholds.excellentQuality;
  }

  private shouldTrigger(triggerType: LLMTriggerType): boolean {
    const lastTriggerTime = this.lastTriggerTimes.get(triggerType) || 0;
    const timeSinceLastTrigger = (Date.now() - lastTriggerTime) / 1000;
    
    return timeSinceLastTrigger >= this.thresholds.minTimeBetweenSame;
  }

  private extractSignificantErrors(mlOutput: MLModelOutput): string[] {
    const significantErrors: string[] = [];
    
    Object.entries(mlOutput.commonErrors).forEach(([error, probability]) => {
      if (probability > 0.5) {
        significantErrors.push(error);
      }
    });
    
    return significantErrors;
  }

  // Session management
  startNewSession(): void {
    this.sessionStats = {
      repsCompleted: 0,
      avgQuality: 0,
      qualityHistory: [],
      timeElapsed: 0,
      streakCount: 0,
      lastRepTime: 0,
      exerciseStartTime: Date.now(),
      totalScore: 0,
      errorCounts: {}
    };
    this.lastTriggerTimes.clear();
  }

  endSession(): LLMTriggerEvent | null {
    if (this.sessionStats.repsCompleted === 0) return null;

    return {
      type: LLMTriggerType.SESSION_COMPLETE,
      data: {
        exerciseType: 'session',
        qualityScore: this.sessionStats.avgQuality,
        currentErrors: [],
        sessionStats: { ...this.sessionStats },
        userContext: {
          currentStreak: 0,
          todayProgress: 0,
          weeklyGoal: 0,
          personalBest: 0,
          strugglingArea: '',
          recentImprovement: '',
          userPreferences: {
            motivationStyle: 'encouraging',
            responseLength: 'short',
            language: 'pl'
          }
        }
      },
      priority: 'medium',
      shouldUseLocalLLM: true
    };
  }

  getSessionStats() {
    return {
      ...this.sessionStats,
      sessionDuration: (Date.now() - this.sessionStats.exerciseStartTime) / 1000,
      repsPerMinute: this.sessionStats.timeElapsed > 0 ? 
        (this.sessionStats.repsCompleted / (this.sessionStats.timeElapsed / 60000)) : 0,
      mostCommonError: this.getMostCommonError(),
      qualityTrend: this.getQualityTrend()
    };
  }

  private getMostCommonError(): string {
    const errors = Object.entries(this.sessionStats.errorCounts);
    if (errors.length === 0) return 'none';
    
    return errors.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  private getQualityTrend(): 'improving' | 'stable' | 'declining' {
    if (this.sessionStats.qualityHistory.length < 6) return 'stable';
    
    const firstHalf = this.sessionStats.qualityHistory.slice(0, Math.floor(this.sessionStats.qualityHistory.length / 2));
    const secondHalf = this.sessionStats.qualityHistory.slice(Math.floor(this.sessionStats.qualityHistory.length / 2));
    
    const avgFirstHalf = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const avgSecondHalf = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
    
    const difference = avgSecondHalf - avgFirstHalf;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  // Configuration
  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  getThresholds() {
    return { ...this.thresholds };
  }
}
