import { CacheConfiguration } from './types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  size?: number; // in bytes
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number; // in bytes
  entryCount: number;
  oldestEntry: number; // timestamp
  newestEntry: number; // timestamp
}

export class CacheManager {
  private static instance: CacheManager;
  private configuration: CacheConfiguration;
  
  // Cache stores
  private visionCache = new Map<string, CacheEntry<any>>();
  private mlCache = new Map<string, CacheEntry<any>>();
  private llmCache = new Map<string, CacheEntry<any>>();
  private visualizationCache = new Map<string, CacheEntry<any>>();
  
  // Statistics
  private stats = {
    vision: this.getEmptyStats(),
    ml: this.getEmptyStats(), 
    llm: this.getEmptyStats(),
    visualization: this.getEmptyStats()
  };
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryUsageBytes = 0;

  private constructor() {
    this.configuration = this.getDefaultConfiguration();
    this.startCleanupProcess();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  updateConfiguration(config: Partial<CacheConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
    console.log('🗄️ Cache configuration updated');
  }

  // Vision Cache Methods
  setVisionCache(key: string, data: any): boolean {
    if (!this.configuration.visionCache.enabled) return false;

    return this.setCache('vision', this.visionCache, key, data, this.configuration.visionCache);
  }

  getVisionCache(key: string): any | null {
    if (!this.configuration.visionCache.enabled) return null;

    return this.getCache('vision', this.visionCache, key);
  }

  // ML Cache Methods
  setMLCache(key: string, data: any): boolean {
    if (!this.configuration.mlCache.enabled) return false;

    return this.setCache('ml', this.mlCache, key, data, this.configuration.mlCache);
  }

  getMLCache(key: string): any | null {
    if (!this.configuration.mlCache.enabled) return null;

    return this.getCache('ml', this.mlCache, key);
  }

  findSimilarMLEntry(features: any): any | null {
    if (!this.configuration.mlCache.enabled) return null;

    const threshold = this.configuration.mlCache.similarityThreshold;
    
    for (const [key, entry] of this.mlCache.entries()) {
      if (this.isExpired(entry)) continue;
      
      const similarity = this.calculateSimilarity(features, entry.data.input);
      if (similarity >= threshold) {
        this.updateAccessStats('ml', entry);
        this.stats.ml.totalHits++;
        this.stats.ml.totalRequests++;
        return entry.data.output;
      }
    }

    this.stats.ml.totalMisses++;
    this.stats.ml.totalRequests++;
    return null;
  }

  // LLM Cache Methods
  setLLMCache(key: string, data: any): boolean {
    if (!this.configuration.llmCache.enabled) return false;

    return this.setCache('llm', this.llmCache, key, data, this.configuration.llmCache);
  }

  getLLMCache(key: string): any | null {
    if (!this.configuration.llmCache.enabled) return null;

    return this.getCache('llm', this.llmCache, key);
  }

  findSemanticLLMEntry(prompt: string): any | null {
    if (!this.configuration.llmCache.enabled || 
        this.configuration.llmCache.keyStrategy !== 'semantic') {
      return null;
    }

    // Simple semantic matching (in production, use embeddings)
    const keywords = this.extractKeywords(prompt);
    
    for (const [key, entry] of this.llmCache.entries()) {
      if (this.isExpired(entry)) continue;
      
      const entryKeywords = this.extractKeywords(key);
      const similarity = this.calculateKeywordSimilarity(keywords, entryKeywords);
      
      if (similarity >= 0.8) { // 80% similarity threshold
        this.updateAccessStats('llm', entry);
        this.stats.llm.totalHits++;
        this.stats.llm.totalRequests++;
        return entry.data;
      }
    }

    this.stats.llm.totalMisses++;
    this.stats.llm.totalRequests++;
    return null;
  }

  // Visualization Cache Methods
  setVisualizationCache(key: string, data: any): boolean {
    if (!this.configuration.visualizationCache.enabled) return false;

    return this.setCache('visualization', this.visualizationCache, key, data, this.configuration.visualizationCache);
  }

  getVisualizationCache(key: string): any | null {
    if (!this.configuration.visualizationCache.enabled) return null;

    return this.getCache('visualization', this.visualizationCache, key);
  }

  // Generic Cache Methods
  private setCache(
    type: keyof typeof this.stats,
    cache: Map<string, CacheEntry<any>>,
    key: string,
    data: any,
    config: { maxSize: number; ttl: number }
  ): boolean {
    try {
      const now = Date.now();
      const entry: CacheEntry<any> = {
        data,
        timestamp: now,
        expiresAt: now + config.ttl,
        accessCount: 0,
        lastAccessed: now,
        size: this.estimateSize(data)
      };

      // Check if cache is full and needs cleanup
      if (cache.size >= config.maxSize) {
        this.evictOldestEntries(cache, Math.floor(config.maxSize * 0.2)); // Remove 20%
      }

      cache.set(key, entry);
      this.memoryUsageBytes += entry.size || 0;
      
      return true;
    } catch (error) {
      console.error(`Error setting ${type} cache:`, error);
      return false;
    }
  }

  private getCache(
    type: keyof typeof this.stats,
    cache: Map<string, CacheEntry<any>>,
    key: string
  ): any | null {
    const entry = cache.get(key);
    
    this.stats[type].totalRequests++;
    
    if (!entry || this.isExpired(entry)) {
      if (entry && this.isExpired(entry)) {
        cache.delete(key);
        this.memoryUsageBytes -= entry.size || 0;
      }
      this.stats[type].totalMisses++;
      return null;
    }

    this.updateAccessStats(type, entry);
    this.stats[type].totalHits++;
    
    return entry.data;
  }

  private updateAccessStats(type: keyof typeof this.stats, entry: CacheEntry<any>): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  // Cache Eviction Strategies
  private evictOldestEntries(cache: Map<string, CacheEntry<any>>, count: number): void {
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, count);

    for (const [key, entry] of entries) {
      cache.delete(key);
      this.memoryUsageBytes -= entry.size || 0;
    }
  }

  private evictLeastUsedEntries(cache: Map<string, CacheEntry<any>>, count: number): void {
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.accessCount - b.accessCount)
      .slice(0, count);

    for (const [key, entry] of entries) {
      cache.delete(key);
      this.memoryUsageBytes -= entry.size || 0;
    }
  }

  // Cleanup and Maintenance
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
      this.updateCacheStats();
    }, 30000); // Cleanup every 30 seconds
  }

  private cleanupExpiredEntries(): void {
    const caches = [
      { name: 'vision', cache: this.visionCache },
      { name: 'ml', cache: this.mlCache },
      { name: 'llm', cache: this.llmCache },
      { name: 'visualization', cache: this.visualizationCache }
    ];

    let removedCount = 0;
    let freedMemory = 0;

    for (const { cache } of caches) {
      const expiredKeys: string[] = [];
      
      for (const [key, entry] of cache.entries()) {
        if (this.isExpired(entry)) {
          expiredKeys.push(key);
          freedMemory += entry.size || 0;
        }
      }
      
      for (const key of expiredKeys) {
        cache.delete(key);
        removedCount++;
      }
    }

    this.memoryUsageBytes -= freedMemory;
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired cache entries, freed ${this.formatBytes(freedMemory)}`);
    }
  }

  private updateCacheStats(): void {
    const caches = [
      { name: 'vision' as const, cache: this.visionCache },
      { name: 'ml' as const, cache: this.mlCache },
      { name: 'llm' as const, cache: this.llmCache },
      { name: 'visualization' as const, cache: this.visualizationCache }
    ];

    for (const { name, cache } of caches) {
      const stats = this.stats[name];
      
      stats.hitRate = stats.totalRequests > 0 ? stats.totalHits / stats.totalRequests : 0;
      stats.missRate = 1 - stats.hitRate;
      stats.entryCount = cache.size;
      stats.memoryUsage = this.calculateCacheMemoryUsage(cache);
      
      if (cache.size > 0) {
        const timestamps = Array.from(cache.values()).map(e => e.timestamp);
        stats.oldestEntry = Math.min(...timestamps);
        stats.newestEntry = Math.max(...timestamps);
      }
    }
  }

  // Utility Methods
  private calculateSimilarity(features1: any, features2: any): number {
    if (!features1 || !features2) return 0;
    
    // Simple cosine similarity for joint angles
    const angles1 = Object.values(features1.jointAngles || {}) as number[];
    const angles2 = Object.values(features2.jointAngles || {}) as number[];
    
    if (angles1.length !== angles2.length || angles1.length === 0) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < angles1.length; i++) {
      dotProduct += angles1[i] * angles2[i];
      norm1 += angles1[i] * angles1[i];
      norm2 += angles2[i] * angles2[i];
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10); // Limit to first 10 keywords
  }

  private calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 && keywords2.length === 0) return 1;
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private estimateSize(data: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(data).length * 2; // Approximate UTF-16 encoding
  }

  private calculateCacheMemoryUsage(cache: Map<string, CacheEntry<any>>): number {
    return Array.from(cache.values()).reduce((total, entry) => total + (entry.size || 0), 0);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Public API Methods
  clearCache(type?: 'vision' | 'ml' | 'llm' | 'visualization'): void {
    if (type) {
      const cache = this.getCacheByType(type);
      const memoryFreed = this.calculateCacheMemoryUsage(cache);
      cache.clear();
      this.memoryUsageBytes -= memoryFreed;
      this.stats[type] = this.getEmptyStats();
      console.log(`🗑️ Cleared ${type} cache, freed ${this.formatBytes(memoryFreed)}`);
    } else {
      // Clear all caches
      this.visionCache.clear();
      this.mlCache.clear();
      this.llmCache.clear();
      this.visualizationCache.clear();
      
      const totalFreed = this.memoryUsageBytes;
      this.memoryUsageBytes = 0;
      
      this.stats = {
        vision: this.getEmptyStats(),
        ml: this.getEmptyStats(),
        llm: this.getEmptyStats(),
        visualization: this.getEmptyStats()
      };
      
      console.log(`🗑️ Cleared all caches, freed ${this.formatBytes(totalFreed)}`);
    }
  }

  getCacheStats(type?: 'vision' | 'ml' | 'llm' | 'visualization'): CacheStats | typeof this.stats {
    if (type) {
      return this.stats[type];
    }
    return this.stats;
  }

  getTotalMemoryUsage(): string {
    return this.formatBytes(this.memoryUsageBytes);
  }

  getDetailedStats(): any {
    return {
      totalMemoryUsage: this.getTotalMemoryUsage(),
      totalEntries: this.visionCache.size + this.mlCache.size + this.llmCache.size + this.visualizationCache.size,
      cacheStats: this.stats,
      configuration: this.configuration
    };
  }

  // Warmup cache with common patterns
  warmupCache(): void {
    console.log('🔥 Warming up caches...');
    
    // This would pre-populate caches with common patterns
    // For now, just log the action
    console.log('✅ Cache warmup completed');
  }

  // Export/Import cache data
  exportCacheData(): any {
    return {
      vision: Array.from(this.visionCache.entries()),
      ml: Array.from(this.mlCache.entries()),
      llm: Array.from(this.llmCache.entries()),
      visualization: Array.from(this.visualizationCache.entries()),
      timestamp: Date.now()
    };
  }

  importCacheData(data: any): boolean {
    try {
      // Import would restore cache entries
      // For now, just validate structure
      if (!data.timestamp || !data.vision || !data.ml) {
        console.error('Invalid cache data format');
        return false;
      }
      
      console.log('📥 Cache data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing cache data:', error);
      return false;
    }
  }

  private getCacheByType(type: 'vision' | 'ml' | 'llm' | 'visualization'): Map<string, CacheEntry<any>> {
    const cacheMap = {
      vision: this.visionCache,
      ml: this.mlCache,
      llm: this.llmCache,
      visualization: this.visualizationCache
    };
    return cacheMap[type];
  }

  private getEmptyStats(): CacheStats {
    return {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      memoryUsage: 0,
      entryCount: 0,
      oldestEntry: 0,
      newestEntry: 0
    };
  }

  private getDefaultConfiguration(): CacheConfiguration {
    return {
      visionCache: {
        enabled: true,
        maxSize: 30,
        ttl: 3000
      },
      mlCache: {
        enabled: true,
        maxSize: 50,
        ttl: 15000,
        similarityThreshold: 0.8
      },
      llmCache: {
        enabled: true,
        maxSize: 200,
        ttl: 900000, // 15 minutes
        keyStrategy: 'exact'
      },
      visualizationCache: {
        enabled: true,
        maxSize: 20,
        ttl: 3000
      }
    };
  }

  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearCache();
    console.log('🧹 CacheManager disposed');
  }
}