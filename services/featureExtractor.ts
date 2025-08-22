import { KeyPoint, FeatureFrame } from '../types/ai';

export class FeatureExtractor {
  private readonly SMOOTHING_FACTOR = 0.3;
  private previousAngles: Record<string, number> = {};
  private angleHistory: Record<string, number[]> = {};
  
  /**
   * Oblicza kąt między trzema punktami (joint1-joint2-joint3)
   */
  private calculateAngle(point1: KeyPoint, point2: KeyPoint, point3: KeyPoint): number {
    const vector1 = {
      x: point1.position.x - point2.position.x,
      y: point1.position.y - point2.position.y
    };
    
    const vector2 = {
      x: point3.position.x - point2.position.x,
      y: point3.position.y - point2.position.y
    };
    
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    
    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    const angleInRadians = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    
    return (angleInRadians * 180) / Math.PI;
  }

  /**
   * Znajduje keypoint po nazwie
   */
  private findKeyPoint(keyPoints: KeyPoint[], name: string): KeyPoint | null {
    return keyPoints.find(point => point.name.toLowerCase().includes(name.toLowerCase())) || null;
  }

  /**
   * Oblicza kąty dla kluczowych stawów
   */
  calculateJointAngles(keyPoints: KeyPoint[]): Record<string, number> {
    const angles: Record<string, number> = {};
    
    // Szyja - kąt między głową a tułowiem
    const head = this.findKeyPoint(keyPoints, 'head');
    const neck = this.findKeyPoint(keyPoints, 'neck');
    const spine = this.findKeyPoint(keyPoints, 'spine') || this.findKeyPoint(keyPoints, 'shoulder');
    
    if (head && neck && spine) {
      angles.neckFlexion = this.calculateAngle(head, neck, spine);
    }
    
    // Ramię - abdukcja ramienia
    const shoulderLeft = this.findKeyPoint(keyPoints, 'shoulder_left') || this.findKeyPoint(keyPoints, 'left_shoulder');
    const elbowLeft = this.findKeyPoint(keyPoints, 'elbow_left') || this.findKeyPoint(keyPoints, 'left_elbow');
    const spineCenter = this.findKeyPoint(keyPoints, 'spine_chest') || neck;
    
    if (shoulderLeft && elbowLeft && spineCenter) {
      angles.leftShoulderAbduction = this.calculateAngle(spineCenter, shoulderLeft, elbowLeft);
    }
    
    // Ramię prawe - abdukcja ramienia
    const shoulderRight = this.findKeyPoint(keyPoints, 'shoulder_right') || this.findKeyPoint(keyPoints, 'right_shoulder');
    const elbowRight = this.findKeyPoint(keyPoints, 'elbow_right') || this.findKeyPoint(keyPoints, 'right_elbow');
    
    if (shoulderRight && elbowRight && spineCenter) {
      angles.rightShoulderAbduction = this.calculateAngle(spineCenter, shoulderRight, elbowRight);
    }
    
    // Kolano - zginanie kolana
    const hipLeft = this.findKeyPoint(keyPoints, 'hip_left') || this.findKeyPoint(keyPoints, 'left_hip');
    const kneeLeft = this.findKeyPoint(keyPoints, 'knee_left') || this.findKeyPoint(keyPoints, 'left_knee');
    const ankleLeft = this.findKeyPoint(keyPoints, 'ankle_left') || this.findKeyPoint(keyPoints, 'left_ankle');
    
    if (hipLeft && kneeLeft && ankleLeft) {
      angles.leftKneeFlexion = this.calculateAngle(hipLeft, kneeLeft, ankleLeft);
    }
    
    // Kolano prawe
    const hipRight = this.findKeyPoint(keyPoints, 'hip_right') || this.findKeyPoint(keyPoints, 'right_hip');
    const kneeRight = this.findKeyPoint(keyPoints, 'knee_right') || this.findKeyPoint(keyPoints, 'right_knee');
    const ankleRight = this.findKeyPoint(keyPoints, 'ankle_right') || this.findKeyPoint(keyPoints, 'right_ankle');
    
    if (hipRight && kneeRight && ankleRight) {
      angles.rightKneeFlexion = this.calculateAngle(hipRight, kneeRight, ankleRight);
    }
    
    // Wygładzanie kątów z poprzednią klatką
    for (const [joint, angle] of Object.entries(angles)) {
      if (this.previousAngles[joint] !== undefined) {
        angles[joint] = this.previousAngles[joint] * this.SMOOTHING_FACTOR + 
                       angle * (1 - this.SMOOTHING_FACTOR);
      }
      this.previousAngles[joint] = angles[joint];
    }
    
    return angles;
  }

  /**
   * Oblicza zakres ruchu (ROM) dla danego stawu
   */
  calculateROM(angleHistory: number[], joint: string): number {
    if (angleHistory.length < 2) return 0;
    
    const min = Math.min(...angleHistory);
    const max = Math.max(...angleHistory);
    
    return max - min;
  }

  /**
   * Wykrywa asymetrię między lewą a prawą stroną
   */
  detectSymmetry(angles: Record<string, number>): number {
    const symmetryPairs = [
      ['leftShoulderAbduction', 'rightShoulderAbduction'],
      ['leftKneeFlexion', 'rightKneeFlexion']
    ];
    
    let totalSymmetryScore = 0;
    let validPairs = 0;
    
    for (const [leftAngle, rightAngle] of symmetryPairs) {
      if (angles[leftAngle] !== undefined && angles[rightAngle] !== undefined) {
        const difference = Math.abs(angles[leftAngle] - angles[rightAngle]);
        const asymmetryScore = Math.max(0, 100 - (difference * 2)); // Im większa różnica, tym niższy score
        totalSymmetryScore += asymmetryScore;
        validPairs++;
      }
    }
    
    return validPairs > 0 ? totalSymmetryScore / validPairs : 100;
  }

  /**
   * Wykrywa powtórzenie ćwiczenia na podstawie kluczowego kąta
   */
  detectRepetition(currentAngles: Record<string, number>, exerciseType: string): boolean {
    const keyAngle = this.getKeyAngleForExercise(exerciseType);
    if (!currentAngles[keyAngle]) return false;
    
    // Dodaj aktualny kąt do historii
    if (!this.angleHistory[keyAngle]) {
      this.angleHistory[keyAngle] = [];
    }
    this.angleHistory[keyAngle].push(currentAngles[keyAngle]);
    
    // Zachowaj tylko ostatnie 60 pomiarów (2 sekundy przy 30fps)
    if (this.angleHistory[keyAngle].length > 60) {
      this.angleHistory[keyAngle] = this.angleHistory[keyAngle].slice(-60);
    }
    
    // Sprawdź czy mamy cykl (minimum-maksimum-minimum)
    const recent = this.angleHistory[keyAngle].slice(-30);
    if (recent.length < 20) return false;
    
    const firstHalf = recent.slice(0, 10);
    const secondHalf = recent.slice(-10);
    const middle = recent.slice(5, 15);
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgLast = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const avgMiddle = middle.reduce((a, b) => a + b, 0) / middle.length;
    
    // Wykryj cykl: start podobny do końca, środek różny
    const startEndSimilarity = Math.abs(avgFirst - avgLast) < 15;
    const middleDifference = Math.abs(avgMiddle - avgFirst) > 20;
    
    return startEndSimilarity && middleDifference;
  }

  /**
   * Zwraca kluczowy kąt dla danego typu ćwiczenia
   */
  private getKeyAngleForExercise(exerciseType: string): string {
    const keyAngles: Record<string, string> = {
      'neck_stretch': 'neckFlexion',
      'shoulder_raise': 'leftShoulderAbduction',
      'arm_raise': 'leftShoulderAbduction',
      'squat': 'leftKneeFlexion',
      'lunge': 'leftKneeFlexion'
    };
    
    return keyAngles[exerciseType] || 'neckFlexion';
  }

  /**
   * Oblicza jakość ruchu na podstawie kątów i docelowych wartości
   */
  calculateMovementQuality(angles: Record<string, number>, exerciseType: string): number {
    const config = this.getExerciseConfig(exerciseType);
    let totalScore = 0;
    let validAngles = 0;
    
    for (const angleName of config.angleIndicators) {
      if (angles[angleName] !== undefined && config.idealAngles[angleName]) {
        const currentAngle = angles[angleName];
        const ideal = config.idealAngles[angleName];
        
        // Sprawdź czy kąt jest w idealnym zakresie
        if (currentAngle >= ideal.min && currentAngle <= ideal.max) {
          totalScore += 100;
        } else {
          // Oblicz odległość od idealnego zakresu
          const distanceFromIdeal = currentAngle < ideal.min 
            ? ideal.min - currentAngle 
            : currentAngle - ideal.max;
          
          // Score maleje z odległością (max 50 punktów odliczenia)
          const penalty = Math.min(50, distanceFromIdeal);
          totalScore += Math.max(50, 100 - penalty);
        }
        validAngles++;
      }
    }
    
    return validAngles > 0 ? totalScore / validAngles : 75;
  }

  /**
   * Zwraca konfigurację dla danego typu ćwiczenia
   */
  private getExerciseConfig(exerciseType: string) {
    const configs = {
      'neck_stretch': {
        angleIndicators: ['neckFlexion'],
        idealAngles: {
          neckFlexion: { min: 20, max: 60 }
        }
      },
      'shoulder_raise': {
        angleIndicators: ['leftShoulderAbduction', 'rightShoulderAbduction'],
        idealAngles: {
          leftShoulderAbduction: { min: 30, max: 90 },
          rightShoulderAbduction: { min: 30, max: 90 }
        }
      }
    };
    
    return configs[exerciseType as keyof typeof configs] || configs['neck_stretch'];
  }

  /**
   * Główna metoda do ekstrakcji cech z keypoints
   */
  extractFeatures(keyPoints: KeyPoint[], exerciseType: string): FeatureFrame {
    const timestamp = Date.now();
    const jointAngles = this.calculateJointAngles(keyPoints);
    const symmetryScore = this.detectSymmetry(jointAngles);
    
    // Oblicz zakresy ruchu dla wszystkich stawów
    const rangeOfMotion: Record<string, number> = {};
    for (const [joint, angle] of Object.entries(jointAngles)) {
      if (!this.angleHistory[joint]) {
        this.angleHistory[joint] = [];
      }
      this.angleHistory[joint].push(angle);
      
      // Zachowaj historię ostatnich 300 pomiarów (10 sekund przy 30fps)
      if (this.angleHistory[joint].length > 300) {
        this.angleHistory[joint] = this.angleHistory[joint].slice(-300);
      }
      
      rangeOfMotion[joint] = this.calculateROM(this.angleHistory[joint], joint);
    }
    
    // Oblicz prędkości ruchu (różnica między klatkami)
    const velocities: number[] = [];
    for (const [joint, angle] of Object.entries(jointAngles)) {
      if (this.previousAngles[joint] !== undefined) {
        velocities.push(Math.abs(angle - this.previousAngles[joint]));
      }
    }
    
    return {
      jointAngles,
      velocities,
      rangeOfMotion,
      symmetryScore,
      timestamp
    };
  }

  /**
   * Reset historii dla nowej sesji
   */
  resetSession() {
    this.previousAngles = {};
    this.angleHistory = {};
  }
}

export const featureExtractor = new FeatureExtractor();