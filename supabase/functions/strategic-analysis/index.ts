// Strategic Analysis Edge Function for Supabase
// This function handles GPT-4 strategic analysis requests

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EdgeFunctionRequest {
  sessionData: any;
  analysisType: 'session_summary' | 'weekly_review' | 'live_coaching' | 'plateau_analysis';
  userPreferences: {
    language: 'pl' | 'en';
    detailLevel: 'brief' | 'detailed' | 'comprehensive';
    focusAreas: string[];
    communicationStyle: 'formal' | 'casual' | 'motivational';
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface EdgeFunctionResponse {
  success: boolean;
  analysis?: any;
  error?: string;
  tokensUsed: number;
  processingTime: number;
  cacheHit: boolean;
  cost: number;
  requestId: string;
}

serve(async (req) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed');
    }

    // Parse request
    const requestBody: EdgeFunctionRequest = await req.json();
    console.log(`📊 Strategic analysis request: ${requestBody.analysisType} for user ${requestBody.sessionData.userId}`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check cache first
    const cacheKey = generateCacheKey(requestBody);
    const { data: cachedAnalysis } = await supabaseClient
      .from('strategic_analysis_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedAnalysis) {
      console.log('📦 Using cached strategic analysis');
      return new Response(JSON.stringify({
        success: true,
        analysis: cachedAnalysis.analysis_data,
        tokensUsed: 0,
        processingTime: Date.now() - startTime,
        cacheHit: true,
        cost: 0,
        requestId
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Generate OpenAI prompt based on analysis type
    const prompt = generatePrompt(requestBody);
    
    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: getSystemPrompt(requestBody.userPreferences.language)
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: getMaxTokens(requestBody.userPreferences.detailLevel),
        temperature: 0.7,
        functions: requestBody.analysisType === 'session_summary' ? [{
          name: 'format_strategic_analysis',
          description: 'Format the strategic analysis response',
          parameters: {
            type: 'object',
            properties: {
              sessionSummary: { type: 'string' },
              progressAssessment: { type: 'string' },
              technicalGuidance: { type: 'string' },
              nextSteps: { type: 'string' },
              motivationalMessage: { type: 'string' },
              redFlags: { 
                type: 'array',
                items: { type: 'string' }
              },
              recommendations: {
                type: 'object',
                properties: {
                  immediateActions: { type: 'array', items: { type: 'string' } },
                  weeklyFocus: { type: 'array', items: { type: 'string' } },
                  techniqueImprovements: { type: 'array', items: { type: 'string' } },
                  motivationalStrategies: { type: 'array', items: { type: 'string' } }
                }
              },
              insights: {
                type: 'object',
                properties: {
                  strengthsIdentified: { type: 'array', items: { type: 'string' } },
                  areasForImprovement: { type: 'array', items: { type: 'string' } },
                  progressIndicators: { type: 'array', items: { type: 'string' } },
                  riskFactors: { type: 'array', items: { type: 'string' } }
                }
              },
              personalization: {
                type: 'object',
                properties: {
                  adjustedDifficulty: { type: 'string', enum: ['increase', 'maintain', 'decrease'] },
                  recommendedFrequency: { type: 'string' },
                  suggestedExerciseVariations: { type: 'array', items: { type: 'string' } },
                  motivationStyle: { type: 'string', enum: ['encouraging', 'challenging', 'educational'] }
                }
              },
              confidence: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: [
              'sessionSummary', 'progressAssessment', 'technicalGuidance', 
              'nextSteps', 'motivationalMessage', 'confidence'
            ]
          }
        }] : undefined,
        function_call: requestBody.analysisType === 'session_summary' ? 
          { name: 'format_strategic_analysis' } : undefined
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log(`🤖 OpenAI response received: ${openaiData.usage.total_tokens} tokens`);

    // Process response
    let analysis;
    if (requestBody.analysisType === 'session_summary' && openaiData.choices[0].function_call) {
      analysis = JSON.parse(openaiData.choices[0].function_call.arguments);
      analysis.timestamp = Date.now();
    } else {
      // For other analysis types, parse the text response
      analysis = parseTextResponse(openaiData.choices[0].message.content, requestBody.analysisType);
    }

    // Calculate cost (rough estimation)
    const cost = calculateCost(openaiData.usage.total_tokens, 'gpt-4');

    // Cache the result
    await supabaseClient
      .from('strategic_analysis_cache')
      .insert({
        cache_key: cacheKey,
        analysis_data: analysis,
        user_id: requestBody.sessionData.userId,
        analysis_type: requestBody.analysisType,
        tokens_used: openaiData.usage.total_tokens,
        cost: cost,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour cache
      });

    // Log usage for analytics
    await supabaseClient
      .from('strategic_analysis_usage')
      .insert({
        user_id: requestBody.sessionData.userId,
        session_id: requestBody.sessionData.sessionId,
        analysis_type: requestBody.analysisType,
        tokens_used: openaiData.usage.total_tokens,
        cost: cost,
        processing_time: Date.now() - startTime,
        request_id: requestId
      });

    const response: EdgeFunctionResponse = {
      success: true,
      analysis,
      tokensUsed: openaiData.usage.total_tokens,
      processingTime: Date.now() - startTime,
      cacheHit: false,
      cost,
      requestId
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('❌ Strategic analysis error:', error);
    
    const errorResponse: EdgeFunctionResponse = {
      success: false,
      error: error.message,
      tokensUsed: 0,
      processingTime: Date.now() - startTime,
      cacheHit: false,
      cost: 0,
      requestId
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});

function generateCacheKey(request: EdgeFunctionRequest): string {
  const keyData = {
    userId: request.sessionData.userId,
    analysisType: request.analysisType,
    avgQuality: Math.floor(request.sessionData.aggregatedMetrics.avgQuality / 10) * 10,
    totalReps: request.sessionData.aggregatedMetrics.totalReps,
    mainErrors: Object.keys(request.sessionData.aggregatedMetrics.commonErrors).slice(0, 2)
  };
  
  return btoa(JSON.stringify(keyData)).slice(0, 50);
}

function generatePrompt(request: EdgeFunctionRequest): string {
  const { sessionData, analysisType, userPreferences } = request;

  const basePrompt = `
ANALIZA STRATEGICZNA SESJI REHABILITACYJNEJ

DANE SESJI:
- ID Sesji: ${sessionData.sessionId}
- Ćwiczenie: ${sessionData.exerciseId}
- Całkowite powtórzenia: ${sessionData.aggregatedMetrics.totalReps}
- Średnia jakość: ${sessionData.aggregatedMetrics.avgQuality.toFixed(1)}%
- Trend jakości: ${sessionData.aggregatedMetrics.qualityTrend}
- Czas trwania: ${Math.floor(sessionData.aggregatedMetrics.sessionDuration / 60)} min
- Najczęstsze błędy: ${Object.entries(sessionData.aggregatedMetrics.commonErrors)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([error, count]) => `${error} (${count}x)`)
    .join(', ')}

DANE HISTORYCZNE:
- Trend postępu: ${sessionData.historicalData.progressionTrend}
- Poziom użytkownika: ${sessionData.historicalData.userLevel}
- Cele: ${sessionData.historicalData.userGoals.join(', ')}
- Obszary problemowe: ${sessionData.historicalData.strugglingAreas.join(', ')}
- Mocne strony: ${sessionData.historicalData.strengths.join(', ')}

PREFERENCJE UŻYTKOWNIKA:
- Styl komunikacji: ${userPreferences.communicationStyle}
- Poziom szczegółów: ${userPreferences.detailLevel}
- Obszary zainteresowania: ${userPreferences.focusAreas.join(', ')}
  `;

  switch (analysisType) {
    case 'session_summary':
      return basePrompt + `
ZADANIE: Przygotuj pełną strategiczną analizę tej sesji używając funkcji format_strategic_analysis.

WYMAGANIA:
1. Konkretne i actionable wskazówki
2. Uwzględnienie historii i trendów użytkownika
3. Personalizacja na podstawie poziomu i celów
4. Wykrycie potencjalnych problemów lub czerwonych flag
5. Motywujący ale realistyczny ton

Odpowiedz używając funkcji format_strategic_analysis.`;

    case 'weekly_review':
      return basePrompt + `
ZADANIE: Przygotuj tygodniowe podsumowanie postępu i strategię na następny tydzień.

Skup się na:
- Trendach tygodniowych
- Długoterminowym postępie
- Korektach w planie treningowym
- Motywacji do kontynuacji

Odpowiedz w strukturze: Podsumowanie tygodnia | Analiza postępu | Plan na następny tydzień | Motywacja (każda sekcja max 100 słów)`;

    case 'live_coaching':
      return basePrompt + `
ZADANIE: Daj konkretną, krótką poradę do natychmiastowego zastosowania podczas ćwiczenia.

Aktualny kontekst: Użytkownik TERAZ wykonuje ćwiczenie i potrzebuje szybkiej pomocy.

Odpowiedz w max 20 słowach konkretną poradą.`;

    case 'plateau_analysis':
      return basePrompt + `
ZADANIE: Przeanalizuj przyczyny plateau i zaproponuj strategię przełamania stagnacji.

Skup się na:
- Identyfikacji przyczyn stagnacji
- Nowych strategiach treningowych
- Motywacji psychologicznej
- Konkretnych zmianach w podejściu

Odpowiedz w strukturze: Analiza przyczyn | Strategia przełamania | Plan działania | Wsparcie motywacyjne (każda sekcja max 80 słów)`;

    default:
      return basePrompt;
  }
}

function getSystemPrompt(language: 'pl' | 'en'): string {
  if (language === 'pl') {
    return `
Jesteś ekspertem fizjoterapeutą z 15-letnim doświadczeniem w rehabilitacji biurowej i analizie ruchu.

TWOJA EKSPERTYZA:
- Fizjoterapia i rehabilitacja
- Analiza wzorców ruchowych
- Psychologia motywacji w zdrowiu
- Personalizacja planów treningowych

STYL ODPOWIEDZI:
- Konkretny i praktyczny
- Oparty na faktach i danych
- Motywujący ale realistyczny  
- Dostosowany do poziomu użytkownika
- Uwzględniający kontekst historyczny

ZASADY:
- Zawsze podaj konkretne, możliwe do wykonania porady
- Wykorzystaj dane liczbowe w analizie
- Personalizuj rady na podstawie historii i celów użytkownika
- Jeśli widzisz niepokojące trendy, wyraźnie to zaznacz
- Zachęcaj do długoterminowego myślenia o zdrowiu
- Używaj języka zrozumiałego dla laika
`;
  } else {
    return `
You are an expert physiotherapist with 15 years of experience in workplace rehabilitation and movement analysis.

YOUR EXPERTISE:
- Physiotherapy and rehabilitation
- Movement pattern analysis
- Health motivation psychology
- Personalized training plan development

RESPONSE STYLE:
- Concrete and practical
- Data-driven and evidence-based
- Motivating but realistic
- Adapted to user's level
- Considering historical context

PRINCIPLES:
- Always provide specific, actionable advice
- Use numerical data in analysis
- Personalize advice based on history and goals
- If you see concerning trends, clearly highlight them
- Encourage long-term health thinking
- Use language understandable to laypeople
`;
  }
}

function getMaxTokens(detailLevel: string): number {
  switch (detailLevel) {
    case 'brief': return 500;
    case 'detailed': return 1000;
    case 'comprehensive': return 1500;
    default: return 1000;
  }
}

function parseTextResponse(text: string, analysisType: string): any {
  // Simple text parsing for non-function responses
  const lines = text.split('\n').filter(line => line.trim());
  
  return {
    sessionSummary: lines[0] || text.substring(0, 200),
    progressAssessment: 'Analiza postępu na podstawie obecnej sesji.',
    technicalGuidance: 'Kontynuuj zgodnie z obecnym planem.',
    nextSteps: 'Zaplanuj następną sesję w ciągu 24-48 godzin.',
    motivationalMessage: 'Świetna robota! Każde ćwiczenie przybliża Cię do celu!',
    redFlags: [],
    recommendations: {
      immediateActions: ['Regularność ćwiczeń'],
      weeklyFocus: ['Poprawa techniki'],
      techniqueImprovements: ['Kontrola tempa'],
      motivationalStrategies: ['Świętowanie postępów']
    },
    insights: {
      strengthsIdentified: ['Ukończenie sesji'],
      areasForImprovement: ['Dalszy rozwój'],
      progressIndicators: ['Regularne ćwiczenie'],
      riskFactors: []
    },
    personalization: {
      adjustedDifficulty: 'maintain',
      recommendedFrequency: 'Codziennie',
      suggestedExerciseVariations: [],
      motivationStyle: 'encouraging'
    },
    confidence: 0.7,
    timestamp: Date.now()
  };
}

function calculateCost(tokens: number, model: string): number {
  // GPT-4 pricing (as of 2024)
  const inputCostPer1K = 0.03;
  const outputCostPer1K = 0.06;
  
  // Rough estimation assuming 50/50 input/output split
  return ((tokens / 2) * inputCostPer1K + (tokens / 2) * outputCostPer1K) / 1000;
}
