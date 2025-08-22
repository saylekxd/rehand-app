import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KeyPoint } from '../../types/ai';

interface PoseOverlayProps {
  keyPoints: KeyPoint[];
  jointAngles: Record<string, number>;
  qualityScore: number;
  frameSize: { width: number; height: number };
  exerciseType: string;
}

export const PoseOverlay: React.FC<PoseOverlayProps> = ({
  keyPoints,
  jointAngles,
  qualityScore,
  frameSize,
  exerciseType
}) => {
  
  /**
   * Konwertuje pozycję keypoint na pozycję overlay
   */
  const convertToOverlayPosition = (keyPoint: KeyPoint) => {
    const scaleX = 1; // Zakładamy że frame size = overlay size
    const scaleY = 1;
    
    return {
      x: keyPoint.position.x * scaleX,
      y: keyPoint.position.y * scaleY
    };
  };

  /**
   * Zwraca kolor dla danego kąta na podstawie jakości
   */
  const getAngleColor = (angle: number, ideal: { min: number; max: number }): string => {
    if (angle >= ideal.min && angle <= ideal.max) {
      return '#10B981'; // Zielony - idealny
    } else if (Math.abs(angle - (ideal.min + ideal.max) / 2) < 20) {
      return '#F59E0B'; // Żółty - akceptowalny
    } else {
      return '#EF4444'; // Czerwony - wymaga poprawy
    }
  };

  /**
   * Zwraca idealne zakresy dla danego ćwiczenia
   */
  const getIdealRanges = (exerciseType: string) => {
    const ranges: Record<string, Record<string, { min: number; max: number }>> = {
      'neck_stretch': {
        neckFlexion: { min: 15, max: 45 }
      },
      'shoulder_raise': {
        leftShoulderAbduction: { min: 30, max: 90 },
        rightShoulderAbduction: { min: 30, max: 90 }
      },
      'arm_raise': {
        leftShoulderAbduction: { min: 45, max: 120 },
        rightShoulderAbduction: { min: 45, max: 120 }
      }
    };
    
    return ranges[exerciseType] || ranges['neck_stretch'];
  };

  /**
   * Renderuje wskaźnik kąta dla konkretnego stawu
   */
  const renderAngleIndicator = (angleName: string, angle: number, position: { x: number; y: number }) => {
    const idealRanges = getIdealRanges(exerciseType);
    const ideal = idealRanges[angleName];
    
    if (!ideal) return null;
    
    const color = getAngleColor(angle, ideal);
    const displayName = angleName.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    return (
      <View
        key={angleName}
        style={[
          styles.angleIndicator,
          {
            left: position.x - 40,
            top: position.y - 30,
            borderColor: color,
          }
        ]}
      >
        <Text style={[styles.angleText, { color }]}>
          {Math.round(angle)}°
        </Text>
        <Text style={styles.angleLabel}>
          {displayName}
        </Text>
      </View>
    );
  };

  /**
   * Renderuje punkty kluczowe jako małe kropki
   */
  const renderKeyPoints = () => {
    return keyPoints.map((keyPoint, index) => {
      const position = convertToOverlayPosition(keyPoint);
      const opacity = keyPoint.confidence;
      
      return (
        <View
          key={`${keyPoint.name}-${index}`}
          style={[
            styles.keyPointDot,
            {
              left: position.x - 4,
              top: position.y - 4,
              opacity: opacity,
              backgroundColor: opacity > 0.7 ? '#10B981' : '#F59E0B'
            }
          ]}
        />
      );
    });
  };

  /**
   * Renderuje wskaźniki kątów dla aktualnego ćwiczenia
   */
  const renderAngleIndicators = () => {
    const indicators: JSX.Element[] = [];
    
    // Znajdź pozycje dla wskaźników kątów
    if (exerciseType === 'neck_stretch' && jointAngles.neckFlexion) {
      const neckPoint = keyPoints.find(p => p.name.toLowerCase().includes('neck'));
      if (neckPoint) {
        const position = convertToOverlayPosition(neckPoint);
        indicators.push(renderAngleIndicator('neckFlexion', jointAngles.neckFlexion, position));
      }
    }
    
    if ((exerciseType === 'shoulder_raise' || exerciseType === 'arm_raise') && jointAngles.leftShoulderAbduction) {
      const shoulderLeft = keyPoints.find(p => p.name.toLowerCase().includes('shoulder') && p.name.toLowerCase().includes('left'));
      if (shoulderLeft) {
        const position = convertToOverlayPosition(shoulderLeft);
        indicators.push(renderAngleIndicator('leftShoulderAbduction', jointAngles.leftShoulderAbduction, position));
      }
    }
    
    if ((exerciseType === 'shoulder_raise' || exerciseType === 'arm_raise') && jointAngles.rightShoulderAbduction) {
      const shoulderRight = keyPoints.find(p => p.name.toLowerCase().includes('shoulder') && p.name.toLowerCase().includes('right'));
      if (shoulderRight) {
        const position = convertToOverlayPosition(shoulderRight);
        indicators.push(renderAngleIndicator('rightShoulderAbduction', jointAngles.rightShoulderAbduction, position));
      }
    }
    
    return indicators;
  };

  return (
    <View style={styles.overlay}>
      {/* Punkty kluczowe */}
      {renderKeyPoints()}
      
      {/* Wskaźniki kątów */}
      {renderAngleIndicators()}
      
      {/* Wskaźnik jakości w prawym górnym rogu */}
      <View style={styles.qualityIndicator}>
        <Text style={styles.qualityLabel}>Jakość</Text>
        <Text style={[
          styles.qualityScore,
          { 
            color: qualityScore >= 80 ? '#10B981' : 
                   qualityScore >= 60 ? '#F59E0B' : '#EF4444'
          }
        ]}>
          {Math.round(qualityScore)}%
        </Text>
      </View>
      
      {/* Instrukcje ćwiczenia */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {getExerciseInstruction(exerciseType)}
        </Text>
      </View>
    </View>
  );
};

/**
 * Zwraca instrukcję dla danego ćwiczenia
 */
const getExerciseInstruction = (exerciseType: string): string => {
  const instructions: Record<string, string> = {
    'neck_stretch': 'Powoli pochyl głowę w przód',
    'shoulder_raise': 'Podnieś ramiona na boki',
    'arm_raise': 'Unieś ręce w górę', 
    'squat': 'Wykonaj przysiad',
    'lunge': 'Wykonaj wykrok'
  };
  
  return instructions[exerciseType] || 'Wykonuj ćwiczenie';
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  keyPointDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  angleIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 6,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  angleText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  angleLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 2,
  },
  qualityIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  qualityLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  qualityScore: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderRadius: 12,
    padding: 12,
    maxWidth: 200,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});