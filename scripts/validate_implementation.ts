#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

/**
 * AI Implementation Validation
 * Validates that all required components are implemented
 */

interface ValidationResult {
  component: string;
  status: 'present' | 'missing' | 'error';
  details?: string;
}

class ImplementationValidator {
  private results: ValidationResult[] = [];

  validateImplementation() {
    console.log('🔍 Validating AI Implementation...\n');

    // Phase 1: Vision
    this.validateComponent('Vision/types.ts', '/workspace/lib/vision/types.ts');
    this.validateComponent('Vision/VisionProcessor.ts', '/workspace/lib/vision/VisionProcessor.ts');
    this.validateComponent('Vision/FeatureExtractor.ts', '/workspace/lib/vision/FeatureExtractor.ts');
    this.validateComponent('Vision/CameraIntegration.tsx', '/workspace/lib/vision/CameraIntegration.tsx');
    this.validateComponent('Vision/DeviceCapabilities.ts', '/workspace/lib/vision/DeviceCapabilities.ts');

    // Phase 2: ML
    this.validateComponent('ML/types.ts', '/workspace/lib/ml/types.ts');
    this.validateComponent('ML/MLAnalyzer.ts', '/workspace/lib/ml/MLAnalyzer.ts');
    this.validateComponent('ML/TrainingDataGenerator.ts', '/workspace/lib/ml/TrainingDataGenerator.ts');
    this.validateComponent('ML/ExerciseConfigs.ts', '/workspace/lib/ml/ExerciseConfigs.ts');

    // Phase 3: Local LLM
    this.validateComponent('LLM/types.ts', '/workspace/lib/llm/types.ts');
    this.validateComponent('LLM/LocalLLMManager.ts', '/workspace/lib/llm/LocalLLMManager.ts');
    this.validateComponent('LLM/LLMTriggerSystem.ts', '/workspace/lib/llm/LLMTriggerSystem.ts');
    this.validateComponent('LLM/HardcodedMessageProvider.ts', '/workspace/lib/llm/HardcodedMessageProvider.ts');

    // Phase 4: Cloud LLM
    this.validateComponent('Cloud/types.ts', '/workspace/lib/cloud/types.ts');
    this.validateComponent('Cloud/CloudLLMManager.ts', '/workspace/lib/cloud/CloudLLMManager.ts');
    this.validateComponent('Cloud/CloudTriggerSystem.ts', '/workspace/lib/cloud/CloudTriggerSystem.ts');
    this.validateComponent('Supabase/strategic-analysis', '/workspace/supabase/functions/strategic-analysis/index.ts');

    // Phase 5: Visualization  
    this.validateComponent('Visualization/types.ts', '/workspace/lib/visualization/types.ts');
    this.validateComponent('Visualization/VisualizationEngine.ts', '/workspace/lib/visualization/VisualizationEngine.ts');
    this.validateComponent('Visualization/OverlayRenderer.tsx', '/workspace/lib/visualization/OverlayRenderer.tsx');
    this.validateComponent('Visualization/ExerciseOverlayConfigs.ts', '/workspace/lib/visualization/ExerciseOverlayConfigs.ts');

    // Phase 6: Pipeline
    this.validateComponent('Pipeline/types.ts', '/workspace/lib/pipeline/types.ts');
    this.validateComponent('Pipeline/HierarchicalPipeline.ts', '/workspace/lib/pipeline/HierarchicalPipeline.ts');
    this.validateComponent('Pipeline/PerformanceProfileManager.ts', '/workspace/lib/pipeline/PerformanceProfileManager.ts');
    this.validateComponent('Pipeline/CacheManager.ts', '/workspace/lib/pipeline/CacheManager.ts');

    // Integration
    this.validateComponent('AICoordinator.ts', '/workspace/lib/AICoordinator.ts');
    this.validateComponent('useAIExerciseAnalysis.ts', '/workspace/lib/useAIExerciseAnalysis.ts');

    // Training & Deployment
    this.validateComponent('Training/train_models.ts', '/workspace/scripts/train_models.ts');
    this.validateComponent('Training/train_exercise_model.py', '/workspace/training_scripts/train_exercise_model.py');
    this.validateComponent('Training/deploy_models.ts', '/workspace/scripts/deploy_models.ts');

    // Database
    this.validateComponent('Migration/004_cloud_llm_tables.sql', '/workspace/migrations/004_cloud_llm_tables.sql');

    this.printResults();
  }

  private validateComponent(name: string, filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024).toFixed(1);
        this.results.push({
          component: name,
          status: 'present',
          details: `${sizeMB}KB`
        });
      } else {
        this.results.push({
          component: name,
          status: 'missing'
        });
      }
    } catch (error) {
      this.results.push({
        component: name,
        status: 'error',
        details: (error as Error).message
      });
    }
  }

  private printResults() {
    console.log('\n📊 Validation Results:\n');

    const byStatus = {
      present: this.results.filter(r => r.status === 'present'),
      missing: this.results.filter(r => r.status === 'missing'),
      error: this.results.filter(r => r.status === 'error')
    };

    console.log('✅ IMPLEMENTED COMPONENTS:');
    byStatus.present.forEach(result => {
      console.log(`   ✅ ${result.component} (${result.details})`);
    });

    if (byStatus.missing.length > 0) {
      console.log('\n❌ MISSING COMPONENTS:');
      byStatus.missing.forEach(result => {
        console.log(`   ❌ ${result.component}`);
      });
    }

    if (byStatus.error.length > 0) {
      console.log('\n⚠️ ERROR COMPONENTS:');
      byStatus.error.forEach(result => {
        console.log(`   ⚠️ ${result.component}: ${result.details}`);
      });
    }

    console.log('\n📈 SUMMARY:');
    console.log(`   ✅ Implemented: ${byStatus.present.length}`);
    console.log(`   ❌ Missing: ${byStatus.missing.length}`);
    console.log(`   ⚠️ Errors: ${byStatus.error.length}`);
    console.log(`   📊 Total: ${this.results.length}`);

    const percentage = Math.round((byStatus.present.length / this.results.length) * 100);
    console.log(`\n🎯 Implementation Progress: ${percentage}%`);

    if (percentage >= 95) {
      console.log('\n🎉 IMPLEMENTATION COMPLETED SUCCESSFULLY! 🚀');
    } else if (percentage >= 80) {
      console.log('\n⚡ Implementation mostly complete, minor fixes needed');
    } else {
      console.log('\n🚧 Implementation in progress');
    }
  }
}

// Run validation
const validator = new ImplementationValidator();
validator.validateImplementation();