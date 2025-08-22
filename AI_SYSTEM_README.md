# 🤖 ReHand AI System - Complete Implementation

## 🎯 Hierarchical AI Architecture

ReHand używa zaawansowanej hierarchicznej architektury AI do analizy ćwiczeń w czasie rzeczywistym:

```
📱 Vision Layer (30fps) → 🔢 Feature Extractor (30fps) → 🧠 On-Device ML (5fps) → 
💬 Local LLM (per event) → ☁️ Cloud LLM (per session) → 🎨 3D Visualization
```

## 🚀 Quick Start

### 1. Setup Training Environment
```bash
# Setup Python environment for model training
npm run setup-training

# Generate training data for all exercises  
npm run train-models:all

# Train models (requires Python environment)
source training_scripts/venv/bin/activate
python training_scripts/train_exercise_model.py --exercise all

# Deploy models to app bundle
npm run deploy-models deploy all
```

### 2. Run the App
```bash
# Start development server
npm run dev

# iOS
npm run ios

# Android  
npm run android
```

## 🏗️ System Components

### 📱 Vision Layer (`/lib/vision/`)
- **VisionProcessor.ts**: MediaPipe integration for 2D/3D pose detection
- **FeatureExtractor.ts**: Real-time calculation of joint angles, velocities, ROM
- **CameraIntegration.tsx**: Expo Camera integration with frame processing
- **DeviceCapabilities.ts**: Progressive capability detection (basic → ultra)

### 🧠 ML Pipeline (`/lib/ml/`)
- **MLAnalyzer.ts**: TCN model inference with Core ML/TensorFlow Lite
- **TrainingDataGenerator.ts**: Synthetic training data generation
- **ExerciseConfigs.ts**: Exercise-specific configurations and error patterns
- **Model Training**: Python scripts with Core ML export (`/training_scripts/`)

### 💬 Local LLM (`/lib/llm/`)
- **LocalLLMManager.ts**: React Native AI/MLC integration
- **LLMTriggerSystem.ts**: Smart triggering based on session analytics
- **HardcodedMessageProvider.ts**: Polish motivational messages fallback

### ☁️ Cloud LLM (`/lib/cloud/`)
- **CloudLLMManager.ts**: GPT-4 strategic analysis with caching
- **CloudTriggerSystem.ts**: Intelligent session-level triggering
- **Supabase Edge Function**: Strategic analysis API (`/supabase/functions/`)

### 🎨 Visualization (`/lib/visualization/`)
- **VisualizationEngine.ts**: Real-time 3D overlay engine
- **OverlayRenderer.tsx**: SVG-based React Native renderer
- **ExerciseOverlayConfigs.ts**: Exercise-specific visualization configs

### 🔄 Pipeline (`/lib/pipeline/`)
- **HierarchicalPipeline.ts**: Main orchestrator with adaptive quality
- **PerformanceProfileManager.ts**: Device-specific optimization profiles
- **CacheManager.ts**: Multi-layer caching with similarity matching

## 🎮 Usage

### Basic Integration
```typescript
import { useAIExerciseAnalysis } from '../lib/useAIExerciseAnalysis';

const aiAnalysis = useAIExerciseAnalysis({
  exerciseType: ExerciseType.NECK_STRETCH,
  userProfile: {
    level: 'beginner',
    goals: ['rehabilitation'],
    preferences: {
      motivationStyle: 'encouraging',
      responseLength: 'short',
      language: 'pl'
    }
  },
  enableLocalLLM: true,
  enableCloudLLM: false
});
```

### Camera Integration with AI
```tsx
<CameraView
  ref={cameraRef}
  style={styles.camera}
  facing={facing}
  onCameraReady={() => aiAnalysis.startAnalysis()}
>
  <OverlayRenderer
    analysisState={aiAnalysis.currentAnalysis}
    frameSize={cameraSize}
  />
</CameraView>
```

## 📊 Performance Profiles

### Device Tiers
- **Basic** (2-4GB RAM): Rule-based analysis + hardcoded messages
- **Enhanced** (4-6GB RAM): Basic ML + local LLM fallback
- **Pro** (6-8GB RAM): Full ML + React Native AI
- **Ultra** (8GB+ RAM): Full ML + MLC LLM + 3D visualization

### Adaptive Quality
- Automatically adjusts processing quality based on device performance
- Thermal throttling protection
- Battery optimization modes

## 🧪 Model Training Workflow

### 1. Generate Training Data
```bash
# All exercises
npm run train-models:all

# Specific exercise
npm run train-models:single neck_stretch
```

### 2. Train ML Models
```bash
# Setup Python environment (one time)
npm run setup-training

# Activate environment and train
source training_scripts/venv/bin/activate
python training_scripts/train_exercise_model.py --exercise neck_stretch

# Train all exercises
python training_scripts/train_exercise_model.py --exercise all
```

### 3. Deploy to App
```bash
# Deploy specific model
npm run deploy-models deploy neck_stretch

# Deploy all models
npm run deploy-models deploy all

# List deployed models  
npm run deploy-models list
```

## 💡 Key Features

### Real-time Analysis
- **30fps** vision processing with MediaPipe
- **5fps** ML inference for efficiency  
- **Per-event** local LLM responses
- **Per-session** strategic cloud analysis

### Smart Fallbacks
- Rule-based analysis when ML models unavailable
- Hardcoded messages when LLM unavailable
- Progressive enhancement based on device capabilities

### Multilingual Support
- Polish motivational messages
- Configurable response language
- Exercise instructions in Polish/English

## 📈 Performance Metrics

### Computational Costs
- Vision Processing: ~15-20% CPU
- Feature Extraction: ~5-10% CPU
- ML Inference: ~10-15% CPU (5fps)
- Local LLM: ~20-30% CPU (per event, <1s)
- 3D Visualization: ~10-15% GPU

### Battery Life
- Target: 45-60 minute continuous sessions
- Dynamic quality scaling for battery optimization
- Thermal management with automatic throttling

### API Costs
- **Before**: $10-50 per session (GPT per frame)
- **After**: $0.01-0.10 per session (strategic analysis only)
- Local LLM: $0 operational costs

## 🔧 Configuration

### Exercise Types
```typescript
enum ExerciseType {
  NECK_STRETCH = 'neck_stretch',
  SHOULDER_ROLLS = 'shoulder_rolls', 
  ARM_CIRCLES = 'arm_circles',
  TORSO_TWIST = 'torso_twist',
  LEG_RAISES = 'leg_raises',
  ANKLE_PUMPS = 'ankle_pumps',
  SQUATS = 'squats',
  LUNGES = 'lunges',
  GENERAL = 'general'
}
```

### User Preferences
```typescript
interface UserPreferences {
  motivationStyle: 'encouraging' | 'challenging' | 'educational';
  responseLength: 'short' | 'medium' | 'detailed';
  language: 'pl' | 'en';
  visualizationLevel: 'minimal' | 'standard' | 'detailed';
}
```

## 🗄️ Database Schema

### AI Analytics Tables
- `ai_analysis_cache`: Caches ML and LLM results
- `cloud_llm_usage`: Tracks API usage and costs
- `session_analytics`: Aggregated session metrics
- `model_performance`: Model accuracy tracking

## 🛠️ Development

### Adding New Exercises
1. Add to `ExerciseType` enum in `/lib/ml/types.ts`
2. Configure in `ExerciseConfigs.ts`
3. Add visualization config in `ExerciseOverlayConfigs.ts`
4. Generate training data and train model
5. Deploy model to app bundle

### Model Updates
1. Modify `MODEL_CONFIG` in training script
2. Regenerate training data
3. Retrain models
4. Deploy updated models
5. Update app version

## 🚨 Troubleshooting

### Common Issues
- **"Model not found"**: Run model deployment script
- **"LLM not available"**: Check device tier and fallback to hardcoded messages  
- **High battery usage**: Enable battery optimization mode
- **Low performance**: Check device tier and reduce processing quality

### Debug Mode
```typescript
const aiAnalysis = useAIExerciseAnalysis({
  debugMode: true // Enables detailed logging
});
```

## 📝 License

Proprietary - ReHand AI System