import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';

export type BlazePoseModels = {
  detector: TensorflowModel | null;
  landmark: TensorflowModel | null;
};

export function useBlazePose(variant: 'full' | 'heavy' = 'full') {
  const detector = useTensorflowModel(require('../assets/models/pose_detection.tflite'));
  const landmark = useTensorflowModel(
    variant === 'heavy'
      ? require('../assets/models/pose_landmark_heavy.tflite')
      : require('../assets/models/pose_landmark_full.tflite')
  );

  const loading = detector.state !== 'loaded' || landmark.state !== 'loaded';
  const error = useMemo(() => {
    if (detector.state === 'error') return detector.error?.message ?? 'Detector load error';
    if (landmark.state === 'error') return landmark.error?.message ?? 'Landmark load error';
    return null;
  }, [detector.state, landmark.state]);

  useEffect(() => {
    if (detector.state === 'loaded') {
      // eslint-disable-next-line no-console
      console.log('[BlazePose] Detector loaded (delegate:', detector.model.delegate, ')');
    }
  }, [detector.state]);

  useEffect(() => {
    if (landmark.state === 'loaded') {
      // eslint-disable-next-line no-console
      console.log('[BlazePose] Landmark loaded (delegate:', landmark.model.delegate, ')');
    }
  }, [landmark.state]);

  useEffect(() => {
    if (!loading && !error) {
      // eslint-disable-next-line no-console
      console.log('[BlazePose] Both models loaded. Ready for inference.');
    }
  }, [loading, error]);

  const models: BlazePoseModels = useMemo(() => ({
    detector: detector.state === 'loaded' ? detector.model : null,
    landmark: landmark.state === 'loaded' ? landmark.model : null,
  }), [detector.state, landmark.state]);

  return { loading, error, models };
}


