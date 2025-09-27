export interface PoseLandmark {
  keypoint: number;
  name: string;
  x: number; // normalized [0..1]
  y: number; // normalized [0..1]
  z: number; // depth
  visibility: number; // confidence [0..1]
}

export interface Pose {
  landmarks: PoseLandmark[];
}


