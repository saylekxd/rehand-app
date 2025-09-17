import React, { useMemo, useCallback } from 'react';
import { View, Animated, ViewStyle } from 'react-native';

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

interface NativePoseOverlayProps {
  poses: Pose[];
  frameWidth: number;
  frameHeight: number;
  showLabels?: boolean;
  showSkeleton?: boolean;
  // Whether preview is mirrored (front camera)
  isFrontCamera?: boolean;
  // Video aspect ratio (width / height) of the camera stream before preview scaling.
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

// Component for a single landmark point
const LandmarkPoint = React.memo<{
  landmark: PoseLandmark;
  x: number;
  y: number;
  color: string;
  showLabel: boolean;
}>(({ landmark, x, y, color, showLabel }) => {
  const pointStyle: ViewStyle = {
    position: 'absolute',
    left: x - 5,
    top: y - 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
  };

  return (
    <Animated.View style={pointStyle}>
      {showLabel && (
        <View style={{
          position: 'absolute',
          left: 10,
          top: -20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
          minWidth: 20,
        }}>
          {/* Text would require expo-google-fonts - skip for now */}
        </View>
      )}
    </Animated.View>
  );
});

// Component for skeleton connection line
const SkeletonLine = React.memo<{
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}>(({ startPoint, endPoint }) => {
  const distance = Math.sqrt(
    Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
  );
  
  const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * (180 / Math.PI);
  
  const lineStyle: ViewStyle = {
    position: 'absolute',
    left: startPoint.x,
    top: startPoint.y - 1, // Center the line
    width: distance,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transformOrigin: '0 50%',
    transform: [{ rotate: `${angle}deg` }],
    zIndex: 5,
  };

  return <Animated.View style={lineStyle} />;
});

const NativePoseOverlay = React.memo<NativePoseOverlayProps>(({
  poses,
  frameWidth,
  frameHeight,
  showLabels = true,
  showSkeleton = true,
  isFrontCamera = false,
  videoAspectRatio = 3 / 4,
  rotate = 'none',
}) => {
  // Memoize pose connections to avoid recreation on every render
  const poseConnections = useMemo(() => POSE_CONNECTIONS, []);
  
  // Memoized onScreen check to avoid repeated calculations
  const isOnScreen = useCallback(
    (p: { x: number; y: number }) => 
      p.x >= -10 && p.x <= frameWidth + 10 && p.y >= -10 && p.y <= frameHeight + 10,
    [frameWidth, frameHeight]
  );

  // Map normalized (x,y) in input-image space to preview space with "cover" scaling
  const mapPoint = useCallback(
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

      return { x, y };
    },
    [frameWidth, frameHeight, videoAspectRatio, rotate]
  );

  const containerStyle: ViewStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: frameWidth,
    height: frameHeight,
    pointerEvents: 'none',
  }), [frameWidth, frameHeight]);

  if (!poses || poses.length === 0) {
    return null;
  }

  // Memoize rendered content to prevent unnecessary re-renders
  const overlayContent = useMemo(() => {
    const elements: React.ReactElement[] = [];
    
    poses.forEach((pose, poseIndex) => {
      // Draw skeleton connections first (behind landmarks)
      if (showSkeleton) {
        poseConnections.forEach((connection, connectionIndex) => {
          const [startIdx, endIdx] = connection;
          const startLandmark = pose.landmarks.find(l => l.keypoint === startIdx);
          const endLandmark = pose.landmarks.find(l => l.keypoint === endIdx);

          if (!startLandmark || !endLandmark) return;
          if (startLandmark.visibility <= 0.5 || endLandmark.visibility <= 0.5) return;

          const startPoint = mapPoint(startLandmark.x, startLandmark.y);
          const endPoint = mapPoint(endLandmark.x, endLandmark.y);

          // Skip if off-screen
          if (!isOnScreen(startPoint) || !isOnScreen(endPoint)) return;

          elements.push(
            <SkeletonLine
              key={`skeleton-${poseIndex}-${connectionIndex}`}
              startPoint={startPoint}
              endPoint={endPoint}
            />
          );
        });
      }
      
      // Draw landmarks (on top of skeleton)
      pose.landmarks.forEach((landmark) => {
        if (landmark.visibility < 0.5) return; // Skip invisible landmarks
        
        const { x, y } = mapPoint(landmark.x, landmark.y);
        if (!isFinite(x) || !isFinite(y)) return;
        if (!isOnScreen({ x, y })) return;
        
        const color = getPointColor(landmark.keypoint);
        
        elements.push(
          <LandmarkPoint
            key={`landmark-${poseIndex}-${landmark.keypoint}`}
            landmark={landmark}
            x={x}
            y={y}
            color={color}
            showLabel={showLabels}
          />
        );
      });
    });
    
    return elements;
  }, [poses, showSkeleton, showLabels, poseConnections, mapPoint, isOnScreen]);

  return (
    <View style={containerStyle}>
      {overlayContent}
    </View>
  );
});

export default NativePoseOverlay;
