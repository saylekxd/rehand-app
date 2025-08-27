## Prompt-based implementation plan: MediaPipe Tasks Pose + VisionCamera v3 + Skia (pełne ciało)

### Notatki
- Docelowo wykrywamy CAŁE CIAŁO (Pose), nie dłoń. Integracja bazuje na MediaPipe Tasks Vision (Pose Landmarker) osadzonym natywnie przez CocoaPods/Gradle i wywoływanym z frame processora VisionCamera v3; overlay rysujemy w `@shopify/react-native-skia`.
- Plan adaptuje kroki z przewodnika (Hand → Pose) i używa eventów/streamu landmarków do wyzwalania funkcji w fazach ćwiczeń, bez integracji z protezą ręki.

---

[x] Etap 0 — Preflight (zamiana kamery na VisionCamera)
**Prompt**
- Zastąp `expo-camera` przez VisionCamera v3 w dev-cliencie, zachowując istniejące UI/UX. Bez ML.

**Acceptance**
- Build iOS/Android w dev-cliencie przechodzi.
- Podgląd kamery działa w obecnym `CameraSurface` i fullscreen modal.

**Akcje**
- [x] Zainstaluj: `react-native-vision-camera@^3`, `react-native-worklets-core@^1`, `@shopify/react-native-skia`.
- [x] Utwórz `components/ai/CameraSurface.tsx` z VisionCamera i przenieś uprawnienia.
- [x] Zrefaktoryzuj `app/(tabs)/ai.tsx` do użycia `CameraSurface`.
- [ ] Przebuduj dev client (`expo run:ios` / `expo run:android`).

--- WAŻNE RZECZY DO POTWIERDZENIA PRZED ETAPEM 1---
Kamera i uprawnienia:
[x] Kod NIE używa już expo-camera w `app/(tabs)/ai.tsx` i `components/ai/CameraSurface.tsx` (zmigrowano na VisionCamera).
[x] VisionCamera ma inny model: useCameraDevice('front'|'back') + <Camera device={device} isActive frameProcessor={...} />, a uprawnienia przez useCameraPermission() lub metody statyczne.
[x] Konieczna refaktoryzacja obu plików: typy, hook uprawnień, API komponentu kamery — ZROBIONE.
[x] Usuń expo-camera z zależności po migracji, żeby uniknąć dublowania i pomyłek w importach.
[x] Metro bundler:
Modele `.task` dodajemy natywnie (iOS: Xcode, Android: `android/app/src/main/assets/`) — bez zmian w Metro.

---

[x] Etap 1 — Szkielet frame processora
**Prompt**
- Dodaj hook `useFrameProcessor`, który odbiera klatki (30 FPS), jeszcze bez ML. Loguj rozmiar i ogranicz do ~15 FPS w fullscreen.

**Acceptance**
- W logach widać dane klatek; FPS stabilny; brak jank.

**Akcje**
- [x] Utwórz `frameProcessors/poseProcessor.ts` z no-op procesorem.
- [x] Podepnij do `Camera` z `useFrameProcessor` - naturalny throttling przez VisionCamera.

---

[ ] Etap 2 — Natywne zależności MediaPipe Tasks Vision + model `.task`
**Prompt**
- Dodaj MediaPipe Tasks Vision (Pose Landmarker) natywnie oraz model `.task` dla pose. Bez uruchamiania inferencji.

**Acceptance**
- iOS: `pod install` przechodzi z `MediaPipeTasksVision` (>= 0.10.14), projekt się buduje.
- Android: dodane zależności i assets; projekt się buduje.

**Akcje**
- iOS: w `ios/Podfile` dodaj `pod 'MediaPipeTasksVision', '0.10.14'` i uruchom `pod install`.
- iOS: dodaj do projektu plik modelu: np. `pose_landmarker_full.task` (lub `lite`/`heavy`) – przypisz do targetu aplikacji.
- Android: umieść `pose_landmarker_full.task` w `android/app/src/main/assets/` (utwórz katalog, jeśli brak).
- Android: upewnij się, że `mavenCentral()` jest w repozytoriach; w razie potrzeby dodaj `implementation("com.google.mediapipe:tasks-vision:0.10.14")` w module `app`.

---

[ ] Etap 3 — Plugin frame processora (VisionCamera Plugin Builder)
**Prompt**
- Wygeneruj plugin frame processora i moduł natywny dla Pose Landmarker (singleton), analogicznie do przewodnika (Hand → Pose). Stream LIVE_STREAM.

**Acceptance**
- iOS/Android: istnieje plugin (np. `PoseLandmarksFrameProcessor`) oraz moduł `PoseLandmarks` inicjalizujący model i emitujący eventy.

**Akcje**
- Uruchom: `npx vision-camera-plugin-builder@latest ios` i `npx vision-camera-plugin-builder@latest android`.
- iOS: dodaj `PoseLandmarkerHolder.swift` (singleton), `PoseLandmarks.swift` + most `.m`, oraz `PoseLandmarksFrameProcessor.swift` przekazujący klatki do `PoseLandmarker` (`RunningMode.LIVE_STREAM`).
- Android (Kotlin): dodaj `PoseLandmarks.kt` (NativeModule z `@ReactMethod initModel()`), listener wyników (`PoseLandmarkerResult`) i `PoseLandmarksFrameProcessor` (plugin) — dodaj pakiety do `MainApplication` (`getPackages()`).
- Eventy: `onPoseLandmarksStatus`, `onPoseLandmarksError`, `onPoseLandmarksDetected` (33 punkty: x, y, z, visibility).

---

[ ] Etap 4 — Integracja JS: inicjalizacja modelu + strumień landmarków
**Prompt**
- W `components/ai/CameraSurface.tsx` zainicjuj model przy starcie ekranu, podłącz `useSkiaFrameProcessor` aby renderować podgląd i odbierać landmarki przez eventy. Lustrzane odbicie dla przedniej kamery.

**Acceptance**
- Stabilny strumień landmarków (≥ 15 FPS fullscreen na średnich/wysokich urządzeniach).
- Brak crashy przy background/foreground; poprawny mirror dla przedniej kamery.

**Akcje**
- Subskrybuj `onPoseLandmarksDetected` i mapuj wynik do znormalizowanych współrzędnych [0..1] widoku kamery.
- Dodaj wygładzanie (EMA 3–5 klatek) po stronie JS dla stabilności overlay/reguł.
- Zaimplementuj mirror współrzędnych dla przedniej kamery.

---

[ ] Etap 5 — Overlay w Skia
**Prompt**
- Narysuj szkielet 33‑punktowy i połączenia na Canvasie Skia; wspieraj lustrzane odbicie dla przedniej kamery.

**Acceptance**
- Punkty i linie pokrywają się z użytkownikiem; flip poprawny; overlay nie obniża FPS.

**Akcje**
- Utwórz `components/ai/PoseOverlay.tsx` (Skia `Canvas`).
- Zmapuj połączenia MediaPipe; progi visibility; kolorowanie stawów.

---

[ ] Etap 6 — Prymitywy ćwiczeń (rule engine) + wyzwalanie funkcji
**Prompt**
- Dodaj warstwę reguł do liczenia kątów i powtórzeń dla 1–2 ruchów (np. biceps curl, squat). Zamiast sterowania protezą — wyzwalaj funkcje/callbacki w fazach ruchu; równolegle podpowiedzi do `LiveFeedbackOverlay`.

**Acceptance**
- Na żywo pojawiają się wskazówki „tempo”, „zakres”, „postawa”; repy liczone poprawnie z debouncingiem.

**Akcje**
- `services/poseMath.ts` (kąty, wygładzanie, wykrywanie faz).
- `services/exercises/*.ts` (progi kątów, przejścia fazowe dla ćwiczeń).
- W ekranie AI rejestruj callbacki (np. `onExercisePhaseChange`, `onRepCompleted`) i wywołuj je na podstawie reguł.

---

[ ] Etap 7 — Integracja, UX i fallback
**Prompt**
- Dodaj wybór wariantu modelu (full vs heavy), fallback do inline (niższy FPS) na słabych urządzeniach. Obsłuż pauzę kamery przy backgroundingu.

**Acceptance**
- Przełącznik modelu działa i się zapamiętuje; app stabilna po background/foreground; brak crashy.

**Akcje**
- Małe ustawienie w aplikacji, persist w storage.
- Pauzuj frame processor gdy ekran niewidoczny lub aplikacja w tle.

---

[ ] Etap 8 — QA checklist per stage
- **Performance**: FPS, CPU, pamięć, termika po 3 minutach.
- **Correctness**: dopasowanie overlay, mirror, percepcja opóźnienia.
- **Stability**: background/foreground, flip kamery, fullscreen, orientacja.

---

## Pakiety i wersje (rekomendacje)
- `react-native-vision-camera` v3.x
- `react-native-worklets-core` v1.x
- `@shopify/react-native-skia` (najnowsza)
- MediaPipe Tasks Vision (natywnie): `MediaPipeTasksVision` 0.10.14 (iOS, CocoaPods), `com.google.mediapipe:tasks-vision:0.10.14` (Android)

## Modele
- MediaPipe Tasks Pose: `pose_landmarker_*.task` (warianty: `lite`, `full`, `heavy`).
- Licencja: Apache-2.0 (free, komercyjnie przyjazna).

---

## Pierwszy krok do wdrożenia
- Mamy VisionCamera + no‑op frame processor. Następnie: dodaj MediaPipe Tasks (Pods/Gradle) i podłącz model `.task`, wygeneruj plugin frame processora (adaptacja z artykułu Hand→Pose), zainicjalizuj model i uruchom strumień landmarków.


