import React from 'react';
import { Canvas, Path, Skia, type SkPath } from '@shopify/react-native-skia';
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
  // Optional throttle to limit heavy path recomputation (ms)
  throttleMs?: number;
  // Visibility threshold (0..1) for drawing
  visibilityThreshold?: number;
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
  throttleMs = 0,
  visibilityThreshold = 0.5,
}) => {
  // Early exit when no poses
  if (!poses || poses.length === 0) return null;

  const containerStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: frameWidth,
    height: frameHeight,
    pointerEvents: 'none',
  };

  // Mapping function reused in draw callback
  const mapPoint = React.useCallback((nx: number, ny: number) => {
    if (!isFinite(nx) || !isFinite(ny)) return { x: -1, y: -1 };

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
    const videoAR = videoAspectRatio;

    if (viewAR > videoAR) {
      const scaledHeight = frameWidth / videoAR;
      const offsetY = (scaledHeight - frameHeight) / 2;
      return { x: rx * frameWidth, y: ry * scaledHeight - offsetY };
    } else {
      const scaledWidth = frameHeight * videoAR;
      const offsetX = (scaledWidth - frameWidth) / 2;
      return { x: rx * scaledWidth - offsetX, y: ry * frameHeight };
    }
  }, [frameWidth, frameHeight, videoAspectRatio, rotate]);

  // Build paths once per frame to minimize React element count
  const lastBuildRef = React.useRef<number>(0);
  const cacheRef = React.useRef<null | { skeletonPath: SkPath; strokePath: SkPath; fillPathsByColor: Record<string, SkPath> }>(null);

  const { skeletonPath, strokePath, fillPathsByColor } = React.useMemo(() => {
    const now = Date.now();
    if (throttleMs > 0 && cacheRef.current && (now - lastBuildRef.current) < throttleMs) {
      return cacheRef.current;
    }
    const skeleton = Skia.Path.Make();
    const stroke = Skia.Path.Make();
    const fills: Record<string, SkPath> = {} as any;
    const getFillPath = (color: string) => {
      if (!fills[color]) fills[color] = Skia.Path.Make();
      return fills[color];
    };

    if (showSkeleton) {
      for (let p = 0; p < poses.length; p += 1) {
        const lm = poses[p].landmarks;
        for (let i = 0; i < POSE_CONNECTIONS.length; i += 1) {
          const [sIdx, eIdx] = POSE_CONNECTIONS[i];
          const sp = lm.find(l => l.keypoint === sIdx);
          const ep = lm.find(l => l.keypoint === eIdx);
          if (!sp || !ep) continue;
          if (sp.visibility < visibilityThreshold || ep.visibility < visibilityThreshold) continue;
          const p1 = mapPoint(sp.x, sp.y);
          const p2 = mapPoint(ep.x, ep.y);
          if (!isFinite(p1.x) || !isFinite(p1.y) || !isFinite(p2.x) || !isFinite(p2.y)) continue;
          skeleton.moveTo(p1.x, p1.y);
          skeleton.lineTo(p2.x, p2.y);
        }
      }
    }

    for (let p = 0; p < poses.length; p += 1) {
      const lm = poses[p].landmarks;
      for (let j = 0; j < lm.length; j += 1) {
        const l = lm[j];
        if (l.visibility < visibilityThreshold) continue;
        const m = mapPoint(l.x, l.y);
        if (!isFinite(m.x) || !isFinite(m.y)) continue;
        // Fill path per color
        getFillPath(getPointColor(l.keypoint)).addCircle(m.x, m.y, 5);
        // Stroke path shared
        stroke.addCircle(m.x, m.y, 5);
      }
    }

    const result = { skeletonPath: skeleton, strokePath: stroke, fillPathsByColor: fills };
    cacheRef.current = result;
    lastBuildRef.current = now;
    return result;
  }, [poses, mapPoint, showSkeleton, throttleMs, visibilityThreshold]);

  return (
    <Canvas style={containerStyle}>
      {showSkeleton && (
        <Path path={skeletonPath} color="rgba(255, 255, 255, 0.6)" style="stroke" strokeWidth={2} />
      )}
      {Object.keys(fillPathsByColor).map((color) => (
        <Path key={color} path={fillPathsByColor[color]} color={color} style="fill" />
      ))}
      <Path path={strokePath} color="rgba(0, 0, 0, 0.8)" style="stroke" strokeWidth={2} />
    </Canvas>
  );
};

export default PoseOverlay;
