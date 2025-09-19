## Exercise Session - Prompt-Based Implementation Plan (steps_json)

Goal: Let users pick an exercise, start a guided camera session with timed instructions and live feedback, verify steps using pose landmarks, and record completion – driven by a declarative `steps_json` plan per exercise.

References
- Data: `public.exercises` with `duration_minutes`, `steps_json JSONB` (to add), and optional `instructions TEXT[]` for UI only.
- Fetching: `services/exercises.ts`, hooks `useExercises`, `useExercise`.
- Camera: `app/(tabs)/ai.tsx`, `components/ai/CameraSurface.tsx`.
- Overlay: `components/ai/LiveFeedbackOverlay.tsx`.
- Pose events: native iOS `PoseLandmarks` → RN events consumed in `CameraSurface`.

---

### 0) Migration: add steps_json (use MCP to check how to add it properly)
- [x] Add migration `004_add_steps_json.sql`:
  - `ALTER TABLE public.exercises ADD COLUMN steps_json JSONB;`
  - (Optional) Backfill `steps_json` for seeded exercises.
- [x] Update `types/Exercise` to include `steps_json?: any`.
- [x] Update `ExercisesService.get*` SELECT to include `steps_json` (already selects `*`).

Acceptance: Exercises can carry a structured session plan.

### 1) Navigation and selection flow
- [ ] Add "Start exercise" from index screen:
  - In `app/(tabs)/index.tsx`, on exercise card: `router.push({ pathname: '/(tabs)/ai', params: { exerciseId: exercise.id } })`.
- [ ] Read `exerciseId` in `app/(tabs)/ai.tsx` via `useLocalSearchParams`, fetch full exercise using `useExercise(exerciseId)`, pass to camera as `activeExercise`.

Acceptance: Selecting an exercise routes to camera tab and loads its data.

### 2) Exercise session engine (rules, timers, messages)
- [ ] Create `hooks/useExerciseSession.ts`:
  - API:
    - `useExerciseSession({ steps, durationMinutes, onFinish })` ⇒ `{ state, messages, onPose(poses), start(), stop() }`.
    - `state`: `{ currentStepIndex, totalSteps, remainingMs, isRunning }`.
    - `messages`: array for `LiveFeedbackOverlay`.
  - Executes `steps_json` sequentially. Each step:
    - `type`: `holdPosture` | `timeWindow` | `repCounter` (optional later).
    - `constraints`: references to pose landmarks (e.g., joints, heights, distances, velocities).
    - `durationMs` (for `timeWindow`) or `minStableFrames` (for `holdPosture`).
    - `hint` (UI message) and `success` (on completion).
  - Session timer: based on `duration_minutes`. Steps can outlive or be truncated by session end.

Acceptance: Engine advances steps defined in JSON and ends session by time.

### 3) steps_json schema and examples
Schema (MVP)
```json
{
  "version": 1,
  "steps": [
    {
      "type": "holdPosture",
      "hint": "Wyciągnij ręce w bok na wysokość ramion",
      "success": "Dobrze! Utrzymaj pozycję",
      "minStableFrames": 15,
      "constraints": {
        "wristsAtShoulderHeight": { "toleranceY": 0.08 },
        "elbowsExtended": { "minAngleDeg": 155 }
      }
    },
    {
      "type": "timeWindow",
      "hint": "Kółka w przód przez 30 s",
      "success": "Świetnie! Teraz w tył",
      "durationMs": 30000,
      "constraints": {
        "armsRaised": { "minShoulderHeightY": 0.35 },
        "wristMotionForward": { "minAvgSpeed": 0.02 }
      }
    },
    {
      "type": "timeWindow",
      "hint": "Kółka w tył przez 30 s",
      "success": "Zakończ delikatnym potrząsaniem ramion",
      "durationMs": 30000,
      "constraints": {
        "armsRaised": { "minShoulderHeightY": 0.35 },
        "wristMotionBackward": { "minAvgSpeed": 0.02 }
      }
    }
  ]
}
```

Przykłady (seed-ready)
- Rotacje ramion (jak wyżej): 1x `holdPosture`, 2x `timeWindow` (przód/tył, po 30 s).
- Rozciąganie szyi:
```json
{
  "version": 1,
  "steps": [
    { "type": "holdPosture", "hint": "Siedź prosto", "minStableFrames": 15, "constraints": {"uprightTorso": {"maxLeanDeg": 10}} },
    { "type": "timeWindow", "hint": "Pochyl głowę w lewo 15–30 s", "durationMs": 20000, "constraints": {"headTiltLeft": {"minTiltDeg": 12}} },
    { "type": "timeWindow", "hint": "Pochyl głowę w prawo 15–30 s", "durationMs": 20000, "constraints": {"headTiltRight": {"minTiltDeg": 12}} }
  ]
}
```
- Mobilizacja kolan:
```json
{
  "version": 1,
  "steps": [
    { "type": "holdPosture", "hint": "Usiądź prosto", "minStableFrames": 15, "constraints": {"uprightTorso": {"maxLeanDeg": 12}} },
    { "type": "timeWindow", "hint": "Prostuj lewą nogę przez 30 s", "durationMs": 30000, "constraints": {"leftKneeExtension": {"minAngleDeg": 150}} },
    { "type": "timeWindow", "hint": "Prostuj prawą nogę przez 30 s", "durationMs": 30000, "constraints": {"rightKneeExtension": {"minAngleDeg": 150}} }
  ]
}
```

Uwagi
- Tak: `steps_json` zawiera opis kroków, a silnik przekłada je na warunki nad landmarkami (kąty, wysokości, ruch).
- Tolerancje i progi można stroić per-krok.

### 4) Camera integration
- [ ] In `CameraSurface.tsx`:
  - Accept `activeExercise?: Exercise` prop and extract `steps = exercise.steps_json?.steps`.
  - Initialize `useExerciseSession` with `{ steps, durationMinutes }`.
  - In `onPoseLandmarksDetected` handler call `session.onPose(e.poses)`.
  - Render `LiveFeedbackOverlay` with `messages` at bottom; show current step title and remaining session time.
- [ ] In `ai.tsx` handle `onFinish`:
  - Stop model, navigate back or show summary.

Acceptance: During camera session, overlay shows live guidance and step progression.

### 5) Completion & persistence
- [ ] On finish: call `ExercisesService.recordExerciseCompletion(userId, exerciseId, durationCompleted, rating?, notes?)`.
- [ ] Optional summary screen with achieved time and steps.

Acceptance: Completion is stored; subsequent profile/history can reflect it.

### 6) UX details
- [ ] Bottom overlay stacking: use `LiveFeedbackOverlay` with last 2–3 messages, `position='bottom'`.
- [ ] Show step chip: "Krok X/Y", and a progress bar for the current step timer.
- [ ] Pause/Resume button in-camera (optional for MVP).

Acceptance: Clean, non-intrusive guidance; camera stays full-screen.

### 7) Pose primitives (utilities)
- [ ] Add `poseUtils.ts`:
  - `angle(a, b, c)`, `absDiff(a, b)`, `isApprox(y1, y2, tol)`, `distance(p1, p2)`, `velocityTrail(keypointId)`.
  - Input: first (or strongest) pose landmarks normalized [0..1].
- [ ] Keep CPU-light; cache small trails for wrists for motion presence.

Acceptance: Utilities unit-tested on simple vectors.

### 8) Safety & performance
- [ ] Maintain existing throttles (frame 1/2; overlay ~10 FPS; Skia `throttleMs`).
- [ ] Guard if no pose detected: push gentle hint after 2 s ("Upewnij się, że cała sylwetka jest w kadrze").

Acceptance: Stable FPS on device; no watchdog resets during session.

### 9) Testing plan
- [ ] Dry-run with steps_json for "Rotacje ramion"; verify time steps advance and hold posture detection works.
- [ ] Edge cases: front/back camera, mirrored preview, low light (ensure thresholds tolerant).

---

Done criteria
- Start from index → camera full-screen.
- Timed guidance displayed; steps advance per `steps_json`; session ends after `duration_minutes`.
- Completion recorded in `user_exercises`.

### 10) Debug mode (HUD / telemetry)
- [ ] Włącznik debug: flaga w `CameraSurface` (prop `debug`), param w `ai.tsx` (`?debug=1`) lub hidden gesture.
- [ ] HUD na overlay (górny-lewy róg):
  - FPS pose/overlay, liczba kroków, index bieżącego kroku.
  - Metryki per‑krok, np.: angle(shoulder–elbow–wrist), |y(wrist)−y(shoulder)|, avg wrist speed.
  - Stan ewaluacji (spełnione/nie) dla każdego constraintu w aktualnym kroku.
- [ ] Throttling HUD do 5–10 FPS, aby nie wpływać na wydajność.
- [ ] Logi: grupowane wpisy przy przejściu kroku, rozpoczęciu/zakończeniu sesji.

Acceptance: Po włączeniu debug widać wartości metryk i status constraintów; brak istotnego spadku FPS.

Prompts
- "Add `debug` prop to `CameraSurface` and thread from `ai.tsx` via query param. Render a small HUD with current step and metrics from `useExerciseSession`. Throttle to 5–10 FPS."


