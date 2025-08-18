import { 
  CloudTriggerType, 
  CloudLLMTriggers,
  SessionAnalysisInput,
  LiveCoachingContext,
  WeeklyProgressReport
} from './types';
import { CloudLLMManager } from './CloudLLMManager';
import { SessionSummary } from './types';

export class CloudTriggerSystem {
  private cloudLLMManager: CloudLLMManager;
  private lastTriggerTimes = new Map<string, number>(); // userId_triggerType -> timestamp
  private userSessionHistory = new Map<string, SessionSummary[]>(); // userId -> sessions
  private weeklyReportSchedule = new Map<string, number>(); // userId -> nextReportTime

  private thresholds = {
    significantQualityDrop: 30,    // 30% drop triggers analysis
    plateauSessions: 5,            // No improvement for 5 sessions
    weeklyReportInterval: 7,       // Days between weekly reports
    liveCoachingCooldown: 300,     // 5 minutes between live coaching
    sessionCompleteCooldown: 60,   // 1 minute between session summaries
    consistencyThreshold: 0.6,     // Quality variance threshold
    minSessionsForPlateau: 10,     // Min sessions before plateau detection
    personalBestThreshold: 85      // Quality threshold for personal best
  };

  constructor() {
    this.cloudLLMManager = CloudLLMManager.getInstance();
  }

  async analyzeSessionForCloudTriggers(
    sessionData: SessionAnalysisInput,
    userId: string
  ): Promise<CloudTriggerType[]> {
    console.log(`☁️ Analyzing session for cloud triggers: ${userId}`);

    const triggeredTypes: CloudTriggerType[] = [];
    const currentTime = Date.now();

    try {
      // Update user session history
      this.updateUserHistory(userId, this.sessionToSummary(sessionData));

      // 1. Session Complete Trigger (always fire, but with cooldown)
      if (this.shouldTrigger(userId, CloudTriggerType.SESSION_COMPLETE, this.thresholds.sessionCompleteCooldown)) {
        triggeredTypes.push(CloudTriggerType.SESSION_COMPLETE);
      }

      // 2. Significant Quality Drop
      if (this.detectSignificantQualityDrop(userId, sessionData)) {
        triggeredTypes.push(CloudTriggerType.QUALITY_CRISIS);
      }

      // 3. Error Pattern Detection
      if (this.detectErrorPattern(userId, sessionData)) {
        triggeredTypes.push(CloudTriggerType.ERROR_PATTERN);
      }

      // 4. Personal Best Achievement
      if (this.detectPersonalBest(userId, sessionData)) {
        triggeredTypes.push(CloudTriggerType.PERSONAL_BEST);
      }

      // 5. Plateau Detection
      if (this.detectPlateau(userId)) {
        triggeredTypes.push(CloudTriggerType.PLATEAU_ANALYSIS);
      }

      // 6. Consistency Issues
      if (this.detectConsistencyIssues(userId, sessionData)) {
        triggeredTypes.push(CloudTriggerType.CONSISTENCY_ISSUES);
      }

      // 7. Weekly Review (scheduled)
      if (this.shouldGenerateWeeklyReport(userId)) {
        triggeredTypes.push(CloudTriggerType.WEEKLY_REVIEW);
        this.scheduleNextWeeklyReport(userId);
      }

      // 8. Long-term Goal Evaluation (monthly)
      if (this.shouldEvaluateGoals(userId)) {
        triggeredTypes.push(CloudTriggerType.GOAL_EVALUATION);
      }

      // Update trigger times
      triggeredTypes.forEach(triggerType => {
        this.lastTriggerTimes.set(`${userId}_${triggerType}`, currentTime);
      });

      console.log(`🎯 Cloud triggers identified: ${triggeredTypes.join(', ')}`);
      return triggeredTypes;

    } catch (error) {
      console.error('Error analyzing session for cloud triggers:', error);
      return [];
    }
  }

  async processCloudTrigger(
    triggerType: CloudTriggerType,
    sessionData: SessionAnalysisInput,
    userPreferences: any = {}
  ): Promise<void> {
    console.log(`🚀 Processing cloud trigger: ${triggerType}`);

    try {
      switch (triggerType) {
        case CloudTriggerType.SESSION_COMPLETE:
          await this.processSessionComplete(sessionData, userPreferences);
          break;

        case CloudTriggerType.QUALITY_CRISIS:
          await this.processQualityCrisis(sessionData, userPreferences);
          break;

        case CloudTriggerType.ERROR_PATTERN:
          await this.processErrorPattern(sessionData, userPreferences);
          break;

        case CloudTriggerType.PERSONAL_BEST:
          await this.processPersonalBest(sessionData, userPreferences);
          break;

        case CloudTriggerType.PLATEAU_ANALYSIS:
          await this.processPlateauAnalysis(sessionData, userPreferences);
          break;

        case CloudTriggerType.WEEKLY_REVIEW:
          await this.processWeeklyReview(sessionData.userId, userPreferences);
          break;

        case CloudTriggerType.CONSISTENCY_ISSUES:
          await this.processConsistencyIssues(sessionData, userPreferences);
          break;

        case CloudTriggerType.GOAL_EVALUATION:
          await this.processGoalEvaluation(sessionData, userPreferences);
          break;

        default:
          console.warn(`Unknown cloud trigger type: ${triggerType}`);
      }
    } catch (error) {
      console.error(`Failed to process cloud trigger ${triggerType}:`, error);
    }
  }

  async requestLiveCoaching(
    context: LiveCoachingContext,
    userId: string
  ): Promise<string> {
    console.log('⚡ Live coaching requested');

    try {
      // Check cooldown
      if (!this.shouldTrigger(userId, CloudTriggerType.LIVE_COACHING, this.thresholds.liveCoachingCooldown)) {
        return 'Spróbuj ponownie za chwilę. Analizuję Twoje ruchy...';
      }

      const response = await this.cloudLLMManager.generateLiveCoaching(context, userId);
      this.lastTriggerTimes.set(`${userId}_${CloudTriggerType.LIVE_COACHING}`, Date.now());
      
      return response;

    } catch (error) {
      console.error('Live coaching failed:', error);
      return 'Kontynuuj zgodnie z planem. Skoncentruj się na jakości ruchu!';
    }
  }

  // Private processing methods
  private async processSessionComplete(
    sessionData: SessionAnalysisInput, 
    userPreferences: any
  ): Promise<void> {
    const analysis = await this.cloudLLMManager.generateStrategicAnalysis(
      sessionData,
      CloudTriggerType.SESSION_COMPLETE,
      userPreferences
    );

    // Store analysis in database (would be implemented with Supabase client)
    console.log('📋 Session analysis generated and stored');
  }

  private async processQualityCrisis(
    sessionData: SessionAnalysisInput,
    userPreferences: any
  ): Promise<void> {
    const analysis = await this.cloudLLMManager.generateStrategicAnalysis(
      sessionData,
      CloudTriggerType.QUALITY_CRISIS,
      { ...userPreferences, priority: 'high', focusAreas: ['technique_correction', 'motivation'] }
    );

    console.log('🚨 Quality crisis analysis generated - immediate intervention recommended');
  }

  private async processErrorPattern(
    sessionData: SessionAnalysisInput,
    userPreferences: any
  ): Promise<void> {
    const analysis = await this.cloudLLMManager.generateStrategicAnalysis(
      sessionData,
      CloudTriggerType.ERROR_PATTERN,
      { ...userPreferences, focusAreas: ['error_correction', 'technique_improvement'] }
    );

    console.log('🔍 Error pattern analysis generated - technique focus needed');
  }

  private async processPersonalBest(
    sessionData: SessionAnalysisInput,
    userPreferences: any
  ): Promise<void> {
    const analysis = await this.cloudLLMManager.generateStrategicAnalysis(
      sessionData,
      CloudTriggerType.PERSONAL_BEST,
      { ...userPreferences, focusAreas: ['celebration', 'next_level_goals'] }
    );

    console.log('🏆 Personal best celebration analysis generated');
  }

  private async processPlateauAnalysis(
    sessionData: SessionAnalysisInput,
    userPreferences: any
  ): Promise<void> {
    const analysis = await this.cloudLLMManager.generateStrategicAnalysis(
      sessionData,
      CloudTriggerType.PLATEAU_ANALYSIS,
      { ...userPreferences, detailLevel: 'comprehensive', focusAreas: ['progression_strategy', 'variety'] }
    );

    console.log('📈 Plateau breakthrough analysis generated');
  }

  private async processWeeklyReview(
    userId: string,
    userPreferences: any
  ): Promise<void> {
    // This would fetch weekly data from database
    const weeklyData = await this.getWeeklyData(userId);
    
    const report = await this.cloudLLMManager.generateWeeklyReport(userId, weeklyData);
    
    // Store weekly report
    console.log('📊 Weekly progress report generated');
  }

  private async processConsistencyIssues(
    sessionData: SessionAnalysisInput,
    userPreferences: any
  ): Promise<void> {
    const analysis = await this.cloudLLMManager.generateStrategicAnalysis(
      sessionData,
      CloudTriggerType.CONSISTENCY_ISSUES,
      { ...userPreferences, focusAreas: ['consistency', 'habit_building'] }
    );

    console.log('⚖️ Consistency improvement analysis generated');
  }

  private async processGoalEvaluation(
    sessionData: SessionAnalysisInput,
    userPreferences: any
  ): Promise<void> {
    const analysis = await this.cloudLLMManager.generateStrategicAnalysis(
      sessionData,
      CloudTriggerType.GOAL_EVALUATION,
      { ...userPreferences, detailLevel: 'comprehensive', focusAreas: ['goal_adjustment', 'long_term_strategy'] }
    );

    console.log('🎯 Goal evaluation analysis generated');
  }

  // Detection methods
  private detectSignificantQualityDrop(userId: string, sessionData: SessionAnalysisInput): boolean {
    const userHistory = this.userSessionHistory.get(userId) || [];
    if (userHistory.length < 3) return false;

    const recentSessions = userHistory.slice(-3);
    const avgRecentQuality = recentSessions.reduce((sum, s) => sum + s.avgQuality, 0) / recentSessions.length;
    
    const qualityDrop = avgRecentQuality - sessionData.aggregatedMetrics.avgQuality;
    return qualityDrop >= this.thresholds.significantQualityDrop;
  }

  private detectErrorPattern(userId: string, sessionData: SessionAnalysisInput): boolean {
    const userHistory = this.userSessionHistory.get(userId) || [];
    if (userHistory.length < 3) return false;

    // Check if same errors appear in last 3 sessions
    const recentSessions = userHistory.slice(-2);
    const currentErrors = Object.keys(sessionData.aggregatedMetrics.commonErrors);
    
    return recentSessions.every(session => 
      session.topErrors.some(error => currentErrors.includes(error))
    );
  }

  private detectPersonalBest(userId: string, sessionData: SessionAnalysisInput): boolean {
    const userHistory = this.userSessionHistory.get(userId) || [];
    if (userHistory.length === 0) return false;

    const historicalMax = Math.max(...userHistory.map(s => s.avgQuality));
    return sessionData.aggregatedMetrics.avgQuality > historicalMax && 
           sessionData.aggregatedMetrics.avgQuality >= this.thresholds.personalBestThreshold;
  }

  private detectPlateau(userId: string): boolean {
    const userHistory = this.userSessionHistory.get(userId) || [];
    if (userHistory.length < this.thresholds.minSessionsForPlateau) return false;

    const recentSessions = userHistory.slice(-this.thresholds.plateauSessions);
    const qualityTrend = this.calculateQualityTrend(recentSessions);
    
    return Math.abs(qualityTrend) < 2; // Less than 2% improvement over 5 sessions
  }

  private detectConsistencyIssues(userId: string, sessionData: SessionAnalysisInput): boolean {
    const userHistory = this.userSessionHistory.get(userId) || [];
    if (userHistory.length < 5) return false;

    const recentQualities = [...userHistory.slice(-4).map(s => s.avgQuality), sessionData.aggregatedMetrics.avgQuality];
    const variance = this.calculateVariance(recentQualities);
    
    return variance > (this.thresholds.consistencyThreshold * 100);
  }

  private shouldGenerateWeeklyReport(userId: string): boolean {
    const nextReportTime = this.weeklyReportSchedule.get(userId) || 0;
    return Date.now() >= nextReportTime;
  }

  private shouldEvaluateGoals(userId: string): boolean {
    const lastGoalEvaluation = this.lastTriggerTimes.get(`${userId}_${CloudTriggerType.GOAL_EVALUATION}`) || 0;
    const monthlyInterval = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    return Date.now() - lastGoalEvaluation >= monthlyInterval;
  }

  private shouldTrigger(userId: string, triggerType: CloudTriggerType, cooldownSeconds: number): boolean {
    const lastTriggerTime = this.lastTriggerTimes.get(`${userId}_${triggerType}`) || 0;
    const cooldownMs = cooldownSeconds * 1000;
    
    return Date.now() - lastTriggerTime >= cooldownMs;
  }

  // Utility methods
  private updateUserHistory(userId: string, sessionSummary: SessionSummary): void {
    const history = this.userSessionHistory.get(userId) || [];
    history.push(sessionSummary);
    
    // Keep only last 50 sessions
    if (history.length > 50) {
      history.shift();
    }
    
    this.userSessionHistory.set(userId, history);
  }

  private sessionToSummary(sessionData: SessionAnalysisInput): SessionSummary {
    return {
      sessionId: sessionData.sessionId,
      date: new Date().toISOString(),
      exerciseType: sessionData.exerciseId,
      totalReps: sessionData.aggregatedMetrics.totalReps,
      avgQuality: sessionData.aggregatedMetrics.avgQuality,
      duration: sessionData.aggregatedMetrics.sessionDuration,
      topErrors: Object.keys(sessionData.aggregatedMetrics.commonErrors).slice(0, 3),
      personalBests: sessionData.aggregatedMetrics.avgQuality >= this.thresholds.personalBestThreshold
    };
  }

  private calculateQualityTrend(sessions: SessionSummary[]): number {
    if (sessions.length < 2) return 0;
    
    const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
    const secondHalf = sessions.slice(Math.floor(sessions.length / 2));
    
    const avgFirst = firstHalf.reduce((sum, s) => sum + s.avgQuality, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, s) => sum + s.avgQuality, 0) / secondHalf.length;
    
    return avgSecond - avgFirst;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private scheduleNextWeeklyReport(userId: string): void {
    const nextWeek = Date.now() + (this.thresholds.weeklyReportInterval * 24 * 60 * 60 * 1000);
    this.weeklyReportSchedule.set(userId, nextWeek);
  }

  private async getWeeklyData(userId: string): Promise<any> {
    // This would be implemented with actual database queries
    // For now, return mock data structure
    return {
      weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weekEndDate: new Date().toISOString().split('T')[0],
      summary: {
        totalSessions: 5,
        totalReps: 150,
        avgQualityImprovement: 5.2,
        consistencyScore: 85,
        goalsAchieved: 3,
        goalsTotal: 4
      },
      exerciseBreakdown: [
        { exerciseType: 'neck_stretch', sessions: 3, avgQuality: 78, improvement: 8, topIssues: ['asymmetry'] },
        { exerciseType: 'shoulder_rolls', sessions: 2, avgQuality: 82, improvement: 3, topIssues: ['tempo'] }
      ]
    };
  }

  // Public configuration methods
  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  getThresholds() {
    return { ...this.thresholds };
  }

  getUserStats(userId: string) {
    return {
      sessionHistory: this.userSessionHistory.get(userId)?.length || 0,
      nextWeeklyReport: this.weeklyReportSchedule.get(userId),
      lastTriggers: Array.from(this.lastTriggerTimes.entries())
        .filter(([key]) => key.startsWith(userId))
        .map(([key, time]) => ({ trigger: key.split('_')[1], timestamp: time }))
    };
  }
}