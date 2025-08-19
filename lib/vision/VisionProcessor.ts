import { Pose, POSE_LANDMARKS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_RIGHT } from '@mediapipe/pose';
import { VisionOutput, KeyPoint, FeatureFrame } from './types';
import { FeatureExtractor } from './FeatureExtractor';

export class VisionProcessor {
  private pose: Pose | null = null;
  private featureExtractor: FeatureExtractor;
  private isInitialized = false;

  constructor() {
    this.featureExtractor = new FeatureExtractor();
    this.initializePoseDetection();
  }

  private async initializePoseDetection() {
    try {
      // Initialize MediaPipe Pose
      const { Pose } = await import('@mediapipe/pose');
      
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults((results) => {
        this.onPoseResults(results);
      });

      this.isInitialized = true;
      console.log('✅ VisionProcessor initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize VisionProcessor:', error);
    }
  }

  private onPoseResults(results: any) {
    if (!results.poseLandmarks) return;

    const keyPoints: KeyPoint[] = results.poseLandmarks.map((landmark: any, index: number) => ({
      name: this.getLandmarkName(index),
      position: {
        x: landmark.x,
        y: landmark.y,
        z: landmark.z || 0
      },
      confidence: landmark.visibility || 0.5
    }));

    const visionOutput: VisionOutput = {
      keyPoints,
      timestamp: Date.now(),
      frameSize: { width: results.image.width, height: results.image.height }
    };

    // Extract features from pose data
    this.featureExtractor.extractFeatures(visionOutput);
  }

  async processFrame(imageData: ImageData): Promise<VisionOutput | null> {
    if (!this.isInitialized || !this.pose) {
      console.warn('VisionProcessor not initialized yet');
      return null;
    }

    try {
      await this.pose.send({ image: imageData });
      return null; // Results handled in onPoseResults callback
    } catch (error) {
      console.error('Error processing frame:', error);
      return null;
    }
  }

  private getLandmarkName(index: number): string {
    const landmarkNames = [
      'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
      'right_eye_inner', 'right_eye', 'right_eye_outer',
      'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
      'left_index', 'right_index', 'left_thumb', 'right_thumb',
      'left_hip', 'right_hip', 'left_knee', 'right_knee',
      'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
      'left_foot_index', 'right_foot_index'
    ];
    
    return landmarkNames[index] || `landmark_${index}`;
  }

  getCapabilities() {
    return {
      has2DPose: this.isInitialized,
      has3DPose: this.isInitialized,
      hasLiDARDepth: false,
      isReady: this.isInitialized
    };
  }

  dispose() {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.isInitialized = false;
  }
}
