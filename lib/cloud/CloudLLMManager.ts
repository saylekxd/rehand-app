import { 
  SessionAnalysisInput, 
  StrategicAnalysis, 
  CloudLLMConfig,
  EdgeFunctionRequest,
  EdgeFunctionResponse,
  CloudTriggerType,
  LiveCoachingContext,
  WeeklyProgressReport
} from './types';

export class CloudLLMManager {
  private static instance: CloudLLMManager;
  private config: CloudLLMConfig;
  private supabaseUrl: string;
  private supabaseKey: string;
  private requestCache = new Map<string, { data: StrategicAnalysis; expiry: number }>();
  private rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

  private constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4',
      maxTokens: 1500,
      temperature: 0.7,
      systemPrompt: this.getSystemPrompt(),
      enableStreaming: false,
      enableFunctions: true,
      rateLimitPerUser: 10, // requests per hour
      cacheDuration: 3600000 // 1 hour
    };
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    this.supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  static getInstance(): CloudLLMManager {
    if (!CloudLLMManager.instance) {
      CloudLLMManager.instance = new CloudLLMManager();
    }
    return CloudLLMManager.instance;
  }

  async generateStrategicAnalysis(
    sessionData: SessionAnalysisInput,
    triggerType: CloudTriggerType,
    userPreferences: any = {}
  ): Promise<StrategicAnalysis> {
    console.log(`☁️ Generating strategic analysis for ${triggerType}`);

    try {
      // Check rate limits
      if (!this.checkRateLimit(sessionData.userId)) {
        throw new Error('Rate limit exceeded for user');
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(sessionData, triggerType);
      const cached = this.requestCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        console.log('📦 Using cached strategic analysis');
        return cached.data;
      }

      // Prepare Edge Function request
      const request: EdgeFunctionRequest = {
        sessionData,
        analysisType: this.mapTriggerToAnalysisType(triggerType),
        userPreferences: {
          language: userPreferences.language || 'pl',
          detailLevel: userPreferences.detailLevel || 'detailed',
          focusAreas: userPreferences.focusAreas || [],
          communicationStyle: userPreferences.communicationStyle || 'motivational'
        },
        priority: this.getPriorityForTrigger(triggerType)
      };

      // Call Edge Function
      const response = await this.callEdgeFunction('strategic-analysis', request);
      
      if (!response.success || !response.analysis) {
        throw new Error(response.error || 'Strategic analysis failed');
      }

      // Cache successful response
      this.requestCache.set(cacheKey, {
        data: response.analysis,
        expiry: Date.now() + this.config.cacheDuration
      });

      // Update rate limit
      this.updateRateLimit(sessionData.userId);

      console.log(`✅ Strategic analysis generated (${response.tokensUsed} tokens, $${response.cost.toFixed(4)})`);
      return response.analysis;

    } catch (error) {
      console.error('❌ Strategic analysis failed:', error);
      
      // Return fallback analysis
      return this.getFallbackAnalysis(sessionData, triggerType);
    }
  }

  async generateLiveCoaching(
    context: LiveCoachingContext,
    userId: string
  ): Promise<string> {
    console.log('⚡ Generating live coaching response...');

    try {
      if (!this.checkRateLimit(userId)) {
        return this.getFallbackLiveCoaching(context);
      }

      const prompt = this.buildLiveCoachingPrompt(context);
      const response = await this.callOpenAIDirectly(prompt, {
        maxTokens: 100,
        temperature: 0.8,
        userId
      });

      this.updateRateLimit(userId);
      return response;

    } catch (error) {
      console.error('Live coaching failed:', error);
      return this.getFallbackLiveCoaching(context);
    }
  }

  async generateWeeklyReport(
    userId: string,
    weekData: any
  ): Promise<WeeklyProgressReport> {
    console.log('📊 Generating weekly progress report...');

    try {
      const sessionData: SessionAnalysisInput = this.prepareWeeklyAnalysisInput(userId, weekData);
      
      const analysis = await this.generateStrategicAnalysis(
        sessionData,
        CloudTriggerType.WEEKLY_REVIEW,
        { detailLevel: 'comprehensive' }
      );

      return {
        userId,
        weekStartDate: weekData.weekStartDate,
        weekEndDate: weekData.weekEndDate,
        summary: weekData.summary,
        exerciseBreakdown: weekData.exerciseBreakdown,
        achievements: this.extractAchievements(analysis),
        challenges: this.extractChallenges(analysis),
        nextWeekGoals: this.extractGoals(analysis),
        strategicInsights: analysis
      };

    } catch (error) {
      console.error('Weekly report generation failed:', error);
      throw error;
    }
  }

  private async callEdgeFunction(
    functionName: string, 
    request: EdgeFunctionRequest
  ): Promise<EdgeFunctionResponse> {
    const url = `${this.supabaseUrl}/functions/v1/${functionName}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Edge function call failed: ${response.statusText}`);
    }

    return await response.json();
  }

  private async callOpenAIDirectly(
    prompt: string, 
    options: { maxTokens: number; temperature: number; userId: string }
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens,
        temperature: options.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private getSystemPrompt(): string {
    return `
Jesteś ekspertem od rehabilitacji i fizjoterapii. Analizujesz sesje ćwiczeń użytkowników i dostarczasz strategiczne wskazówki w języku polskim.

TWOJA ROLA:
- Fizjoterapeuta z 15-letnim doświadczeniem
- Specjalista od rehabilitacji biurowych
- Coach motywacyjny i ekspert od długoterminowego progresu

STYL KOMUNIKACJI:
- Używaj języka polskiego
- Bądź konkretny i praktyczny
- Zachowaj profesjonalny ale ciepły ton
- Skup się na długoterminowych korzyściach
- Dostarcz actionable advice

STRUKTURA ODPOWIEDZI:
1. Krótkie podsumowanie sesji (2-3 zdania)
2. Analiza postępu (mocne strony i obszary do poprawy)
3. Konkretne wskazówki techniczne
4. Plan na następne sesje
5. Motywujący komunikat
6. Ostrzeżenia jeśli potrzebne

ZASADY:
- Zawsze znajdź coś pozytywnego do podkreślenia
- Dawaj maksymalnie 3-4 konkretne porady na raz
- Wykorzystuj dane liczbowe do obiektywnej oceny
- Personalizuj rady na podstawie historii użytkownika
- Jeśli widzisz czerwone flagi (ból, znaczące pogorszenie), wyraźnie to zaznacz
    `;
  }

  private buildLiveCoachingPrompt(context: LiveCoachingContext): string {
    return `
LIVE COACHING REQUEST:

Aktualna sytuacja:
- Ćwiczenie: ${context.currentSession.exerciseType}
- Powtórzenie: ${context.currentSession.currentRep}
- Ostatnia jakość: ${context.currentSession.recentQuality.slice(-3).join(', ')}%
- Aktywne błędy: ${context.currentSession.activeErrors.join(', ')}
- Czas ćwiczenia: ${Math.floor(context.currentSession.timeElapsed / 60)} min

Stan użytkownika:
- Poziom frustracji: ${context.userState.frustrationLevel}
- Energia: ${context.userState.energyLevel}  
- Koncentracja: ${context.userState.focusLevel}
- Potrzebuje motywacji: ${context.userState.motivationNeeded ? 'TAK' : 'NIE'}

ZADANIE: Daj krótki (max 15 słów), praktyczny komunikat który pomaga TERAZ. Jeśli użytkownik jest sfrustrowany, bądź bardziej wspierający. Jeśli popełnia błędy, daj konkretną korektę.

ODPOWIEDZ TYLKO KOMUNIKATEM:
    `;
  }

  private mapTriggerToAnalysisType(trigger: CloudTriggerType): EdgeFunctionRequest['analysisType'] {
    switch (trigger) {
      case CloudTriggerType.SESSION_COMPLETE:
        return 'session_summary';
      case CloudTriggerType.WEEKLY_REVIEW:
        return 'weekly_review';
      case CloudTriggerType.LIVE_COACHING:
        return 'live_coaching';
      case CloudTriggerType.PLATEAU_ANALYSIS:
        return 'plateau_analysis';
      default:
        return 'session_summary';
    }
  }

  private getPriorityForTrigger(trigger: CloudTriggerType): EdgeFunctionRequest['priority'] {
    switch (trigger) {
      case CloudTriggerType.LIVE_COACHING:
        return 'urgent';
      case CloudTriggerType.QUALITY_CRISIS:
        return 'high';
      case CloudTriggerType.SESSION_COMPLETE:
        return 'medium';
      default:
        return 'low';
    }
  }

  private generateCacheKey(sessionData: SessionAnalysisInput, trigger: CloudTriggerType): string {
    return `${sessionData.userId}_${trigger}_${sessionData.sessionId}_${Date.now()}`.slice(0, 50);
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimits = this.rateLimitTracker.get(userId);
    
    if (!userLimits) {
      return true;
    }

    if (now > userLimits.resetTime) {
      this.rateLimitTracker.delete(userId);
      return true;
    }

    return userLimits.count < this.config.rateLimitPerUser;
  }

  private updateRateLimit(userId: string): void {
    const now = Date.now();
    const resetTime = now + (60 * 60 * 1000); // 1 hour
    const current = this.rateLimitTracker.get(userId);
    
    if (current && now < current.resetTime) {
      current.count += 1;
    } else {
      this.rateLimitTracker.set(userId, { count: 1, resetTime });
    }
  }

  private getFallbackAnalysis(sessionData: SessionAnalysisInput, trigger: CloudTriggerType): StrategicAnalysis {
    const fallbackMessages = {
      sessionSummary: `Sesja ${sessionData.exerciseId} zakończona. Wykonano ${sessionData.aggregatedMetrics.totalReps} powtórzeń ze średnią jakością ${sessionData.aggregatedMetrics.avgQuality.toFixed(0)}%.`,
      progressAssessment: sessionData.aggregatedMetrics.qualityTrend === 'improving' ? 
        'Widoczny postęp w jakości wykonania.' : 
        'Utrzymanie obecnego poziomu wykonania.',
      technicalGuidance: 'Kontynuuj regularne ćwiczenia zgodnie z planem.',
      nextSteps: 'Zaplanuj następną sesję w ciągu 24-48 godzin.',
      motivationalMessage: 'Każde powtórzenie to krok w kierunku lepszego zdrowia!',
      redFlags: [],
      recommendations: {
        immediateActions: ['Zachowaj regularność ćwiczeń'],
        weeklyFocus: ['Dbaj o poprawną technikę'],
        techniqueImprovements: ['Kontrolowane tempo wykonania'],
        motivationalStrategies: ['Świętuj małe sukcesy']
      },
      insights: {
        strengthsIdentified: ['Regularne wykonywanie ćwiczeń'],
        areasForImprovement: ['Dalsza praca nad techniką'],
        progressIndicators: [`Średnia jakość: ${sessionData.aggregatedMetrics.avgQuality.toFixed(0)}%`],
        riskFactors: []
      },
      personalization: {
        adjustedDifficulty: 'maintain' as const,
        recommendedFrequency: 'Codziennie',
        suggestedExerciseVariations: [],
        motivationStyle: 'encouraging' as const
      },
      confidence: 0.6,
      timestamp: Date.now()
    };

    return fallbackMessages;
  }

  private getFallbackLiveCoaching(context: LiveCoachingContext): string {
    if (context.userState.frustrationLevel === 'high') {
      return 'Spokojnie! Koncentruj się na oddychaniu i kontroli ruchu. 🧘‍♀️';
    }
    
    if (context.currentSession.activeErrors.length > 0) {
      return 'Skoryguj pozycję! Pamiętaj o symetrii i powolnym tempie. 🎯';
    }
    
    return 'Świetnie! Kontynuuj w tym tempie! 💪';
  }

  private prepareWeeklyAnalysisInput(userId: string, weekData: any): SessionAnalysisInput {
    // This would be populated with actual weekly data from database
    return {
      sessionId: `weekly_${userId}_${Date.now()}`,
      exerciseId: 'weekly_summary',
      userId,
      aggregatedMetrics: weekData.summary,
      historicalData: weekData.historical || { 
        previousSessions: [], 
        progressionTrend: 'stable' as const, 
        userGoals: [],
        userLevel: 'intermediate' as const,
        strugglingAreas: [],
        strengths: []
      },
      contextualInfo: {
        timeOfDay: 'various',
        daysSinceLastSession: 0,
        currentWeekProgress: 100,
        monthlyGoal: 100,
        deviceUsed: 'mobile',
        environmentalFactors: []
      }
    };
  }

  private extractAchievements(analysis: StrategicAnalysis): string[] {
    return analysis.insights.strengthsIdentified;
  }

  private extractChallenges(analysis: StrategicAnalysis): string[] {
    return analysis.insights.areasForImprovement;
  }

  private extractGoals(analysis: StrategicAnalysis): string[] {
    return analysis.recommendations.weeklyFocus;
  }

  // Public utility methods
  clearCache(): void {
    this.requestCache.clear();
  }

  getStats() {
    return {
      cacheSize: this.requestCache.size,
      rateLimitedUsers: this.rateLimitTracker.size,
      config: { ...this.config, apiKey: '***hidden***' }
    };
  }

  updateConfig(newConfig: Partial<CloudLLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}