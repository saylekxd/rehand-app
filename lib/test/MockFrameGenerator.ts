// Mock Frame Generator for AI System Testing
// This component generates synthetic camera frames to test the AI pipeline

import { VisionOutput, KeyPoint } from '../vision/types';
import { ExerciseType } from '../ml/types';

export class MockFrameGenerator {
  private frameCount = 0;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: ((visionOutput: VisionOutput) => void)[] = [];

  constructor(private targetFPS: number = 30) {}

  addCallback(callback: (visionOutput: VisionOutput) => void): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (visionOutput: VisionOutput) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.frameCount = 0;
    
    const interval = 1000 / this.targetFPS;
    this.intervalId = setInterval(() => {
      this.generateAndEmitFrame();
    }, interval);
    
    console.log(`🎭 Mock frame generator started at ${this.targetFPS}fps`);
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Mock frame generator stopped');
  }

  private generateAndEmitFrame(): void {
    const visionOutput = this.generateMockVisionOutput();
    
    // Emit to all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(visionOutput);
      } catch (error) {
        console.warn('Error in frame callback:', error);
      }
    });
    
    this.frameCount++;
  }

  private generateMockVisionOutput(): VisionOutput {
    const timestamp = Date.now();
    
    // Generate realistic pose keypoints for a neck stretch exercise
    const keyPoints: KeyPoint[] = this.generateMockKeyPoints();
    
    return {
      keyPoints,
      timestamp,
      frameSize: { width: 640, height: 480 }
    };
  }

  private generateMockKeyPoints(): KeyPoint[] {
    // Simulate neck stretch exercise motion
    const time = this.frameCount / this.targetFPS; // seconds
    const neckMovement = Math.sin(time * 0.5) * 30; // Slow neck movement

    // Basic pose landmarks for upper body
    const baseKeyPoints: Array<{name: string, baseX: number, baseY: number}> = [
      { name: 'nose', baseX: 320, baseY: 150 },
      { name: 'left_eye', baseX: 310, baseY: 140 },
      { name: 'right_eye', baseX: 330, baseY: 140 },
      { name: 'left_ear', baseX: 300, baseY: 150 },
      { name: 'right_ear', baseX: 340, baseY: 150 },
      { name: 'left_shoulder', baseX: 280, baseY: 200 },
      { name: 'right_shoulder', baseX: 360, baseY: 200 },
      { name: 'left_elbow', baseX: 250, baseY: 250 },
      { name: 'right_elbow', baseX: 390, baseY: 250 },
      { name: 'left_wrist', baseX: 220, baseY: 300 },
      { name: 'right_wrist', baseX: 420, baseY: 300 },
    ];

    return baseKeyPoints.map(point => ({
      name: point.name,
      position: {
        x: point.baseX + (Math.random() - 0.5) * 10, // Add small random variation
        y: point.baseY + (point.name.includes('head') || point.name.includes('nose') || point.name.includes('eye') || point.name.includes('ear') ? neckMovement : 0),
        z: 0.5 + (Math.random() - 0.5) * 0.1 // Mock depth
      },
      confidence: 0.8 + Math.random() * 0.2 // High confidence
    }));
  }

  // Simulate specific exercise patterns
  generateExerciseMotion(exerciseType: ExerciseType): KeyPoint[] {
    const time = this.frameCount / this.targetFPS;
    
    switch (exerciseType) {
      case ExerciseType.NECK_STRETCH:
        return this.generateNeckStretchMotion(time);
      case ExerciseType.SHOULDER_ROLLS:
        return this.generateShoulderRollMotion(time);
      case ExerciseType.ARM_CIRCLES:
        return this.generateArmCircleMotion(time);
      default:
        return this.generateMockKeyPoints();
    }
  }

  private generateNeckStretchMotion(time: number): KeyPoint[] {
    // Simulate neck stretch: slow side-to-side movement
    const neckAngle = Math.sin(time * 0.3) * 25; // 25-degree range, slow movement
    
    return [
      {
        name: 'nose',
        position: { x: 320 + neckAngle, y: 150, z: 0.5 },
        confidence: 0.9
      },
      {
        name: 'left_ear',
        position: { x: 300 + neckAngle - 5, y: 150 + Math.abs(neckAngle) * 0.2, z: 0.5 },
        confidence: 0.85
      },
      {
        name: 'right_ear',
        position: { x: 340 + neckAngle + 5, y: 150 + Math.abs(neckAngle) * 0.2, z: 0.5 },
        confidence: 0.85
      },
      // ... other keypoints remain relatively stable
      {
        name: 'left_shoulder',
        position: { x: 280, y: 200, z: 0.5 },
        confidence: 0.9
      },
      {
        name: 'right_shoulder',
        position: { x: 360, y: 200, z: 0.5 },
        confidence: 0.9
      }
    ];
  }

  private generateShoulderRollMotion(time: number): KeyPoint[] {
    // Simulate shoulder rolls: circular shoulder movement
    const rollPhase = time * 0.4; // Slow roll
    const leftShoulderOffset = {
      x: Math.cos(rollPhase) * 15,
      y: Math.sin(rollPhase) * 10
    };
    const rightShoulderOffset = {
      x: Math.cos(rollPhase + Math.PI) * 15, // Opposite phase
      y: Math.sin(rollPhase + Math.PI) * 10
    };

    return [
      {
        name: 'left_shoulder',
        position: { x: 280 + leftShoulderOffset.x, y: 200 + leftShoulderOffset.y, z: 0.5 },
        confidence: 0.9
      },
      {
        name: 'right_shoulder',
        position: { x: 360 + rightShoulderOffset.x, y: 200 + rightShoulderOffset.y, z: 0.5 },
        confidence: 0.9
      },
      // Head remains stable
      {
        name: 'nose',
        position: { x: 320, y: 150, z: 0.5 },
        confidence: 0.9
      }
    ];
  }

  private generateArmCircleMotion(time: number): KeyPoint[] {
    // Simulate arm circles: arms moving in circles
    const circlePhase = time * 0.5;
    const armRadius = 50;
    
    return [
      {
        name: 'left_shoulder',
        position: { x: 280, y: 200, z: 0.5 },
        confidence: 0.9
      },
      {
        name: 'right_shoulder',
        position: { x: 360, y: 200, z: 0.5 },
        confidence: 0.9
      },
      {
        name: 'left_elbow',
        position: { 
          x: 280 + Math.cos(circlePhase) * armRadius,
          y: 200 + Math.sin(circlePhase) * armRadius,
          z: 0.5 
        },
        confidence: 0.8
      },
      {
        name: 'right_elbow',
        position: { 
          x: 360 + Math.cos(circlePhase + Math.PI) * armRadius,
          y: 200 + Math.sin(circlePhase + Math.PI) * armRadius,
          z: 0.5 
        },
        confidence: 0.8
      }
    ];
  }

  // Get current frame count for debugging
  getFrameCount(): number {
    return this.frameCount;
  }

  // Check if generator is running
  getIsRunning(): boolean {
    return this.isRunning;
  }
}