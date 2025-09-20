# Przewodnik po współrzędnych MediaPipe dla ćwiczeń

## 🎯 System współrzędnych MediaPipe

### Osie współrzędnych:
- **X**: Wysokość na ekranie
  - `0.0` = **TOP** (górna krawędź)
  - `1.0` = **BOTTOM** (dolna krawędź)
  - **Mniejszy X = wyżej**, **większy X = niżej**

- **Y**: Pozycja pozioma na ekranie  
  - `0.0` = **LEFT** (lewa krawędź)
  - `1.0` = **RIGHT** (prawa krawędź)

- **Z**: Głębokość (względem kamery)
  - Wartości ujemne = bliżej kamery
  - Wartości dodatnie = dalej od kamery

### 📱 Mirror Effect (przednia kamera):

W **przedniej kamerze** wszystko jest odbite lustrzanie:
- **Fizyczna prawa ręka** → `LEFT_WRIST` w danych MediaPipe
- **Fizyczna lewa ręka** → `RIGHT_WRIST` w danych MediaPipe
- **Fizyczne prawe ramię** → `LEFT_SHOULDER` w danych MediaPipe

W **tylnej kamerze** nie ma mirroring:
- **Fizyczna prawa ręka** → `RIGHT_WRIST` w danych MediaPipe

## 🏃‍♂️ Przykłady z praktyki

### Typowe pozycje (przednia kamera):

```javascript
// Osoba stoi prosto, ręce opuszczone:
nose: { x: 0.45, y: 0.50 }          // nos w środku ekranu
left_shoulder: { x: 0.35, y: 0.40 } // fizyczne prawe ramię
right_shoulder: { x: 0.35, y: 0.60 } // fizyczne lewe ramię
left_wrist: { x: 0.60, y: 0.35 }    // fizyczna prawa ręka (opuszczona)
right_wrist: { x: 0.60, y: 0.65 }   // fizyczna lewa ręka (opuszczona)

// Osoba podnosi fizyczną prawą rękę nad głowę:
left_wrist: { x: 0.05, y: 0.40 }    // fizyczna prawa ręka (nad głową!)
```

### Walidacje "wysokości":

```typescript
// ✅ POPRAWNE - sprawdzanie czy ręka jest nad głową:
wrist.x < nose.x && wrist.x <= 0.4  // ręka wyżej niż nos i wyżej niż próg

// ❌ BŁĘDNE - nie używaj Y dla wysokości:
wrist.y < nose.y  // to sprawdza pozycję poziomą, nie wysokość!
```

## 🎨 Constraints dla ćwiczeń

### 1. **Ręka nad głową** (prawe ramię):
```json
{
  "rightArmRaised": {
    "minHeightX": 0.4,
    "isFrontCamera": true
  }
}
```

### 2. **Ręce na wysokości ramion**:
```json
{
  "wristsAtShoulderHeight": {
    "toleranceX": 0.1
  }
}
```

### 3. **Ręce podniesione** (oba ramiona):
```json
{
  "armsRaised": {
    "minShoulderHeightX": 0.35
  }
}
```

### 4. **Prosta postawa**:
```json
{
  "uprightTorso": {
    "maxLeanDeg": 15
  }
}
```

## 🔧 Funkcje walidacji

### Szablon funkcji:
```typescript
export function validateConstraint(
  pose: Pose, 
  constraintType: string, 
  params: any, 
  isFrontCamera: boolean = true
): boolean {
  // Zawsze przekazuj isFrontCamera dla prawidłowego landmark selection
}
```

### Przykład implementacji:
```typescript
function validateRightArmRaised(pose: Pose, minHeightX: number, isFrontCamera: boolean): boolean {
  // Mirror effect: w przedniej kamerze fizyczna prawa ręka = LEFT_WRIST
  const wristLandmark = isFrontCamera ? 
    getLandmark(pose, POSE_LANDMARKS.LEFT_WRIST) :
    getLandmark(pose, POSE_LANDMARKS.RIGHT_WRIST);
    
  const nose = getLandmark(pose, POSE_LANDMARKS.NOSE);
  
  // X axis: mniejsze wartości = wyżej
  return wristLandmark.x <= minHeightX && wristLandmark.x < nose.x;
}
```

## 📊 Typowe progi (na podstawie testów):

| Pozycja | Próg X | Opis |
|---------|--------|------|
| **Bardzo wysoko** | `0.1 - 0.2` | Nad głową, ręka w górze |
| **Wysoko** | `0.3 - 0.4` | Na wysokości czoła/nosa |
| **Ramiona** | `0.35 - 0.45` | Wysokość ramion |
| **Klatka piersiowa** | `0.5 - 0.6` | Środek torsu |
| **Biodra** | `0.7 - 0.8` | Dolna część torsu |
| **Nisko** | `0.9 - 1.0` | Przy nogach |

## ⚠️ Ważne zasady:

1. **Zawsze sprawdzaj visibility** - landmarki z conf < 0.5 są niepewne
2. **Używaj tolerancji** - nigdy nie porównuj exact equality
3. **Testuj na prawdziwych użytkownikach** - progi mogą się różnić
4. **Uwzględniaj mirror effect** w przedniej kamerze
5. **X to wysokość, Y to poziom** - nie pomyl osi!

## 🧪 Testowanie nowych ćwiczeń:

1. Dodaj dużo debug logów podczas implementacji
2. Przetestuj wszystkie edge cases (różne pozycje)
3. Sprawdź oba kierunki kamery (front/back)
4. Użyj rozsądnych progów tolerancji
5. Zawsze loguj `landmarkUsed` żeby wiedzieć które dane używasz

## Przykład debug loga:
```javascript
console.log('[Debug] Validation:', {
  wristX: wrist.x.toFixed(3),
  noseX: nose.x.toFixed(3), 
  threshold: minHeightX,
  isAboveNose: wrist.x < nose.x,
  isAboveThreshold: wrist.x <= minHeightX,
  result: wrist.x <= minHeightX && wrist.x < nose.x,
  landmarkUsed: isFrontCamera ? 'LEFT_WRIST (mirrored)' : 'RIGHT_WRIST'
});
```

---

## ⏱️ **Kontrola czasu w ćwiczeniach**

### **Dwa sposoby kontroli czasu:**

#### **1. `minStableFrames` (dla `holdPosture`):**
- **Elastyczny** - liczy tylko gdy pozycja jest poprawna
- **Przerywalny** - resetuje się gdy użytkownik się ruszy
- **Lepszy dla precyzyjnych pozycji**

```json
{
  "type": "holdPosture",
  "minStableFrames": 25,  // ~5 sekund @ 5 FPS walidacji
  "constraints": { /* pozycja do utrzymania */ }
}
```

#### **2. `durationMs` (dla `timeWindow`):**
- **Sztywny** - zawsze trwa określony czas
- **Nieprzerywalny** - nie zatrzymuje się przy błędach
- **Lepszy dla ruchów/ćwiczeń dynamicznych**

```json
{
  "type": "timeWindow",
  "durationMs": 10000,    // dokładnie 10 sekund
  "constraints": { /* warunki do utrzymania podczas ruchu */ }
}
```

### ⏰ **Tabela konwersji czasu:**

| `minStableFrames` | Czas rzeczywisty | Zastosowanie |
|------------------|------------------|--------------|
| `10` | ~2 sekundy | Szybkie pozycje, testy |
| `15` | ~3 sekundy | Krótkie utrzymanie |
| `25` | ~5 sekund | Standardowe pozycje |
| `50` | ~10 sekund | Trudne pozycje, równowaga |
| `75` | ~15 sekund | Bardzo trudne pozycje |

| `durationMs` | Zastosowanie | Przykład |
|-------------|--------------|----------|
| `3000` | Krótkie ruchy | Dotknij nosa i wróć |
| `5000` | Normalne ruchy | Kółka ramionami |
| `10000` | Średnie ćwiczenia | Pompki, pajacyki |
| `30000` | Długie ćwiczenia | Plank, wydrzymałość |
| `60000` | Bardzo długie | Medytacja, stretching |

### 🔄 **Kombianacja obu metod (sekwencja):**

```json
{
  "version": 1,
  "steps": [
    {
      "type": "holdPosture",
      "hint": "Podnieś lewą rękę nad głowę",
      "success": "Świetnie! Utrzymaj pozycję",
      "minStableFrames": 15,  // Szybkie osiągnięcie pozycji
      "constraints": { "leftArmRaised": { "minHeightX": 0.4 } }
    },
    {
      "type": "timeWindow", 
      "hint": "Trzymaj lewą rękę w górze przez 10 sekund",
      "success": "Doskonale! Opuść rękę",
      "durationMs": 10000,   // Dokładny czas utrzymania
      "constraints": { "leftArmRaised": { "minHeightX": 0.4 } }
    }
  ]
}
```

### 🎯 **Kiedy używać której metody:**

#### **`holdPosture` + `minStableFrames`:**
- ✅ **Precyzyjne pozycje** (dotknij nosa, ręce na ramionach)
- ✅ **Pozycje trudne do osiągnięcia** (równowaga na jednej nodze)
- ✅ **Gdy ważna jest jakość pozycji** nad czasem
- ✅ **Sprawdzanie czy użytkownik umie zrobić pozycję**

#### **`timeWindow` + `durationMs`:**
- ✅ **Ćwiczenia wytrzymałościowe** (plank, przysiady)
- ✅ **Ruchy dynamiczne** (kółka ramionami, pajacyki)
- ✅ **Gdy ważny jest czas** nad precyzją pozycji
- ✅ **Ćwiczenia kardio** i mobilność

### 🏗️ **Kompletny przykład budowania ćwiczenia:**

#### **Ćwiczenie: "Sekwencja rąk góra/dół"**

```json
{
  "version": 1,
  "steps": [
    {
      "type": "holdPosture",
      "hint": "Podnieś lewą rękę nad głowę",
      "success": "Świetnie! Utrzymaj lewą rękę w górze", 
      "minStableFrames": 25,  // ~5 sekund na osiągnięcie
      "constraints": { "leftArmRaised": { "minHeightX": 0.4 } }
    },
    {
      "type": "timeWindow",
      "hint": "Trzymaj lewą rękę w górze przez 5 sekund",
      "success": "Doskonale! Teraz opuść lewą rękę",
      "durationMs": 5000,  // dokładnie 5 sekund utrzymania
      "constraints": { "leftArmRaised": { "minHeightX": 0.4 } }
    },
    {
      "type": "holdPosture", 
      "hint": "Opuść lewą rękę poniżej bioder",
      "success": "Dobrze! Teraz prawa ręka",
      "minStableFrames": 15,  // ~3 sekundy na osiągnięcie
      "constraints": { "leftArmLowered": { "maxHeightX": 0.8 } }
    },
    {
      "type": "holdPosture",
      "hint": "Podnieś prawą rękę nad głowę", 
      "success": "Świetnie! Utrzymaj prawą rękę w górze",
      "minStableFrames": 25,
      "constraints": { "rightArmRaised": { "minHeightX": 0.4 } }
    },
    {
      "type": "timeWindow",
      "hint": "Trzymaj prawą rękę w górze przez 5 sekund",
      "success": "Doskonale! Teraz opuść prawą rękę", 
      "durationMs": 5000,
      "constraints": { "rightArmRaised": { "minHeightX": 0.4 } }
    },
    {
      "type": "holdPosture",
      "hint": "Opuść prawą rękę poniżej bioder",
      "success": "Ćwiczenie ukończone! 🎉",
      "minStableFrames": 15,
      "constraints": { "rightArmLowered": { "maxHeightX": 0.8 } }
    }
  ]
}
```

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
"wristsAtShoulderHeight": { "toleranceY": 0.1 }  // ręce na poziomie ramion
"elbowsExtended": { "minAngleDeg": 150 }          // wyprostowane ręce  
"armsRaised": { "minShoulderHeightY": 0.35 }     // oba ramiona w górę
```

#### **Postawa:**
```json
"uprightTorso": { "maxLeanDeg": 10 }  // prosta postawa (max 10° nachylenia)
```

### 💡 **Tips dla tworzenia ćwiczeń:**

1. **Zacznij od `holdPosture`** żeby sprawdzić czy użytkownik umie osiągnąć pozycję
2. **Potem `timeWindow`** żeby utrzymać przez określony czas
3. **Krótkie `minStableFrames`** (10-15) dla szybkich przejść
4. **Długie `minStableFrames`** (25-50) dla trudnych pozycji
5. **`durationMs`** dla dokładnych czasów wytrzymałościowych

### 🧪 **Proces testowania:**

1. **Stwórz w bazie** z `steps_json`
2. **Uruchom z debugiem** - obserwuj logi
3. **Dostosuj progi i czasy** na podstawie rzeczywistych danych
4. **Sprawdź oba kierunki kamery** (front/back)
5. **Przetestuj z różnymi użytkownikami** (wzrost, proporcje)

---

**Używaj tej dokumentacji przy tworzeniu nowych ćwiczeń i constraints!** 🎯
