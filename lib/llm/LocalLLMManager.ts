import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { DeviceCapabilityDetector } from '../vision/DeviceCapabilities';
import { 
  LocalLLMConfig, 
  LocalLLMOptions, 
  LocalLLMResponse, 
  LLMTriggerEvent,
  LocalLLMPrompt,
  HardcodedMessages
} from './types';
import { HardcodedMessageProvider } from './HardcodedMessageProvider';

export class LocalLLMManager {
  private static instance: LocalLLMManager;
  private currentConfig: LocalLLMConfig | null = null;
  private isInitialized = false;
  private model: any = null;
  private messageProvider: HardcodedMessageProvider;
  private responseCache = new Map<string, LocalLLMResponse>();
  private requestQueue: LLMTriggerEvent[] = [];
  private isProcessing = false;

  private constructor() {
    this.messageProvider = new HardcodedMessageProvider();
  }

  static getInstance(): LocalLLMManager {
    if (!LocalLLMManager.instance) {
      LocalLLMManager.instance = new LocalLLMManager();
    }
    return LocalLLMManager.instance;
  }

  async initialize(): Promise<void> {
    console.log('🤖 Initializing Local LLM Manager...');

    try {
      // Detect device capabilities
      const capabilityDetector = DeviceCapabilityDetector.getInstance();
      const capabilities = await capabilityDetector.detectCapabilities();

      // Select best available LLM configuration
      this.currentConfig = await this.selectBestModel(capabilities);

      if (this.currentConfig.provider !== 'none') {
        // Initialize the selected LLM
        await this.initializeLLM(this.currentConfig);
      }

      this.isInitialized = true;
      console.log(`✅ Local LLM Manager initialized with: ${this.currentConfig.provider}/${this.currentConfig.model}`);
    
    } catch (error) {
      console.error('❌ Failed to initialize Local LLM Manager:', error);
      
      // Fallback to hardcoded messages
      this.currentConfig = {
        provider: 'none',
        model: 'hardcoded',
        memoryRequirement: '0GB',
        responseTime: '<10ms',
        language: 'pl'
      };
      this.isInitialized = true;
    }
  }

  private async selectBestModel(capabilities: any): Promise<LocalLLMConfig> {
    const deviceRAM = capabilities.totalMemoryGB;
    const availableStorage = capabilities.availableStorageGB;
    const tier = capabilities.tier;

    console.log(`📊 Device specs: ${deviceRAM.toFixed(1)}GB RAM, ${availableStorage.toFixed(1)}GB storage, tier: ${tier}`);

    // Ultra tier devices (8GB+ RAM)
    if (deviceRAM >= 8 && availableStorage >= 20 && tier === 'ultra') {
      return {
        provider: 'MLC',
        model: 'llama2-7b-q4',
        memoryRequirement: '6-8GB',
        responseTime: '500-1000ms',
        language: 'pl'
      };
    }

    // Pro tier devices (6GB+ RAM)
    if (deviceRAM >= 6 && availableStorage >= 15 && (tier === 'pro' || tier === 'ultra')) {
      return {
        provider: 'MLC',
        model: 'phi-2-q4',
        memoryRequirement: '4-6GB',
        responseTime: '300-700ms',
        language: 'pl'
      };
    }

    // Enhanced tier devices (4GB+ RAM)
    if (deviceRAM >= 4 && availableStorage >= 10 && tier !== 'basic') {
      return {
        provider: 'ReactNativeAI',
        model: 'phi-3-mini',
        memoryRequirement: '3-4GB',
        responseTime: '200-500ms',
        language: 'pl'
      };
    }

    // Enhanced tier with limited storage
    if (deviceRAM >= 3 && availableStorage >= 5) {
      return {
        provider: 'ReactNativeAI',
        model: 'tinyllama',
        memoryRequirement: '2-3GB',
        responseTime: '100-300ms',
        language: 'pl'
      };
    }

    // Fallback to hardcoded messages
    console.log('📱 Device specs insufficient for local LLM, using hardcoded messages');
    return {
      provider: 'none',
      model: 'hardcoded',
      memoryRequirement: '0GB',
      responseTime: '<10ms',
      language: 'pl'
    };
  }

  private async initializeLLM(config: LocalLLMConfig): Promise<void> {
    switch (config.provider) {
      case 'ReactNativeAI':
        await this.initializeReactNativeAI(config.model);
        break;
      case 'MLC':
        await this.initializeMLC(config.model);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  private async initializeReactNativeAI(modelName: string): Promise<void> {
    try {
      // TODO: Initialize React Native AI
      console.log(`🔧 Initializing React Native AI with ${modelName}...`);
      
      // Mock initialization for now
      this.model = {
        generate: this.mockGenerate.bind(this),
        isReady: () => true
      };
      
      console.log('✅ React Native AI initialized');
    } catch (error) {
      console.error('❌ Failed to initialize React Native AI:', error);
      throw error;
    }
  }

  private async initializeMLC(modelName: string): Promise<void> {
    try {
      // TODO: Initialize MLC
      console.log(`🔧 Initializing MLC with ${modelName}...`);
      
      // Mock initialization for now
      this.model = {
        generate: this.mockGenerate.bind(this),
        isReady: () => true
      };
      
      console.log('✅ MLC initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MLC:', error);
      throw error;
    }
  }

  // Mock generate function for development
  private async mockGenerate(prompt: string, options: any): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Simple rule-based responses for development
    if (prompt.includes('excellent') || prompt.includes('doskonale')) {
      return 'Świetna robota! 💪 Kontynuuj w tym tempie!';
    }
    
    if (prompt.includes('error') || prompt.includes('błąd')) {
      return 'Spróbuj skorygować pozycję. Pamiętaj o symetrii ruchów! 🎯';
    }
    
    if (prompt.includes('motivation') || prompt.includes('motywacja')) {
      return 'Jesteś na dobrej drodze! Każde powtórzenie Cię wzmacnia! 🌟';
    }
    
    return 'Świetnie się starasz! Tak trzymaj! 👍';
  }

  async generateResponse(triggerEvent: LLMTriggerEvent): Promise<LocalLLMResponse> {
    if (!this.isInitialized) {
      console.warn('LocalLLMManager not initialized yet');
      return this.getFallbackResponse(triggerEvent);
    }

    const startTime = performance.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(triggerEvent);
      if (this.responseCache.has(cacheKey)) {
        const cachedResponse = this.responseCache.get(cacheKey)!;
        return { ...cachedResponse, responseTime: performance.now() - startTime };
      }

      // Use local LLM or fallback to hardcoded messages
      let message: string;
      let isFallback = false;

      if (this.currentConfig!.provider === 'none' || !this.model) {
        message = await this.messageProvider.getMessage(triggerEvent);
        isFallback = true;
      } else {
        // Generate prompt and use local LLM
        const prompt = this.generatePrompt(triggerEvent);
        message = await this.model.generate(prompt.userTemplate, {
          max_tokens: prompt.maxTokens,
          temperature: prompt.temperature
        });
      }

      const response: LocalLLMResponse = {
        message,
        confidence: isFallback ? 0.8 : 0.9,
        responseTime: performance.now() - startTime,
        tokensGenerated: message.split(' ').length,
        isFallback,
        timestamp: Date.now()
      };

      // Cache response
      this.responseCache.set(cacheKey, response);

      return response;

    } catch (error) {
      console.error('Error generating LLM response:', error);
      return this.getFallbackResponse(triggerEvent);
    }
  }

  private generatePrompt(triggerEvent: LLMTriggerEvent): LocalLLMPrompt {
    const context = triggerEvent.data;
    
    const systemPrompt = `
    Jesteś trenerem rehabilitacji. Daj krótki (max 20 słów), 
    motywujący komunikat w języku polskim na podstawie danych o ćwiczeniu.
    Bądź pozytywny, konkretny i pomocny.
    `;
    
    const userTemplate = `
    Ćwiczenie: ${context.exerciseType}
    Jakość ruchu: ${context.qualityScore}/100
    Błędy wykryte: ${context.currentErrors.join(', ') || 'brak'}
    Numer powtórzenia: ${context.sessionStats.repsCompleted}
    Czas sesji: ${Math.floor(context.sessionStats.timeElapsed / 60)} min
    
    Odpowiedz TYLKO krótkim, pozytywnym komunikatem w języku polskim.
    `;

    return {
      systemPrompt,
      userTemplate,
      maxTokens: 50,
      temperature: 0.7,
      context: {
        exerciseName: context.exerciseType,
        qualityScore: context.qualityScore,
        errors: context.currentErrors,
        repNumber: context.sessionStats.repsCompleted,
        sessionTime: context.sessionStats.timeElapsed,
        userLevel: 'intermediate' // TODO: Get from user profile
      }
    };
  }

  private getFallbackResponse(triggerEvent: LLMTriggerEvent): LocalLLMResponse {
    const message = this.messageProvider.getMessageSync(triggerEvent);
    
    return {
      message,
      confidence: 0.8,
      responseTime: 5,
      tokensGenerated: message.split(' ').length,
      isFallback: true,
      timestamp: Date.now()
    };
  }

  private generateCacheKey(triggerEvent: LLMTriggerEvent): string {
    const context = triggerEvent.data;
    return `${triggerEvent.type}_${context.exerciseType}_${Math.floor(context.qualityScore / 10)}_${context.currentErrors.join('_')}`;
  }

  // Queue management for multiple requests
  async queueResponse(triggerEvent: LLMTriggerEvent): Promise<void> {
    this.requestQueue.push(triggerEvent);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const event = this.requestQueue.shift()!;
      
      // Process high priority events immediately
      if (event.priority === 'urgent' || event.priority === 'high') {
        await this.generateResponse(event);
      }
    }

    this.isProcessing = false;
  }

  // Public methods
  isReady(): boolean {
    return this.isInitialized && (this.currentConfig?.provider === 'none' || (this.model && this.model.isReady()));
  }

  getCurrentConfig(): LocalLLMConfig | null {
    return this.currentConfig;
  }

  canUseLocalLLM(): boolean {
    return this.currentConfig?.provider !== 'none';
  }

  clearCache(): void {
    this.responseCache.clear();
  }

  getStats() {
    return {
      isInitialized: this.isInitialized,
      provider: this.currentConfig?.provider || 'none',
      model: this.currentConfig?.model || 'none',
      cacheSize: this.responseCache.size,
      queueSize: this.requestQueue.length,
      canUseLocalLLM: this.canUseLocalLLM()
    };
  }

  dispose(): void {
    this.model = null;
    this.responseCache.clear();
    this.requestQueue = [];
    this.isInitialized = false;
    console.log('🧹 Local LLM Manager disposed');
  }
}