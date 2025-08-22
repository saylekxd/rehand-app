#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

/**
 * Model Deployment Script
 * Copies trained models to appropriate locations in the app bundle
 */

interface ModelDeploymentConfig {
  exerciseType: string;
  platforms: ('ios' | 'android')[];
}

class ModelDeployment {
  private modelsDir = path.join(__dirname, '../models');
  private assetsDir = path.join(__dirname, '../assets/models');

  constructor() {
    // Ensure assets/models directory exists
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }
  }

  async deployModels(config: ModelDeploymentConfig) {
    console.log(`\n🚀 Deploying models for ${config.exerciseType}...`);

    for (const platform of config.platforms) {
      await this.deployForPlatform(config.exerciseType, platform);
    }

    console.log(`✅ Model deployment completed for ${config.exerciseType}`);
  }

  private async deployForPlatform(exerciseType: string, platform: 'ios' | 'android') {
    const sourceDir = path.join(this.modelsDir, platform);
    const modelExtension = platform === 'ios' ? '.mlmodel' : '.tflite';
    const sourceFile = path.join(sourceDir, `${exerciseType}_model${modelExtension}`);

    if (!fs.existsSync(sourceFile)) {
      console.log(`⚠️ Model not found: ${sourceFile}`);
      console.log(`   Generate models first: python training_scripts/train_exercise_model.py --exercise ${exerciseType}`);
      return;
    }

    // Copy to assets for bundling
    const destDir = path.join(this.assetsDir, platform);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destFile = path.join(destDir, `${exerciseType}_model${modelExtension}`);
    fs.copyFileSync(sourceFile, destFile);

    console.log(`✅ ${platform.toUpperCase()} model deployed: ${path.relative(process.cwd(), destFile)}`);

    // Create model metadata
    const metadata = {
      exerciseType,
      platform,
      version: '1.0',
      modelSize: fs.statSync(destFile).size,
      createdAt: new Date().toISOString(),
      architecture: 'TCN',
      inputShape: [1, 60, 15], // [batch, sequence, features]
      outputs: ['movement_phase', 'errors', 'quality', 'rep_end']
    };

    const metadataFile = path.join(destDir, `${exerciseType}_metadata.json`);
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  }

  async deployAllModels() {
    const exercises = ['neck_stretch', 'shoulder_rolls', 'arm_circles', 'torso_twist', 'leg_raises'];
    
    for (const exercise of exercises) {
      await this.deployModels({
        exerciseType: exercise,
        platforms: ['ios', 'android']
      });
    }
  }

  listAvailableModels() {
    console.log('\n📱 Available models:');
    
    for (const platform of ['ios', 'android']) {
      const platformDir = path.join(this.modelsDir, platform);
      if (fs.existsSync(platformDir)) {
        const models = fs.readdirSync(platformDir)
          .filter(file => file.endsWith(platform === 'ios' ? '.mlmodel' : '.tflite'));
        
        console.log(`\n${platform.toUpperCase()}:`);
        models.forEach(model => {
          const modelPath = path.join(platformDir, model);
          const stats = fs.statSync(modelPath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          console.log(`  ✅ ${model} (${sizeMB}MB)`);
        });
      }
    }
  }
}

// CLI Interface
async function main() {
  const deployment = new ModelDeployment();
  
  const args = process.argv.slice(2);
  const command = args[0];
  const exerciseType = args[1];

  switch (command) {
    case 'deploy':
      if (exerciseType && exerciseType !== 'all') {
        await deployment.deployModels({
          exerciseType,
          platforms: ['ios', 'android']
        });
      } else {
        await deployment.deployAllModels();
      }
      break;
      
    case 'list':
      deployment.listAvailableModels();
      break;
      
    default:
      console.log(`
🎯 Model Deployment Tool

Usage:
  npm run deploy-models deploy [exercise_type]  # Deploy specific exercise model
  npm run deploy-models deploy all              # Deploy all models
  npm run deploy-models list                    # List available models

Examples:
  npm run deploy-models deploy neck_stretch
  npm run deploy-models deploy all
  npm run deploy-models list
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}