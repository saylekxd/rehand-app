import React from 'react';
import { Canvas, Circle, Line, Text, useFont } from '@shopify/react-native-skia';
import { ViewStyle } from 'react-native';

// MediaPipe Pose Landmarks (33 keypoints) according to official documentation
interface PoseLandmark {
  keypoint: number;
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface Pose {
  landmarks: PoseLandmark[];
}

interface PoseOverlayProps {
  poses: Pose[];
  frameWidth: number;
  frameHeight: number;
  showLabels?: boolean;
  showSkeleton?: boolean;
  // Whether preview is mirrored (front camera)
  isFrontCamera?: boolean;
  // Video aspect ratio (width / height) of the camera stream before preview scaling.
  // iOS front/back default is 3:4 in portrait, so 0.75 is a safe default.
  videoAspectRatio?: number;
  // Optional rotation if source coordinates are landscape-relative
  rotate?: 'none' | 'cw' | 'ccw';
}

// Pose connections for drawing skeleton (based on MediaPipe documentation)
const POSE_CONNECTIONS = [
  // Face
  [1, 2], [2, 3], [4, 5], [5, 6], [1, 4], // Eyes
  [2, 7], [5, 8], // Eyes to ears
  [9, 10], // Mouth
  
  // Upper body
  [11, 12], // Shoulders
  [11, 13], [13, 15], // Left arm
  [12, 14], [14, 16], // Right arm
  [15, 17], [15, 19], [15, 21], // Left hand
  [16, 18], [16, 20], [16, 22], // Right hand
  
  // Torso
  [11, 23], [12, 24], // Shoulders to hips
  [23, 24], // Hips
  
  // Lower body
  [23, 25], [25, 27], // Left leg
  [24, 26], [26, 28], // Right leg
  [27, 29], [29, 31], // Left foot
  [28, 30], [30, 32], // Right foot
];

// Color coding for different body parts
const getPointColor = (keypoint: number): string => {
  if (keypoint === 0) return '#FF6B6B'; // Nose - red
  if (keypoint >= 1 && keypoint <= 10) return '#4ECDC4'; // Face features - teal
  if (keypoint >= 11 && keypoint <= 16) return '#45B7D1'; // Arms - blue
  if (keypoint >= 17 && keypoint <= 22) return '#96CEB4'; // Hands - green
  if (keypoint >= 23 && keypoint <= 24) return '#FFEAA7'; // Hips - yellow
  if (keypoint >= 25 && keypoint <= 28) return '#DDA0DD'; // Legs - plum
  if (keypoint >= 29 && keypoint <= 32) return '#98D8C8'; // Feet - mint
  return '#FFFFFF'; // Default - white
};

const PoseOverlay: React.FC<PoseOverlayProps> = ({
  poses,
  frameWidth,
  frameHeight,
  showLabels = true,
  showSkeleton = true,
  isFrontCamera = false,
  videoAspectRatio = 3 / 4,
  rotate = 'none',
}) => {
  // Use Inter font from expo-google-fonts - temporarily null for testing  
  const font = null; // useFont(require('path/to/Inter-Regular.ttf'), 10);

  if (!poses || poses.length === 0) {
    return null;
  }

  const containerStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: frameWidth,
    height: frameHeight,
    pointerEvents: 'none',
  };

  // Map normalized (x,y) in input-image space to preview space with "cover" scaling and optional mirroring
  const mapPoint = React.useCallback(
    (nx: number, ny: number) => {
      // Guard against NaN
      if (!isFinite(nx) || !isFinite(ny)) return { x: -1, y: -1 };

      // Optional 90° rotation in normalized space
      let rx = nx;
      let ry = ny;
      if (rotate === 'cw') {
        rx = 1 - ny;
        ry = nx;
      } else if (rotate === 'ccw') {
        rx = ny;
        ry = 1 - nx;
      }

      const viewAR = frameWidth / frameHeight;
      const videoAR = videoAspectRatio; // width/height in portrait

      let x: number;
      let y: number;

      if (viewAR > videoAR) {
        // View is wider than video -> match width, crop height (cover)
        const scaledHeight = frameWidth / videoAR;
        const offsetY = (scaledHeight - frameHeight) / 2;
        x = rx * frameWidth;
        y = ry * scaledHeight - offsetY;
      } else {
        // View is taller/narrower than video -> match height, crop width (cover)
        const scaledWidth = frameHeight * videoAR;
        const offsetX = (scaledWidth - frameWidth) / 2;
        x = rx * scaledWidth - offsetX;
        y = ry * frameHeight;
      }

      // Do not flip here. Mirroring is applied at the container level so Camera and Overlay share the same transform.

      return { x, y };
    },
    [frameWidth, frameHeight, videoAspectRatio, isFrontCamera, rotate]
  );

  return (
    <Canvas style={containerStyle}>
      {poses.map((pose, poseIndex) => (
        <React.Fragment key={`pose-${poseIndex}`}>
          {/* Draw skeleton connections */}
          {showSkeleton && POSE_CONNECTIONS.map((connection, connectionIndex) => {
            const [startIdx, endIdx] = connection;
            const sp = pose.landmarks.find(l => l.keypoint === startIdx);
            const ep = pose.landmarks.find(l => l.keypoint === endIdx);

            if (!sp || !ep) return null;
            if (sp.visibility <= 0.5 || ep.visibility <= 0.5) return null;

            const p1 = mapPoint(sp.x, sp.y);
            const p2 = mapPoint(ep.x, ep.y);

            // Skip if off-screen (with small tolerance for out-of-bounds)
            const onScreen = (p: { x: number; y: number }) => p.x >= -5 && p.x <= frameWidth + 5 && p.y >= -5 && p.y <= frameHeight + 5;
            if (!onScreen(p1) || !onScreen(p2)) return null;

            return (
              <Line
                key={`connection-${poseIndex}-${connectionIndex}`}
                p1={p1}
                p2={p2}
                color="rgba(255, 255, 255, 0.6)"
                strokeWidth={2}
              />
            );
          })}
          
          {/* Draw pose landmarks */}
          {pose.landmarks.map((landmark) => {
            if (landmark.visibility < 0.5) return null; // Skip invisible landmarks
            const { x, y } = mapPoint(landmark.x, landmark.y);
            if (!isFinite(x) || !isFinite(y)) return null;
            if (x < -5 || x > frameWidth + 5 || y < -5 || y > frameHeight + 5) return null;
            const color = getPointColor(landmark.keypoint);
            
            return (
              <React.Fragment key={`landmark-${poseIndex}-${landmark.keypoint}`}>
                {/* Landmark circle */}
                <Circle
                  cx={x}
                  cy={y}
                  r={5}
                  color={color}
                />
                
                {/* Landmark border */}
                <Circle
                  cx={x}
                  cy={y}
                  r={5}
                  color="rgba(0, 0, 0, 0.8)"
                  strokeWidth={2}
                  style="stroke"
                />
                
                {/* Landmark label */}
                {showLabels && font && (
                  <Text
                    x={x + 10}
                    y={y - 10}
                    text={`${landmark.keypoint}: ${landmark.name}`}
                    font={font}
                    color="white"
                  />
                )}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </Canvas>
  );
};

export default PoseOverlay;
