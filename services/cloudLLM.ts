import { ExerciseAnalysisInput, CloudAnalysisResponse } from '../types/ai';

export class CloudLLMService {
  private readonly API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  private readonly MODEL = 'gpt-4';
  
  /**
   * Generuje prompt dla analizy sesji ćwiczeń
   */
  private generateAnalysisPrompt(input: ExerciseAnalysisInput): string {
    const { exerciseType, movementData, sessionMetrics } = input;
    
    return `
Jesteś fizjoterapeutą analizującym sesję ćwiczenia rehabilitacyjnego:

DANE ĆWICZENIA:
- Typ: ${exerciseType}
- Powtórzenia: ${movementData.repCount}
- Średnia jakość ruchu: ${sessionMetrics.avgQuality.toFixed(1)}%
- Wykryte błędy: ${movementData.detectedErrors.join(', ') || 'Brak'}
- Asymetria (średnia): ${(movementData.symmetryScores.reduce((a, b) => a + b, 0) / movementData.symmetryScores.length).toFixed(1)}%
- Zakres ruchu: ${Object.entries(movementData.rangeOfMotion).map(([joint, rom]) => `${joint}: ${rom.toFixed(1)}°`).join(', ')}
- Czas sesji: ${Math.floor(sessionMetrics.totalDuration / 60)} min ${Math.floor(sessionMetrics.totalDuration % 60)} sek

KONTEKST:
Użytkownik wykonuje ćwiczenia rehabilitacyjne. Skup się na bezpieczeństwie, poprawnej technice i motywacji.

Zwróć odpowiedź TYLKO w formacie JSON bez dodatkowego tekstu:
{
  "overallAssessment": "Ogólna ocena w 1-2 zdaniach",
  "technicalFeedback": "Konkretne wskazówki techniczne dotyczące wykrytych problemów",
  "motivationalMessage": "Pozytywny komunikat motywujący (max 30 słów)",
  "nextSessionTips": "2-3 konkretne wskazówki na następną sesję",
  "concernFlags": "Ostrzeżenia o potencjalnych problemach (jeśli są)",
  "score": ${Math.round(sessionMetrics.avgQuality)},
  "suggestions": ["sugestia1", "sugestia2", "sugestia3"]
}`;
  }

  /**
   * Wysyła dane do Cloud LLM i otrzymuje analizę
   */
  async analyzeExerciseSession(input: ExerciseAnalysisInput): Promise<CloudAnalysisResponse> {
    try {
      const prompt = this.generateAnalysisPrompt(input);
      
      // Sprawdź czy mamy klucz API (w prawdziwej aplikacji powinien być w Supabase Edge Functions)
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('No OpenAI API key found, using fallback analysis');
        return this.getFallbackAnalysis(input);
      }
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Cloud LLM API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in Cloud LLM response');
      }
      
      // Parse JSON response
      const analysisResult = JSON.parse(content.trim());
      
      return {
        overallAssessment: analysisResult.overallAssessment,
        technicalFeedback: analysisResult.technicalFeedback,
        motivationalMessage: analysisResult.motivationalMessage,
        nextSessionTips: analysisResult.nextSessionTips,
        concernFlags: analysisResult.concernFlags,
        score: analysisResult.score,
        suggestions: analysisResult.suggestions || []
      };
      
    } catch (error) {
      console.error('Cloud LLM analysis failed:', error);
      return this.getFallbackAnalysis(input);
    }
  }

  /**
   * Fallback analysis gdy Cloud LLM nie działa
   */
  private getFallbackAnalysis(input: ExerciseAnalysisInput): CloudAnalysisResponse {
    const { sessionMetrics, movementData } = input;
    const score = Math.round(sessionMetrics.avgQuality);
    
    let assessment = 'Sesja zakończona pomyślnie!';
    let feedback = 'Kontynuuj regularne ćwiczenia.';
    let motivation = 'Świetna robota! 💪';
    
    if (score >= 80) {
      assessment = 'Doskonała technika wykonania!';
      feedback = 'Twoje ruchy są precyzyjne i kontrolowane. Możesz rozważyć zwiększenie intensywności.';
      motivation = 'Perfekcyjnie! Jesteś na dobrej drodze! 🌟';
    } else if (score >= 60) {
      assessment = 'Dobra technika z małymi niedociągnięciami.';
      feedback = 'Skup się na równomiernym tempie i pełnym zakresie ruchu.';
      motivation = 'Dobrze idzie! Małe poprawki i będzie perfect! 👍';
    } else {
      assessment = 'Technika wymaga poprawy.';
      feedback = 'Zwolnij tempo i skup się na poprawnym wykonaniu ruchów.';
      motivation = 'Nie poddawaj się! Każde ćwiczenie to postęp! 💙';
    }
    
    const suggestions = [
      'Utrzymuj równomierne tempo ruchu',
      'Skup się na pełnym zakresie ruchu',
      'Kontroluj oddech podczas ćwiczenia'
    ];
    
    // Dodaj sugestie specyficzne dla błędów
    if (movementData.detectedErrors.length > 0) {
      if (movementData.detectedErrors.includes('asymmetric')) {
        suggestions.push('Zwróć uwagę na symetrię ruchu');
      }
      if (movementData.detectedErrors.includes('limited_rom')) {
        suggestions.push('Zwiększ zakres ruchu stopniowo');
      }
    }
    
    return {
      overallAssessment: assessment,
      technicalFeedback: feedback,
      motivationalMessage: motivation,
      nextSessionTips: 'Kontynuuj regularne ćwiczenia. Skup się na jakości, nie na ilości.',
      concernFlags: score < 40 ? 'Rozważ konsultację z fizjoterapeutą' : undefined,
      score,
      suggestions: suggestions.slice(0, 3)
    };
  }

  /**
   * Analiza szybka - dla rzeczywistego użycia bez Cloud LLM
   */
  async quickAnalysis(
    score: number, 
    repCount: number, 
    errors: string[]
  ): Promise<{ feedback: string; suggestions: string[] }> {
    
    let feedback = 'Kontynuuj ćwiczenia!';
    const suggestions: string[] = [];
    
    if (score >= 80) {
      feedback = 'Doskonała technika! Możesz zwiększyć intensywność.';
      suggestions.push('Rozważ dodanie większej liczby powtórzeń');
    } else if (score >= 60) {
      feedback = 'Dobra technika. Skup się na detalach.';
      suggestions.push('Zwolnij tempo i skup się na precyzji');
    } else {
      feedback = 'Technika wymaga poprawy. Zwolnij i skup się na formie.';
      suggestions.push('Zmniejsz zakres ruchu i skup się na kontroli');
    }
    
    suggestions.push('Utrzymuj równomierne tempo');
    suggestions.push('Kontroluj oddech');
    
    return { feedback, suggestions };
  }
}

export const cloudLLMService = new CloudLLMService();