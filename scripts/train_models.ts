#!/usr/bin/env ts-node

import { TrainingDataGenerator } from '../lib/ml/TrainingDataGenerator';
import { ExerciseType } from '../lib/ml/types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Model Training Pipeline Script
 * 
 * This script generates synthetic training data and prepares it for ML model training.
 * Usage: npx ts-node scripts/train_models.ts [exercise_type]
 */

class ModelTrainingPipeline {
  private outputDir = path.join(__dirname, '../models/training_data');

  constructor() {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateTrainingData(exerciseType: ExerciseType, numSamples: number = 1000) {
    console.log(`\n🎯 Starting training data generation for ${exerciseType}`);
    console.log(`📊 Generating ${numSamples} samples...`);

    // Generate synthetic data
    const trainingData = TrainingDataGenerator.generateSyntheticData(exerciseType, numSamples);

    // Split data into train/validation/test sets
    const trainSize = Math.floor(numSamples * 0.7);
    const validSize = Math.floor(numSamples * 0.15);
    const testSize = numSamples - trainSize - validSize;

    const trainData = trainingData.slice(0, trainSize);
    const validData = trainingData.slice(trainSize, trainSize + validSize);
    const testData = trainingData.slice(trainSize + validSize);

    console.log(`📈 Data split: Train=${trainSize}, Valid=${validSize}, Test=${testSize}`);

    // Save datasets
    await this.saveDataset('train', exerciseType, trainData);
    await this.saveDataset('valid', exerciseType, validData);
    await this.saveDataset('test', exerciseType, testData);

    // Generate training statistics
    await this.generateStatistics(exerciseType, trainingData);

    console.log(`✅ Training data generation completed for ${exerciseType}`);
    return {
      trainSize,
      validSize,
      testSize,
      totalSize: numSamples
    };
  }

  private async saveDataset(split: string, exerciseType: ExerciseType, data: any[]) {
    const filename = `${exerciseType}_${split}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    const jsonData = TrainingDataGenerator.exportToJSON(data);
    fs.writeFileSync(filepath, jsonData);
    
    console.log(`💾 Saved ${data.length} samples to ${filename}`);
  }

  private async generateStatistics(exerciseType: ExerciseType, data: any[]) {
    const stats = {
      exerciseType,
      totalSamples: data.length,
      phaseDistribution: this.calculatePhaseDistribution(data),
      qualityDistribution: this.calculateQualityDistribution(data),
      errorDistribution: this.calculateErrorDistribution(data),
      deviceTierDistribution: this.calculateDeviceTierDistribution(data),
      averageSequenceLength: data[0]?.features.angleSequence.length || 0,
      featureCount: data[0]?.features.angleSequence[0]?.length || 0
    };

    const statsFile = path.join(this.outputDir, `${exerciseType}_statistics.json`);
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
    
    console.log(`📊 Generated statistics for ${exerciseType}:`);
    console.log(`   - Phases: ${JSON.stringify(stats.phaseDistribution)}`);
    console.log(`   - Avg Quality: ${stats.qualityDistribution.average.toFixed(1)}`);
    console.log(`   - Most Common Error: ${stats.errorDistribution.mostCommon}`);
  }

  private calculatePhaseDistribution(data: any[]) {
    const phases: { [key: string]: number } = {};
    
    data.forEach(point => {
      const phase = point.groundTruth.phase;
      phases[phase] = (phases[phase] || 0) + 1;
    });

    // Convert to percentages
    Object.keys(phases).forEach(phase => {
      phases[phase] = Math.round((phases[phase] / data.length) * 100);
    });

    return phases;
  }

  private calculateQualityDistribution(data: any[]) {
    const qualities = data.map(point => point.groundTruth.qualityScore);
    
    return {
      average: qualities.reduce((a, b) => a + b) / qualities.length,
      min: Math.min(...qualities),
      max: Math.max(...qualities),
      bins: {
        poor: qualities.filter(q => q < 40).length,
        fair: qualities.filter(q => q >= 40 && q < 60).length,
        good: qualities.filter(q => q >= 60 && q < 80).length,
        excellent: qualities.filter(q => q >= 80).length
      }
    };
  }

  private calculateErrorDistribution(data: any[]) {
    const errorCounts: { [key: string]: number } = {};
    
    data.forEach(point => {
      point.groundTruth.errors.forEach((error: string) => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });
    });

    const mostCommon = Object.keys(errorCounts).reduce((a, b) => 
      errorCounts[a] > errorCounts[b] ? a : b
    , 'none');

    return {
      mostCommon,
      distribution: errorCounts
    };
  }

  private calculateDeviceTierDistribution(data: any[]) {
    const tiers: { [key: string]: number } = {};
    
    data.forEach(point => {
      const tier = point.metadata.deviceTier;
      tiers[tier] = (tiers[tier] || 0) + 1;
    });

    return tiers;
  }

  async generateAllExerciseData(samplesPerExercise: number = 500) {
    console.log('🚀 Generating training data for all exercises...\n');
    
    const results: any[] = [];
    
    for (const exerciseType of Object.values(ExerciseType)) {
      try {
        const result = await this.generateTrainingData(exerciseType, samplesPerExercise);
        results.push({ exerciseType, ...result });
      } catch (error) {
        console.error(`❌ Error generating data for ${exerciseType}:`, error);
      }
    }

    // Generate summary report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      totalExercises: results.length,
      totalSamples: results.reduce((sum, r) => sum + r.totalSize, 0),
      results
    };

    const summaryFile = path.join(this.outputDir, 'training_summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summaryReport, null, 2));

    console.log('\n🎉 Training data generation completed!');
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`📊 Total samples generated: ${summaryReport.totalSamples}`);
    console.log(`🎯 Exercises covered: ${summaryReport.totalExercises}`);

    return summaryReport;
  }

  // Helper method to create Core ML training script
  async generateCoreMLScript(exerciseType: ExerciseType) {
    const pythonScript = `#!/usr/bin/env python3
"""
Core ML Model Training Script for ${exerciseType}
Auto-generated by train_models.ts
"""

import coremltools as ct
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras

def load_training_data(exercise_type):
    """Load preprocessed training data"""
    with open(f'training_data/{exercise_type}_train.json', 'r') as f:
        train_data = json.load(f)
    
    with open(f'training_data/{exercise_type}_valid.json', 'r') as f:
        valid_data = json.load(f)
    
    return train_data, valid_data

def preprocess_features(data):
    """Convert feature sequences to model input format"""
    X = []
    y = []
    
    for sample in data:
        features = sample['features']
        ground_truth = sample['groundTruth']
        
        # Flatten sequence data
        angles = np.array(features['angleSequence']).flatten()
        velocities = np.array(features['velocitySequence']).flatten()
        roms = np.array(features['romSequence']).flatten()
        
        # Combine features
        feature_vector = np.concatenate([angles, velocities, roms])
        X.append(feature_vector)
        
        # Create target vector
        phase_encoding = {
            'eccentric': [1, 0, 0, 0],
            'concentric': [0, 1, 0, 0], 
            'isometric': [0, 0, 1, 0],
            'transition': [0, 0, 0, 1]
        }
        
        target = []
        target.extend(phase_encoding[ground_truth['phase']])
        target.append(1 if ground_truth['isRepEnd'] else 0)
        target.append(ground_truth['qualityScore'] / 100.0)
        
        y.append(target)
    
    return np.array(X), np.array(y)

def build_tcn_model(input_shape, output_shape):
    """Build Temporal Convolutional Network"""
    model = keras.Sequential([
        keras.layers.Dense(128, activation='relu', input_shape=input_shape),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dense(output_shape, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['accuracy']
    )
    
    return model

def main():
    exercise_type = '${exerciseType}'
    print(f"Training model for {exercise_type}")
    
    # Load data
    train_data, valid_data = load_training_data(exercise_type)
    
    # Preprocess
    X_train, y_train = preprocess_features(train_data)
    X_valid, y_valid = preprocess_features(valid_data)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_valid_scaled = scaler.transform(X_valid)
    
    print(f"Training data shape: {X_train_scaled.shape}")
    print(f"Target data shape: {y_train.shape}")
    
    # Build model
    model = build_tcn_model((X_train_scaled.shape[1],), y_train.shape[1])
    
    # Train model
    history = model.fit(
        X_train_scaled, y_train,
        validation_data=(X_valid_scaled, y_valid),
        epochs=50,
        batch_size=32,
        verbose=1
    )
    
    # Convert to Core ML
    coreml_model = ct.convert(
        model,
        inputs=[ct.TensorType(shape=X_train_scaled.shape[1:])],
        outputs=[ct.TensorType(shape=y_train.shape[1:])],
        convert_to="mlprogram"
    )
    
    # Save model
    output_path = f"../models/{exercise_type}.mlpackage"
    coreml_model.save(output_path)
    print(f"Model saved to {output_path}")

if __name__ == "__main__":
    main()
`;

    const scriptPath = path.join(this.outputDir, `train_${exerciseType}.py`);
    fs.writeFileSync(scriptPath, pythonScript);
    console.log(`🐍 Generated Python training script: train_${exerciseType}.py`);
  }
}

// CLI Interface
async function main() {
  const pipeline = new ModelTrainingPipeline();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  try {
    switch (command) {
      case 'all':
        await pipeline.generateAllExerciseData(500);
        break;
        
      case 'single':
        const exerciseType = args[1] as ExerciseType || ExerciseType.GENERAL;
        const numSamples = parseInt(args[2]) || 1000;
        await pipeline.generateTrainingData(exerciseType, numSamples);
        await pipeline.generateCoreMLScript(exerciseType);
        break;
        
      default:
        console.log('Usage:');
        console.log('  npm run train-models all                    # Generate data for all exercises');
        console.log('  npm run train-models single neck_stretch 1000  # Generate data for specific exercise');
        break;
    }
  } catch (error) {
    console.error('❌ Training pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ModelTrainingPipeline };