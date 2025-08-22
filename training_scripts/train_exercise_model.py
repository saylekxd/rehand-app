#!/usr/bin/env python3
"""
Exercise Analysis Model Training Pipeline
Trains TCN models for movement analysis and exports to Core ML for iOS

Usage:
    python train_exercise_model.py --exercise neck_stretch
    python train_exercise_model.py --exercise all
"""

import argparse
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, Model
import coremltools as ct
import os
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error

# Model configuration
MODEL_CONFIG = {
    'sequence_length': 60,  # 2 seconds at 30fps
    'feature_size': 15,     # joint angles + velocities + ROM
    'num_phases': 4,        # movement phases
    'num_errors': 7,        # error types
    'dilated_conv_layers': 4,
    'residual_blocks': 3,
    'filters': 64,
    'kernel_size': 3,
    'dropout_rate': 0.3
}

class ExerciseModelTrainer:
    def __init__(self, exercise_type: str, config: dict = MODEL_CONFIG):
        self.exercise_type = exercise_type
        self.config = config
        self.model = None
        
        # Set up paths
        self.data_dir = Path(__file__).parent.parent / 'models' / 'training_data'
        self.output_dir = Path(__file__).parent.parent / 'models' / 'ios'
        self.output_dir.mkdir(exist_ok=True)
        
    def load_training_data(self):
        """Load generated training data from TypeScript generator"""
        print(f"📊 Loading training data for {self.exercise_type}...")
        
        train_file = self.data_dir / f"{self.exercise_type}_train.json"
        valid_file = self.data_dir / f"{self.exercise_type}_valid.json" 
        test_file = self.data_dir / f"{self.exercise_type}_test.json"
        
        if not train_file.exists():
            raise FileNotFoundError(f"Training data not found. Run: npm run train-models:single {self.exercise_type}")
            
        with open(train_file) as f:
            train_data = json.load(f)
        with open(valid_file) as f:
            valid_data = json.load(f)
        with open(test_file) as f:
            test_data = json.load(f)
            
        return train_data, valid_data, test_data
    
    def preprocess_data(self, raw_data):
        """Convert JSON data to model-ready tensors"""
        sequences = []
        phase_labels = []
        error_labels = []
        quality_labels = []
        rep_end_labels = []
        
        for sample in raw_data:
            features = sample['features']
            ground_truth = sample['groundTruth']
            
            # Combine angle, velocity and ROM sequences
            sequence = np.hstack([
                np.array(features['angleSequence']),
                np.array(features['velocitySequence']),
                np.array(features['romSequence'])
            ])
            
            sequences.append(sequence)
            
            # Phase encoding (one-hot)
            phase_map = {'eccentric': 0, 'concentric': 1, 'isometric': 2, 'transition': 3}
            phase_onehot = np.zeros(4)
            phase_onehot[phase_map[ground_truth['phase']]] = 1
            phase_labels.append(phase_onehot)
            
            # Error encoding (multi-label binary)
            error_types = ['valgusKnee', 'excessiveForwardLean', 'asymmetricMovement', 
                          'limitedROM', 'improperTempo', 'insufficientDepth', 'headForwardPosture']
            error_binary = np.zeros(len(error_types))
            for i, error_type in enumerate(error_types):
                if error_type in ground_truth['errors']:
                    error_binary[i] = 1
            error_labels.append(error_binary)
            
            # Quality score (normalized 0-1)
            quality_labels.append(ground_truth['qualityScore'] / 100.0)
            
            # Rep end (binary)
            rep_end_labels.append(1.0 if ground_truth['isRepEnd'] else 0.0)
        
        return {
            'sequences': np.array(sequences),
            'phases': np.array(phase_labels),
            'errors': np.array(error_labels),
            'quality': np.array(quality_labels),
            'rep_end': np.array(rep_end_labels)
        }
    
    def build_tcn_model(self):
        """Build Temporal Convolutional Network model"""
        print("🏗️ Building TCN model architecture...")
        
        # Input layer
        inputs = tf.keras.Input(shape=(self.config['sequence_length'], self.config['feature_size']))
        x = inputs
        
        # TCN blocks with dilated convolutions
        for i in range(self.config['dilated_conv_layers']):
            dilation_rate = 2 ** i
            
            # Dilated conv block
            conv_out = layers.Conv1D(
                filters=self.config['filters'],
                kernel_size=self.config['kernel_size'],
                dilation_rate=dilation_rate,
                padding='causal',
                activation='relu'
            )(x)
            
            conv_out = layers.Dropout(self.config['dropout_rate'])(conv_out)
            
            # Residual connection
            if i > 0:
                conv_out = layers.Add()([x, conv_out])
            
            x = conv_out
        
        # Global average pooling
        x = layers.GlobalAveragePooling1D()(x)
        
        # Dense layers
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(self.config['dropout_rate'])(x)
        
        # Multiple outputs
        phase_output = layers.Dense(4, activation='softmax', name='movement_phase')(x)
        error_output = layers.Dense(7, activation='sigmoid', name='errors')(x)
        quality_output = layers.Dense(1, activation='sigmoid', name='quality')(x)
        rep_end_output = layers.Dense(1, activation='sigmoid', name='rep_end')(x)
        
        model = Model(inputs=inputs, outputs=[phase_output, error_output, quality_output, rep_end_output])
        
        # Compile with multiple losses
        model.compile(
            optimizer='adam',
            loss={
                'movement_phase': 'categorical_crossentropy',
                'errors': 'binary_crossentropy',
                'quality': 'mse',
                'rep_end': 'binary_crossentropy'
            },
            loss_weights={
                'movement_phase': 1.0,
                'errors': 1.0,
                'quality': 2.0,  # Quality is most important
                'rep_end': 1.5
            },
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def train_model(self, train_data, valid_data):
        """Train the TCN model"""
        print("🚀 Starting model training...")
        
        # Preprocess data
        train_processed = self.preprocess_data(train_data)
        valid_processed = self.preprocess_data(valid_data)
        
        # Training callbacks
        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5),
            tf.keras.callbacks.ModelCheckpoint(
                f"{self.output_dir}/{self.exercise_type}_best.h5",
                save_best_only=True
            )
        ]
        
        # Train model
        history = self.model.fit(
            train_processed['sequences'],
            {
                'movement_phase': train_processed['phases'],
                'errors': train_processed['errors'],
                'quality': train_processed['quality'],
                'rep_end': train_processed['rep_end']
            },
            validation_data=(
                valid_processed['sequences'],
                {
                    'movement_phase': valid_processed['phases'],
                    'errors': valid_processed['errors'],
                    'quality': valid_processed['quality'],
                    'rep_end': valid_processed['rep_end']
                }
            ),
            epochs=50,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        print("✅ Training completed!")
        return history
    
    def evaluate_model(self, test_data):
        """Evaluate model performance"""
        print("📊 Evaluating model performance...")
        
        test_processed = self.preprocess_data(test_data)
        results = self.model.evaluate(
            test_processed['sequences'],
            {
                'movement_phase': test_processed['phases'],
                'errors': test_processed['errors'],
                'quality': test_processed['quality'],
                'rep_end': test_processed['rep_end']
            },
            verbose=0
        )
        
        print("Model Performance:")
        for i, metric in enumerate(self.model.metrics_names):
            print(f"  {metric}: {results[i]:.4f}")
        
        return results
    
    def export_to_coreml(self):
        """Export trained model to Core ML format"""
        print("📱 Exporting to Core ML...")
        
        try:
            # Convert to Core ML
            coreml_model = ct.convert(
                self.model,
                inputs=[ct.TensorType(shape=(1, self.config['sequence_length'], self.config['feature_size']))],
                outputs=[
                    ct.TensorType(name="movement_phase"),
                    ct.TensorType(name="errors"),
                    ct.TensorType(name="quality"),
                    ct.TensorType(name="rep_end")
                ],
                minimum_deployment_target=ct.target.iOS13
            )
            
            # Add metadata
            coreml_model.short_description = f"Exercise analysis model for {self.exercise_type}"
            coreml_model.author = "ReHand AI System"
            coreml_model.license = "Proprietary"
            coreml_model.version = "1.0"
            
            # Save Core ML model
            output_path = self.output_dir / f"{self.exercise_type}_model.mlmodel"
            coreml_model.save(str(output_path))
            
            print(f"✅ Core ML model saved to: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ Core ML export failed: {e}")
            print("💡 Installing coremltools: pip install coremltools")
            return None
    
    def export_to_tflite(self):
        """Export trained model to TensorFlow Lite format"""
        print("🤖 Exporting to TensorFlow Lite...")
        
        try:
            # Convert to TensorFlow Lite
            converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
            converter.optimizations = [tf.lite.Optimize.DEFAULT]
            
            # Quantize to int8 for mobile efficiency
            converter.representative_dataset = self._get_representative_dataset
            converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
            converter.inference_input_type = tf.int8
            converter.inference_output_type = tf.int8
            
            tflite_model = converter.convert()
            
            # Save TFLite model
            android_dir = Path(__file__).parent.parent / 'models' / 'android'
            android_dir.mkdir(exist_ok=True)
            
            output_path = android_dir / f"{self.exercise_type}_model.tflite"
            with open(output_path, 'wb') as f:
                f.write(tflite_model)
            
            print(f"✅ TensorFlow Lite model saved to: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ TensorFlow Lite export failed: {e}")
            return None
    
    def _get_representative_dataset(self):
        """Representative dataset for quantization"""
        # Generate a few representative samples
        for _ in range(100):
            data = np.random.random((1, self.config['sequence_length'], self.config['feature_size'])).astype(np.float32)
            yield [data]

def main():
    parser = argparse.ArgumentParser(description='Train exercise analysis models')
    parser.add_argument('--exercise', type=str, default='neck_stretch',
                       help='Exercise type to train (or "all" for all exercises)')
    parser.add_argument('--samples', type=int, default=1000,
                       help='Number of training samples to generate')
    
    args = parser.parse_args()
    
    if args.exercise == 'all':
        exercises = ['neck_stretch', 'shoulder_rolls', 'arm_circles', 'torso_twist', 'leg_raises']
    else:
        exercises = [args.exercise]
    
    for exercise in exercises:
        print(f"\n{'='*50}")
        print(f"🎯 Training model for: {exercise}")
        print(f"{'='*50}")
        
        trainer = ExerciseModelTrainer(exercise)
        
        try:
            # Load data
            train_data, valid_data, test_data = trainer.load_training_data()
            
            # Build and train model
            trainer.build_tcn_model()
            trainer.train_model(train_data, valid_data)
            
            # Evaluate
            trainer.evaluate_model(test_data)
            
            # Export models
            trainer.export_to_coreml()
            trainer.export_to_tflite()
            
            print(f"✅ {exercise} model training completed!")
            
        except Exception as e:
            print(f"❌ Training failed for {exercise}: {e}")
            continue
    
    print("\n🎉 All model training completed!")

if __name__ == "__main__":
    main()