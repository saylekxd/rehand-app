import { useState, useCallback, useRef, useEffect } from 'react';
import { validateConstraint, updateMotionTrails, type Pose } from '@/utils/poseUtils';
import type { LiveMessage } from '@/components/ai/types';
import { useTranslation } from 'react-i18next';

export interface ExerciseStep {
  type: 'holdPosture' | 'timeWindow' | 'repCounter';
  hint: string;
  success: string;
  constraints: Record<string, any>;
  // For holdPosture
  minStableFrames?: number;
  // For timeWindow
  durationMs?: number;
}

export interface ExerciseStepsJson {
  version: number;
  steps: ExerciseStep[];
  rounds?: number; // number of times to repeat the full steps sequence
}

export interface ExerciseSessionState {
  currentStepIndex: number;
  totalSteps: number;
  remainingMs: number;
  isRunning: boolean;
  isCompleted: boolean;
  currentStepProgress: number; // 0-1 for current step
  currentRound: number;
  totalRounds: number;
}

export interface UseExerciseSessionProps {
  steps?: ExerciseStep[];
  durationMinutes: number;
  onFinish?: (completedSteps: number, totalTime: number) => void;
  isFrontCamera?: boolean;
  rounds?: number; // number of times to repeat the sequence (default 1)
}

export interface UseExerciseSessionReturn {
  state: ExerciseSessionState;
  messages: LiveMessage[];
  onPose: (poses: Pose[]) => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useExerciseSession({
  steps = [],
  durationMinutes,
  onFinish,
  isFrontCamera = true,
  rounds = 1,
}: UseExerciseSessionProps): UseExerciseSessionReturn {
  const { t } = useTranslation(['exercises']);
  
  // Session state
  const [state, setState] = useState<ExerciseSessionState>({
    currentStepIndex: 0,
    totalSteps: steps.length,
    remainingMs: durationMinutes * 60 * 1000,
    isRunning: false,
    isCompleted: false,
    currentStepProgress: 0,
    currentRound: 1,
    totalRounds: Math.max(1, rounds || 1),
  });

  // Messages for live feedback
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  
  // Internal refs for timers and step tracking
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const stepStartTimeRef = useRef<number>(0);
  const stableFramesCountRef = useRef<number>(0);
  const messageIdCounterRef = useRef<number>(0);
  // For timeWindow steps: start timestamp when constraints first satisfied
  const timeWindowHoldStartRef = useRef<number | null>(null);
  const completionReportedRef = useRef<boolean>(false);
  // Counter for alternating between hint and specific feedback
  const feedbackAlternateCounterRef = useRef<number>(0);

  // Add message to feedback overlay
  const addMessage = useCallback((text: string, level: LiveMessage['level'] = 'info') => {
    const message: LiveMessage = {
      id: `msg_${++messageIdCounterRef.current}`,
      text,
      level,
    };
    
    console.log('[Debug] Adding message:', text, 'level:', level);
    setMessages(prev => {
      const newMessages = [...prev.slice(-2), message];
      console.log('[Debug] Total messages:', newMessages.length);
      return newMessages;
    });
  }, []);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  // Move to next step
  const moveToNextStep = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentStepIndex + 1;
      
      const totalRoundsLocal = prev.totalRounds ?? Math.max(1, rounds || 1);
      const currentRoundLocal = prev.currentRound ?? 1;

      if (nextIndex >= steps.length) {
        // Completed one sequence
        if (currentRoundLocal < totalRoundsLocal) {
          // Start next round
          const nextRound = currentRoundLocal + 1;
          addMessage(t('session.round', { current: nextRound, total: totalRoundsLocal }), 'info');
          stepStartTimeRef.current = Date.now();
          stableFramesCountRef.current = 0;
          timeWindowHoldStartRef.current = null;
          return {
            ...prev,
            currentStepIndex: 0,
            currentStepProgress: 0,
            currentRound: nextRound,
            // keep totalRounds
          };
        } else {
          // All rounds completed
          addMessage(t('session.allStepsCompleted'), 'success');
          return {
            ...prev,
            isCompleted: true,
            isRunning: false,
            currentStepProgress: 1,
          };
        }
      }

      // Move to next step
      const nextStep = steps[nextIndex];
      addMessage(nextStep.hint, 'info');
      stepStartTimeRef.current = Date.now();
      stableFramesCountRef.current = 0;
      timeWindowHoldStartRef.current = null;

      return {
        ...prev,
        currentStepIndex: nextIndex,
        currentStepProgress: 0,
      };
    });
  }, [steps, addMessage, t, rounds]);

  // Start session
  const start = useCallback(() => {
    console.log('[Debug] Starting session with', steps.length, 'steps');
    if (steps.length === 0) {
      console.log('[Debug] No steps to execute');
      addMessage(t('session.noSteps'), 'warning');
      return;
    }

    clearTimers();
    startTimeRef.current = Date.now();
    stepStartTimeRef.current = Date.now();
    stableFramesCountRef.current = 0;
    completionReportedRef.current = false;

    setState({
      currentStepIndex: 0,
      totalSteps: steps.length,
      remainingMs: durationMinutes * 60 * 1000,
      isRunning: true,
      isCompleted: false,
      currentStepProgress: 0,
      currentRound: 1,
      totalRounds: Math.max(1, rounds || 1),
    });

    console.log('[Debug] Session state set, isRunning: true');

    // Start with first step
    const firstStep = steps[0];
    console.log('[Debug] First step:', firstStep.hint);
    addMessage(firstStep.hint, 'info');

    // Session timer (countdown)
    sessionTimerRef.current = setInterval(() => {
      setState(prev => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, durationMinutes * 60 * 1000 - elapsed);
        
        if (remaining <= 0) {
          // Session time ended
          clearTimers();
          addMessage(t('session.timeEnded'), 'warning');
          completionReportedRef.current = true;
          onFinish?.(prev.currentStepIndex, elapsed);
          
          return {
            ...prev,
            remainingMs: 0,
            isRunning: false,
            isCompleted: true,
          };
        }

        return {
          ...prev,
          remainingMs: remaining,
        };
      });
    }, 1000) as any;

    // Set step timer for first step if it's timeWindow
    // Counting for timeWindow now happens only while constraints are satisfied (see onPose)
  }, [steps, durationMinutes, rounds, addMessage, moveToNextStep, onFinish, clearTimers, t]);

  // Stop session
  const stop = useCallback(() => {
    clearTimers();
    const elapsed = Date.now() - startTimeRef.current;
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
    }));

    addMessage(t('session.stopped'), 'info');
    onFinish?.(state.currentStepIndex, elapsed);
  }, [clearTimers, onFinish, addMessage, state.currentStepIndex, t]);

  // Pause session
  const pause = useCallback(() => {
    clearTimers();
    setState(prev => ({ ...prev, isRunning: false }));
    addMessage(t('session.paused'), 'info');
  }, [clearTimers, addMessage, t]);

  // Resume session
  const resume = useCallback(() => {
    if (state.isCompleted) return;
    
    setState(prev => ({ ...prev, isRunning: true }));
    addMessage(t('session.resumed'), 'info');
    
    // Restart timers with remaining time
    // Note: This is simplified - in real implementation you'd need to track pause time
    start();
  }, [state.isCompleted, addMessage, start, t]);

  // Process pose landmarks
  const onPose = useCallback((poses: Pose[]) => {
    if (!state.isRunning || state.isCompleted || poses.length === 0) {
      return;
    }

    const currentPose = poses[0]; // Use first/strongest pose
    const currentStep = steps[state.currentStepIndex];
    
    if (!currentStep) {
      console.log('[Debug] No current step found, index:', state.currentStepIndex);
      return;
    }

    console.log('[Debug] Processing pose for step:', state.currentStepIndex, 'type:', currentStep.type);

    // Update motion trails for future motion detection
    updateMotionTrails(currentPose);

    // Validate all constraints for current step
    const constraintResults = Object.entries(currentStep.constraints).map(([constraintType, params]) => {
      const satisfied = validateConstraint(currentPose, constraintType, params, isFrontCamera);
      console.log('[Debug] Constraint', constraintType, ':', satisfied ? 'PASS' : 'FAIL');
      return {
        type: constraintType,
        satisfied,
      };
    });

    const allConstraintsSatisfied = constraintResults.every(result => result.satisfied);
    console.log('[Debug] All constraints satisfied:', allConstraintsSatisfied);

    // Handle step progression based on type
    if (currentStep.type === 'holdPosture') {
      if (allConstraintsSatisfied) {
        stableFramesCountRef.current++;
        const requiredFrames = currentStep.minStableFrames || 15;
        const progress = Math.min(1, stableFramesCountRef.current / requiredFrames);
        
        console.log('[Debug] Hold posture progress:', stableFramesCountRef.current, '/', requiredFrames, '=', Math.round(progress * 100) + '%');
        
        setState(prev => ({ ...prev, currentStepProgress: progress }));

        if (stableFramesCountRef.current >= requiredFrames) {
          // Step completed
          console.log('[Debug] Step completed! Moving to next step...');
          addMessage(currentStep.success, 'success');
          setTimeout(() => moveToNextStep(), 500); // Small delay before next step
        }
      } else {
        // Reset stable frames counter if constraints not met
        if (stableFramesCountRef.current > 0) {
          stableFramesCountRef.current = Math.max(0, stableFramesCountRef.current - 2);
          setState(prev => ({ 
            ...prev, 
            currentStepProgress: Math.min(1, stableFramesCountRef.current / (currentStep.minStableFrames || 15))
          }));
        }
        
        // Debounced feedback on failed constraints (max every 2 seconds)
        const failedConstraints = constraintResults
          .filter(result => !result.satisfied)
          .map(result => result.type);
        
        if (failedConstraints.length > 0) {
          const now = Date.now();
          const lastFeedbackTime = (window as any).__lastConstraintFeedback || 0;
          
          if (now - lastFeedbackTime > 2000) { // Max one feedback every 2 seconds
            (window as any).__lastConstraintFeedback = now;
            
            // Alternate between hint (what to do) and specific constraint feedback
            feedbackAlternateCounterRef.current++;
            const showHint = feedbackAlternateCounterRef.current % 2 === 1;
            
            if (showHint) {
              // Show the step hint (remind user what the exercise is)
              addMessage(currentStep.hint, 'info');
            } else {
              // Show specific constraint feedback
              const constraintKey = `session.constraints.${failedConstraints[0]}`;
              const message = t(constraintKey, { 
                defaultValue: t('session.constraints.correctPosition') 
              });
              addMessage(message, 'warning');
            }
          }
        }
      }
    } else if (currentStep.type === 'timeWindow') {
      const duration = currentStep.durationMs || 30000;
      const nowTs = Date.now();

      if (allConstraintsSatisfied) {
        if (timeWindowHoldStartRef.current == null) {
          timeWindowHoldStartRef.current = nowTs;
        }
        const heldMs = nowTs - timeWindowHoldStartRef.current;
        const progress = Math.min(1, heldMs / duration);
        setState(prev => ({ ...prev, currentStepProgress: progress }));

        if (heldMs >= duration) {
          // Step completed when held continuously for the full duration
          timeWindowHoldStartRef.current = null;
          addMessage(currentStep.success, 'success');
          setTimeout(() => moveToNextStep(), 500);
        }
      } else {
        // Reset hold if constraints break
        if (timeWindowHoldStartRef.current != null) {
          timeWindowHoldStartRef.current = null;
          setState(prev => ({ ...prev, currentStepProgress: 0 }));
        }

        // Provide debounced feedback - alternate between hint and generic reminder
        const lastTimeWindowFeedback = (window as any).__lastTimeWindowFeedback || 0;
        if (nowTs - lastTimeWindowFeedback > 3000) {
          (window as any).__lastTimeWindowFeedback = nowTs;
          
          // Alternate between hint (what to do) and generic reminder
          feedbackAlternateCounterRef.current++;
          const showHint = feedbackAlternateCounterRef.current % 2 === 1;
          
          if (showHint) {
            // Show the step hint (remind user what the exercise is)
            addMessage(currentStep.hint, 'info');
          } else {
            // Show generic reminder
            addMessage(t('session.maintainPosition'), 'warning');
          }
        }
      }
    }
  }, [state.isRunning, state.isCompleted, state.currentStepIndex, steps, addMessage, moveToNextStep, isFrontCamera, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Handle session completion
  useEffect(() => {
    if (state.isCompleted && !completionReportedRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      completionReportedRef.current = true;
      onFinish?.(state.currentStepIndex, elapsed);
    }
  }, [state.isCompleted, state.currentStepIndex, onFinish]);

  return {
    state,
    messages,
    onPose,
    start,
    stop,
    pause,
    resume,
  };
}
