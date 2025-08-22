#!/bin/bash

echo "🚀 Setting up AI model training environment..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Training environment ready!"
echo ""
echo "🎯 To train models:"
echo "  1. Generate training data: npm run train-models:all"
echo "  2. Activate environment: source training_scripts/venv/bin/activate"
echo "  3. Train models: python training_scripts/train_exercise_model.py --exercise all"