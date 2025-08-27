## Prompt-based implementation plan: expo-pose-landmarks + VisionCamera v3 + Skia

### Notatki
- VisionCamera v3 obsługuje real-time frame processing; wykorzystamy plugin `expo-pose-landmarks`, który udostępnia worklet API do pozyskania 33 landmarków pozy (z visibility i opcjonalnym score). Overlay narysujemy w `@shopify/react-native-skia`.
- Z `expo-pose-landmarks` nie bundlujemy własnych modeli `.tflite`, nie potrzebujemy `react-native-fast-tflite` ani `vision-camera-resize-plugin`.

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
[x] Usuń `expo-camera` z zależności po migracji, żeby uniknąć dublowania i pomyłek w importach.
[x] Brak potrzeby dodawania wsparcia dla assetów `.tflite` w `metro.config.js` (modele nie są bundlowane ręcznie).

---

[ ] Etap 1 — Instalacja i szkielet pluginu `expo-pose-landmarks`
**Prompt**
- Dodaj `expo-pose-landmarks` i podstawową integrację z `useFrameProcessor`. W wersji szkieletowej tylko wywołuj landmarker i loguj liczbę wykrytych punktów; ogranicz do ~15 FPS w fullscreen.

**Acceptance**
- Plugin inicjalizuje się poprawnie; w logach widać liczbę landmarków; FPS stabilny, brak jank.

**Akcje**
- [ ] Zainstaluj `expo-pose-landmarks` i dodaj do `app.json` w sekcji `plugins`.
- [ ] Zaktualizuj `frameProcessors/poseProcessor.ts` tak, by wywoływał worklet landmarkera z pluginu i zwracał wynik do JS (np. przez `useSharedValue` lub `runOnJS`).
- [ ] Podepnij do `Camera` przez `useFrameProcessor`.
- [ ] Przebuduj dev client po dodaniu pluginu (`expo run:ios` / `expo run:android`).

---

[ ] Etap 2 — Konfiguracja pluginu i API danych
**Prompt**
- Skonfiguruj opcje `expo-pose-landmarks` (np. tryb szybki vs dokładny, liczba osób – jeśli wspierane) i wystandaryzuj kształt danych landmarków (33 punkty, visibility, z) do dalszego przetwarzania.

**Acceptance**
- Dane landmarków są dostępne w JS jako aktualna wartość i zawierają spójne pola; pamięć stabilna.

**Akcje**
- Zapewnij bezpieczne przekazanie wyników z workletu do JS (np. throttling co N klatek, debouncing, kontrola `isActive`).
- Ustal i udokumentuj typ `PoseLandmarks` w `components/ai/types.ts`.

---

[ ] Etap 3 — Harmonogram i throttling detekcji
**Prompt**
- Zaimplementuj harmonogram wywołań landmarkera (co klatkę lub co N klatek zależnie od wydajności) oraz throttling przekazywania danych do JS, by utrzymać ≥ 15 FPS w fullscreen.

**Acceptance**
- Stabilny strumień landmarków bez dropów UI; CPU/GPU w normie na docelowych urządzeniach.

**Akcje**
- Dodaj licznik klatek w worklecie i kontrolę częstotliwości publikacji wyników.
- Zaimplementuj opcjonalne wyłączanie przetwarzania przy `isActive=false`/gdy ekran niewidoczny.

---

[ ] Etap 4 — Wygładzanie i normalizacja
**Prompt**
- Dodaj wygładzanie (EMA/median) 3–5 ostatnich klatek i normalizację współrzędnych do [0..1] względem widoku kamery, z obsługą lustrzanego odbicia dla przedniej kamery.

**Acceptance**
- Strumień punktów ≥ 15 FPS (fullscreen) na średnich/wysokich urządzeniach; widocznie stabilniejsze punkty.

**Akcje**
- Implementuj EMA/median filter i progi visibility.
- Zachowaj indeksację 33 punktów kompatybilną z MediaPipe.

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
- Dodaj przełączniki: mirror dla przedniej kamery, throttling jakości; fallback: wyłącz przetwarzanie na symulatorze/urządzeniach bez wsparcia pluginu. Obsłuż pauzę kamery przy backgroundingu.

**Acceptance**
- Przełączniki działają i się zapamiętują; app stabilna po background/foreground; brak crashy.

**Akcje**
- Małe ustawienia w aplikacji, persist w storage.
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
- `expo-pose-landmarks` (najnowsza)
- `@shopify/react-native-skia` (najnowsza)

## Modele
- Brak ręcznego bundlowania modeli `.tflite` — używamy `expo-pose-landmarks`.

---

## Pierwszy krok do wdrożenia
- Podmiana `expo-camera` → VisionCamera + integracja `expo-pose-landmarks` (szkielet), green build w dev‑cliencie, a potem overlay w Skia.


