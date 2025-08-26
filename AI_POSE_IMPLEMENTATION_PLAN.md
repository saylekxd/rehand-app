## Prompt-based implementation plan: TensorFlow Lite + VisionCamera v3 + Skia (BlazePose)

### Notatki
- VisionCamera v3 obsługuje real-time frame processing; uruchomimy TFLite w frame processorze przez `react-native-fast-tflite`, z resizingiem przez `vision-camera-resize-plugin`, a rysowanie zrobimy w `@shopify/react-native-skia`.
- MediaPipe BlazePose (modele: detector + landmark full/heavy) są dostępne na licencji Apache-2.0 – brak opłat runtime.

---

[x] Etap 0 — Preflight (zamiana kamery na VisionCamera)
**Prompt**
- Zastąp `expo-camera` przez VisionCamera v3 w dev-cliencie, zachowując istniejące UI/UX. Bez ML.

**Acceptance**
- Build iOS/Android w dev-cliencie przechodzi.
- Podgląd kamery działa w obecnym `CameraSurface` i fullscreen modal.

**Akcje**
- [x] Zainstaluj: `react-native-vision-camera@^3`, `react-native-worklets-core@^1`, `@shopify/react-native-skia`, `react-native-fast-tflite`, `vision-camera-resize-plugin`.
- [x] Dodaj `.tflite` do `metro.config.js` (assetExts).
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
Brakuje wsparcia dla assetów .tflite. Trzeba rozszerzyć metro.config.js.

---

[ ] Etap 1 — Szkielet frame processora
**Prompt**
- Dodaj hook `useFrameProcessor`, który odbiera klatki (30 FPS), jeszcze bez ML. Loguj rozmiar i ogranicz do ~15 FPS w fullscreen.

**Acceptance**
- W logach widać dane klatek; FPS stabilny; brak jank.

**Akcje**
- Utwórz `frameProcessors/poseProcessor.ts` z no-op procesorem.
- Podepnij do `Camera` z `frameProcessorFps={15}` (fullscreen), `10` (inline).

---

[ ] Etap 2 — Runtime TFLite + assety modeli
**Prompt**
- Zbundluj modele BlazePose i wczytaj je przez `react-native-fast-tflite`. Bez inferencji.

**Acceptance**
- Modele (detector + landmark) ładują się < 150 ms każdy; pamięć stabilna.

**Akcje**
- Umieść w `assets/models/`:
  - `pose_detection.tflite` (detector)
  - `pose_landmark_full.tflite` (dokładność) lub `pose_landmark_heavy.tflite` (maks. dokładność)
- Dodaj rozszerzenie `tflite` do `metro.config.js` (`assetExts`).
- Lazy load w hooku `hooks/useBlazePose.ts`.

---

[ ] Etap 3 — Preprocessing (resize plugin)
**Prompt**
- Użyj `vision-camera-resize-plugin` do konwersji YUV→RGB i resize do wejść modeli (np. 192×192 dla detectora, 256×256 dla landmarków). Normalizuj do zakresu zgodnego z modelem.

**Acceptance**
- Detector < 6 ms/klatkę na nowoczesnych urządzeniach; landmark 12–18 ms/klatkę.

**Akcje**
- W worklecie wywołuj plugin (GPU), buduj `TypedArray` dla TFLite.
- Uruchamiaj detector co N klatek (np. 6); ROI z detectora używaj do cropu w landmarkach na każdej klatce.

---

[ ] Etap 4 — Pipeline BlazePose (detector + tracker)
**Prompt**
- Zaimplementuj pętlę detector-tracker: detector okresowo; landmarks każdą klatkę na śledzonym ROI; wynik: 33 keypointy + visibility + z.

**Acceptance**
- Strumień punktów ≥ 15 FPS (fullscreen) na średnich/wysokich urządzeniach.
- Stabilne śledzenie osoby bez częstych re-detekcji.

**Akcje**
- Wygładzanie EMA 3–5 ostatnich klatek.
- Zwracaj współrzędne znormalizowane [0..1] względem widoku kamery i ROI.

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

[ ] Etap 6 — Prymitywy ćwiczeń (rule engine)
**Prompt**
- Dodaj warstwę reguł do liczenia kątów i powtórzeń dla 1–2 ruchów (np. biceps curl, squat). Emituj podpowiedzi do `LiveFeedbackOverlay`.

**Acceptance**
- Na żywo pojawiają się wskazówki „tempo”, „zakres”, „postawa”; repy liczone poprawnie z debouncingiem.

**Akcje**
- `services/poseMath.ts` (kąty, wygładzanie, wykrywanie faz).
- `services/exercises/*.ts` (progi kątów, przejścia fazowe dla ćwiczeń).

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
- `react-native-fast-tflite` (najnowsza)
- `vision-camera-resize-plugin` (najnowsza)
- `@shopify/react-native-skia` (najnowsza)

## Modele
- MediaPipe BlazePose: `pose_detection.tflite` + `pose_landmark_full.tflite` (lub `heavy.tflite`).
- Licencja: Apache-2.0 (free, komercyjnie przyjazna).

---

## Pierwszy krok do wdrożenia
- Podmiana `expo-camera` → VisionCamera + no‑op frame processor, green build w dev‑cliencie, a potem włączanie TFLite.


