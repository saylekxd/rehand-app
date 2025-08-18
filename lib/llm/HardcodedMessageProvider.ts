import { LLMTriggerEvent, LLMTriggerType, HardcodedMessages } from './types';

export class HardcodedMessageProvider {
  private messages: HardcodedMessages = {
    completion: {
      excellent: [
        'Doskonale! 💪 Jakość ruchu na najwyższym poziomie!',
        'Świetna technika! 🎯 Kontynuuj w tym tempie!',
        'Perfekcyjnie wykonane! 🌟 Jesteś mistrzem!',
        'Brawo! 👏 To był wzorowy ruch!',
        'Excellent! 🚀 Twoja forma robi wrażenie!',
        'Niesamowicie precyzyjnie! ✨ Tak trzymaj!',
        'Fantastyczna jakość! 🏆 Jesteś na dobrej drodze!'
      ],
      good: [
        'Bardzo dobrze! 👍 Lekka poprawa i będzie idealnie!',
        'Dobra robota! 💪 Widać postęp w technice!',
        'Świetnie się starasz! 🎯 Małe korekty i perfect!',
        'Dobrze idzie! 🌟 Jeszcze trochę koncentracji!',
        'Niezła forma! 👌 Kontynuuj ćwiczenia!',
        'Solidny ruch! 💥 Pracuj nad stabilnością!',
        'Dobre tempo! ⏰ Pamiętaj o kontroli!'
      ],
      needsWork: [
        'Nie poddawaj się! 💪 Każde powtórzenie to postęp!',
        'Spokojnie! 🎯 Skoncentruj się na technice!',
        'Ćwicz dalej! 🌟 Efekty przyjdą z czasem!',
        'Poprawa wymaga czasu! 💪 Jesteś na dobrej drodze!',
        'Nie martw się! 👍 Wszyscy się uczą!',
        'Krok po kroku! 🚶‍♂️ Jakość przed ilością!',
        'Cierpliwość! 🧘‍♀️ Technika to podstawa!'
      ]
    },
    errors: {
      asymmetricMovement: [
        'Sprawdź symetrię! ⚖️ Lewa i prawa strona równomiernie!',
        'Pamiętaj o równowadze! 🎯 Oba boki jednakowo!',
        'Symetria to klucz! 🔑 Kontroluj oba ramiona/nogi!',
        'Równomierne ruchy! 📐 Jedna strona nie może dominować!',
        'Balance! ⚡ Prawa i lewa strona w harmonii!'
      ],
      limitedROM: [
        'Większy zakres! 📏 Wykorzystaj pełny ruch!',
        'Głębiej! 💪 Twoje ciało może więcej!',
        'Pełny ruch! 🔄 Nie skracaj amplitudy!',
        'Rozciągnij się! 🌟 Większy zasięg to lepsze efekty!',
        'Full range! 📈 Maksymalna amplituda ruchu!'
      ],
      improperTempo: [
        'Zwolnij tempo! ⏰ Kontrola jest ważniejsza od prędkości!',
        'Spokojniejszy rytm! 🎵 Jakość przed szybkością!',
        'Powoli i pewnie! 🐢 Kontrolowane ruchy!',
        'Zatrzymaj się na moment! ⏸️ Poczuj mięśnie!',
        'Steady pace! 📊 Równomierne tempo to cel!'
      ],
      valgusKnee: [
        'Kolana na zewnątrz! 🦵 Nie pozwól im schodzić do środka!',
        'Stabilne kolana! 🎯 Trzymaj je w linii ze stopami!',
        'Kontroluj kolana! 💪 Na zewnątrz podczas ruchu!',
        'Knee alignment! 📐 Kolana nad stopami!',
        'Silne kolana! 🔥 Nie pozwól im opadać!'
      ],
      headForwardPosture: [
        'Głowa do tyłu! 👑 Szyja w naturalnej pozycji!',
        'Prosty kark! 📏 Nie wyciągaj głowy do przodu!',
        'Neutral neck! 🧘‍♀️ Głowa nad ramionami!',
        'Dumna postawa! 👸 Podnieś głowę!',
        'Spine alignment! 📐 Kręgosłup w linii!'
      ]
    },
    motivation: {
      general: [
        'Świetna energia! 🔥 Kontynuuj!',
        'Jesteś silniejszy niż myślisz! 💪',
        'Każde powtórzenie to inwestycja w zdrowie! 💎',
        'Robiłeś trudniejsze rzeczy! 🚀',
        'Twoje ciało Ci dziękuje! 🙏',
        'Progress not perfection! 📈',
        'Jesteś na dobrej drodze! 🌟'
      ],
      milestone: [
        'Milestone achieved! 🏆 Świetnie!',
        'Nowy rekord! 🎉 Brawo!',
        'Achievement unlocked! ✨ Fantastycznie!',
        'Level up! 📈 Jesteś coraz lepszy!',
        'Personal best! 🥇 Niesamowite!',
        'Breakthrough moment! 💥 Tak trzymaj!'
      ],
      comeback: [
        'Welcome back! 🎉 Cieszę się, że wróciłeś!',
        'Świetnie, że tu jesteś! 💪',
        'Powrót króla! 👑 Let\'s do this!',
        'Missed you! 🌟 Czas na action!',
        'Back in business! 🔥 Jedziemy z tym!'
      ],
      streak: [
        'Streak continues! 🔥 Nie zatrzymuj się!',
        'Consistency king! 👑 Tak trzymaj!',
        'On fire! 🚀 Świetna regularność!',
        'Unstoppable! ⚡ Jesteś w formie!',
        'Habit master! 🎯 To jest moc!'
      ]
    },
    encouragement: {
      struggling: [
        'Trudne chwile budują charakter! 💪',
        'Każdy ekspert był kiedyś początkującym! 🌱',
        'Rome wasn\'t built in a day! 🏛️',
        'Małe kroki, wielkie efekty! 👣',
        'Believe in yourself! 🌟 Ja w Ciebie wierzę!',
        'Przezwyciężysz to! 🔥 Jesteś silny!'
      ],
      improvement: [
        'Widać poprawę! 📈 Świetnie!',
        'Better than yesterday! ⬆️',
        'Progress detected! 🎯 Tak trzymaj!',
        'Improvement mode: ON! 🔥',
        'Growing stronger! 💪 Brawo!',
        'Your efforts are paying off! 💎'
      ],
      consistency: [
        'Regularność to klucz! 🗝️',
        'Consistency wins! 🏆 Świetnie!',
        'Daily progress! 📊 Fantastycznie!',
        'Building habits! 🔧 Perfect!',
        'Steady wins the race! 🏁',
        'Long-term thinking! 🧠 Brawo!'
      ]
    }
  };

  async getMessage(triggerEvent: LLMTriggerEvent): Promise<string> {
    // Simulate small delay to match LLM behavior
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
    return this.getMessageSync(triggerEvent);
  }

  getMessageSync(triggerEvent: LLMTriggerEvent): string {
    const context = triggerEvent.data;
    
    switch (triggerEvent.type) {
      case LLMTriggerType.REP_COMPLETED:
        return this.getCompletionMessage(context.qualityScore);
        
      case LLMTriggerType.ERROR_DETECTED:
        return this.getErrorMessage(context.currentErrors);
        
      case LLMTriggerType.QUALITY_DROP:
        return this.getEncouragementMessage('struggling');
        
      case LLMTriggerType.MOTIVATIONAL_TIMER:
        return this.getMotivationalMessage('general');
        
      case LLMTriggerType.SESSION_MILESTONE:
        return this.getMotivationalMessage('milestone');
        
      case LLMTriggerType.NEW_PERSONAL_BEST:
        return this.getMotivationalMessage('milestone');
        
      case LLMTriggerType.LONG_PAUSE:
        return this.getMotivationalMessage('comeback');
        
      case LLMTriggerType.ENCOURAGEMENT:
        return this.getEncouragementMessage('improvement');
        
      case LLMTriggerType.SESSION_COMPLETE:
        return this.getSessionCompleteMessage(context);
        
      default:
        return this.getRandomMessage(this.messages.motivation.general);
    }
  }

  private getCompletionMessage(qualityScore: number): string {
    if (qualityScore >= 85) {
      return this.getRandomMessage(this.messages.completion.excellent);
    } else if (qualityScore >= 65) {
      return this.getRandomMessage(this.messages.completion.good);
    } else {
      return this.getRandomMessage(this.messages.completion.needsWork);
    }
  }

  private getErrorMessage(errors: string[]): string {
    if (errors.length === 0) {
      return this.getRandomMessage(this.messages.completion.excellent);
    }
    
    // Get message for the first/most important error
    const primaryError = errors[0];
    const errorMessages = (this.messages.errors as any)[primaryError];
    
    if (errorMessages && errorMessages.length > 0) {
      return this.getRandomMessage(errorMessages);
    }
    
    return this.getRandomMessage(this.messages.completion.needsWork);
  }

  private getMotivationalMessage(category: 'general' | 'milestone' | 'comeback' | 'streak'): string {
    return this.getRandomMessage(this.messages.motivation[category]);
  }

  private getEncouragementMessage(category: 'struggling' | 'improvement' | 'consistency'): string {
    return this.getRandomMessage(this.messages.encouragement[category]);
  }

  private getSessionCompleteMessage(context: any): string {
    const avgQuality = context.sessionStats.avgQuality;
    const repsCompleted = context.sessionStats.repsCompleted;
    
    if (avgQuality >= 80 && repsCompleted >= 10) {
      return `Świetna sesja! 🏆 ${repsCompleted} powtórzeń z jakością ${avgQuality.toFixed(0)}%! Brawo!`;
    } else if (avgQuality >= 60) {
      return `Dobra robota! 👍 ${repsCompleted} powtórzeń ukończone. Kontynuuj pracę!`;
    } else {
      return `Sesja zakończona! 💪 ${repsCompleted} powtórzeń to dobry start. Efekty przyjdą z czasem!`;
    }
  }

  private getRandomMessage(messages: string[]): string {
    if (messages.length === 0) {
      return 'Świetnie się starasz! 💪';
    }
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  // Add new messages dynamically
  addCustomMessage(category: string, subcategory: string, message: string): void {
    if (!(this.messages as any)[category]) {
      (this.messages as any)[category] = {};
    }
    
    if (!(this.messages as any)[category][subcategory]) {
      (this.messages as any)[category][subcategory] = [];
    }
    
    (this.messages as any)[category][subcategory].push(message);
  }

  // Get message statistics
  getMessageStats() {
    let totalMessages = 0;
    
    Object.values(this.messages).forEach(category => {
      Object.values(category).forEach(subcategory => {
        totalMessages += subcategory.length;
      });
    });

    return {
      totalMessages,
      categories: Object.keys(this.messages).length,
      completionMessages: Object.values(this.messages.completion).reduce((sum, arr) => sum + arr.length, 0),
      errorMessages: Object.values(this.messages.errors).reduce((sum, arr) => sum + arr.length, 0),
      motivationMessages: Object.values(this.messages.motivation).reduce((sum, arr) => sum + arr.length, 0),
      encouragementMessages: Object.values(this.messages.encouragement).reduce((sum, arr) => sum + arr.length, 0)
    };
  }
}