## 🏗️ Kompletny przykład budowania ćwiczenia

### Ćwiczenie: "Sekwencja rąk góra/dół"

```json
{
  "version": 1,
  "steps": [
    {
      "type": "holdPosture",
      "hint": "Podnieś lewą rękę nad głowę",
      "success": "Świetnie! Utrzymaj lewą rękę w górze", 
      "minStableFrames": 25,  // ~5 sekund @ 5 FPS
      "constraints": {
        "leftArmRaised": { "minHeightX": 0.4 }
      }
    },
    {
      "type": "timeWindow",
      "hint": "Trzymaj lewą rękę w górze przez 5 sekund",
      "success": "Doskonale! Teraz opuść lewą rękę",
      "durationMs": 5000,  // dokładnie 5 sekund
      "constraints": {
        "leftArmRaised": { "minHeightX": 0.4 }
      }
    },
    {
      "type": "holdPosture", 
      "hint": "Opuść lewą rękę poniżej bioder",
      "success": "Dobrze! Lewa ręka na dole",
      "minStableFrames": 15,  // ~3 sekundy @ 5 FPS
      "constraints": {
        "leftArmLowered": { "maxHeightX": 0.8 }
      }
    },
    {
      "type": "holdPosture",
      "hint": "Podnieś prawą rękę nad głowę", 
      "success": "Świetnie! Utrzymaj prawą rękę w górze",
      "minStableFrames": 25,
      "constraints": {
        "rightArmRaised": { "minHeightX": 0.4 }
      }
    },
    {
      "type": "timeWindow",
      "hint": "Trzymaj prawą rękę w górze przez 5 sekund",
      "success": "Doskonale! Teraz opuść prawą rękę", 
      "durationMs": 5000,
      "constraints": {
        "rightArmRaised": { "minHeightX": 0.4 }
      }
    },
    {
      "type": "holdPosture",
      "hint": "Opuść prawą rękę poniżej bioder",
      "success": "Ćwiczenie ukończone! 🎉",
      "minStableFrames": 15,
      "constraints": {
        "rightArmLowered": { "maxHeightX": 0.8 }
      }
    }
  ]
}
```

### 📋 **Typy kroków:**

#### **1. `holdPosture` - utrzymaj pozycję**
```json
{
  "type": "holdPosture",
  "hint": "Instrukcja dla użytkownika",
  "success": "Komunikat po sukcesie", 
  "minStableFrames": 25,  // ile klatek trzeba utrzymać (25 @ 5FPS = 5s)
  "constraints": { /* warunki pozycji */ }
}
```

#### **2. `timeWindow` - czasowe okno**
```json
{
  "type": "timeWindow",
  "hint": "Instrukcja dla użytkownika",
  "success": "Komunikat po sukcesie",
  "durationMs": 10000,    // dokładny czas w milisekundach
  "constraints": { /* warunki do utrzymania */ }
}
```

### ⏱️ **Kontrola czasu:**

| Sposób | Zastosowanie | Przykład | Czas rzeczywisty |
|--------|-------------|----------|------------------|
| `minStableFrames: 15` | Szybkie pozycje | Dotknij nosa | ~3 sekundy |
| `minStableFrames: 25` | Normalne pozycje | Ręka w górę | ~5 sekund |
| `minStableFrames: 50` | Trudne pozycje | Równowaga | ~10 sekund |
| `durationMs: 5000` | Dokładny czas | Kółka ramionami | Dokładnie 5s |
| `durationMs: 30000` | Długie ćwiczenia | Plank | Dokładnie 30s |

### 🎯 **Dostępne constraints:**

#### **Pojedyncze ręce:**
```json
"rightArmRaised": { "minHeightX": 0.4 }    // prawa ręka nad głową
"leftArmRaised": { "minHeightX": 0.4 }     // lewa ręka nad głową  
"rightArmLowered": { "maxHeightX": 0.8 }   // prawa ręka w dół
"leftArmLowered": { "maxHeightX": 0.8 }    // lewa ręka w dół
```

#### **Obie ręce:**
```json
"wristsAtShoulderHeight": { "toleranceX": 0.1 }  // ręce na wysokości barków (oś X)
"elbowsExtended": { "minAngleDeg": 150 }          // wyprostowane ręce
"armsRaised": { "minShoulderHeightX": 0.35 }     // oba ramiona wysoko (oś X)
```

#### **Postawa:**
```json
"uprightTorso": { "maxLeanDeg": 10 }  // prosta postawa (max 10° nachylenia)
```

### 🔧 **Jak dodać nowy constraint:**

1. **Dodaj funkcję walidacji** w `utils/poseUtils.ts`:
```typescript
export function validateNewConstraint(pose: Pose, threshold: number, isFrontCamera: boolean): boolean {
  // Implementacja...
  console.log('[Debug] New constraint validation:', { /* debug data */ });
  return result;
}
```

2. **Dodaj do switch** w `validateConstraint()`:
```typescript
case 'newConstraint':
  return validateNewConstraint(pose, params.threshold, isFrontCamera);
```

3. **Dodaj komunikat** w `useExerciseSession.ts`:
```typescript
const constraintMessages = {
  newConstraint: 'Komunikat dla użytkownika',
  // ...
};
```

4. **Przetestuj z debugiem** i dostosuj progi!

### 🧪 **Proces testowania nowego ćwiczenia:**

1. **Stwórz w bazie** z `steps_json`
2. **Uruchom z debugiem** - obserwuj logi
3. **Dostosuj progi** na podstawie rzeczywistych danych
4. **Sprawdź oba kierunki kamery** (front/back)
5. **Przetestuj z różnymi użytkownikami** (wzrost, proporcje)

---

**Używaj tej dokumentacji przy tworzeniu nowych ćwiczeń i constraints!** 🎯
