import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, {
  Line,
  Circle,
  Path,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polygon
} from 'react-native-svg';
import { 
  OverlayState,
  AngleVisualization,
  QualityIndicator,
  MovementGuide,
  ErrorHighlight,
  Point3D,
  OverlayPreferences
} from './types';

interface OverlayRendererProps {
  overlayState: OverlayState;
  preferences: OverlayPreferences;
  screenDimensions?: { width: number; height: number };
  onElementPress?: (elementId: string, elementType: string) => void;
}

export const OverlayRenderer: React.FC<OverlayRendererProps> = ({
  overlayState,
  preferences,
  screenDimensions,
  onElementPress
}) => {
  const { width, height } = screenDimensions || Dimensions.get('window');
  const animatedValues = useRef(new Map<string, Animated.Value>()).current;

  // Initialize animated values for elements that need animation
  useEffect(() => {
    [...overlayState.angles, ...overlayState.errorHighlights].forEach((element, index) => {
      const key = `${element.joint || element.errorType}_${index}`;
      if (!animatedValues.has(key)) {
        animatedValues.set(key, new Animated.Value(0));
      }
    });
  }, [overlayState, animatedValues]);

  // Start animations for elements that need them
  useEffect(() => {
    overlayState.angles.forEach((angle, index) => {
      if (angle.visualStyle.animation === 'pulse' || angle.visualStyle.animation === 'warning') {
        const key = `${angle.joint}_${index}`;
        const animatedValue = animatedValues.get(key);
        if (animatedValue) {
          startPulseAnimation(animatedValue);
        }
      }
    });

    overlayState.errorHighlights.forEach((error, index) => {
      const key = `${error.errorType}_${index}`;
      const animatedValue = animatedValues.get(key);
      if (animatedValue) {
        if (error.visualization.animation === 'warning') {
          startWarningAnimation(animatedValue);
        } else if (error.visualization.animation === 'urgent') {
          startUrgentAnimation(animatedValue);
        }
      }
    });
  }, [overlayState, animatedValues]);

  const startPulseAnimation = (animatedValue: Animated.Value) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startWarningAnimation = (animatedValue: Animated.Value) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startUrgentAnimation = (animatedValue: Animated.Value) => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      })
    ).start();
  };

  const renderAngleVisualization = (angle: AngleVisualization, index: number) => {
    const key = `angle_${angle.joint}_${index}`;
    const animatedValue = animatedValues.get(`${angle.joint}_${index}`);
    
    // Calculate arc path for angle visualization
    const arcPath = createAngleArc(
      angle.centerPoint,
      angle.startVector,
      angle.endVector,
      30 // radius
    );

    const opacity = preferences.animationLevel !== 'none' && animatedValue
      ? animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [angle.visualStyle.opacity * 0.6, angle.visualStyle.opacity]
        })
      : angle.visualStyle.opacity;

    return (
      <G key={key}>
        {/* Angle arc */}
        <Path
          d={arcPath}
          stroke={angle.visualStyle.color}
          strokeWidth={angle.visualStyle.thickness}
          strokeOpacity={opacity}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Center point */}
        <Circle
          cx={angle.centerPoint.x}
          cy={angle.centerPoint.y}
          r={4}
          fill={angle.visualStyle.color}
          fillOpacity={opacity * 0.8}
        />

        {/* Angle value text */}
        {preferences.showValues && (
          <SvgText
            x={angle.centerPoint.x + 35}
            y={angle.centerPoint.y - 10}
            fontSize="12"
            fill={angle.visualStyle.color}
            fillOpacity={opacity}
            textAnchor="start"
          >
            {Math.round(angle.angle)}°
          </SvgText>
        )}

        {/* Joint label */}
        {preferences.showLabels && (
          <SvgText
            x={angle.centerPoint.x + 35}
            y={angle.centerPoint.y + 5}
            fontSize="10"
            fill={angle.visualStyle.color}
            fillOpacity={opacity * 0.8}
            textAnchor="start"
          >
            {angle.joint.replace('_', ' ')}
          </SvgText>
        )}
      </G>
    );
  };

  const renderQualityIndicator = (indicator: QualityIndicator, index: number) => {
    const key = `quality_${indicator.type}_${index}`;
    const radius = indicator.size / 2;
    
    // Quality ring segments
    const segments = 5;
    const segmentAngle = (2 * Math.PI) / segments;
    const filledSegments = Math.ceil((indicator.score / 100) * segments);

    return (
      <G key={key}>
        {/* Background circle */}
        <Circle
          cx={indicator.position.x}
          cy={indicator.position.y}
          r={radius}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth="3"
          strokeOpacity="0.3"
        />

        {/* Quality segments */}
        {Array.from({ length: segments }, (_, i) => {
          const startAngle = i * segmentAngle - Math.PI / 2;
          const endAngle = (i + 1) * segmentAngle - Math.PI / 2;
          const isFilled = i < filledSegments;
          
          const x1 = indicator.position.x + (radius - 5) * Math.cos(startAngle);
          const y1 = indicator.position.y + (radius - 5) * Math.sin(startAngle);
          const x2 = indicator.position.x + (radius - 5) * Math.cos(endAngle);
          const y2 = indicator.position.y + (radius - 5) * Math.sin(endAngle);

          return (
            <Path
              key={`segment_${i}`}
              d={`M ${x1} ${y1} A ${radius - 5} ${radius - 5} 0 0 1 ${x2} ${y2}`}
              stroke={isFilled ? indicator.color : '#E0E0E0'}
              strokeWidth="3"
              strokeOpacity={isFilled ? 0.9 : 0.2}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}

        {/* Center score text */}
        <SvgText
          x={indicator.position.x}
          y={indicator.position.y + 2}
          fontSize="11"
          fill={indicator.color}
          fillOpacity="0.9"
          textAnchor="middle"
          fontWeight="bold"
        >
          {Math.round(indicator.score)}
        </SvgText>

        {/* Label */}
        {preferences.showLabels && indicator.label && (
          <SvgText
            x={indicator.position.x}
            y={indicator.position.y + radius + 15}
            fontSize="9"
            fill={indicator.color}
            fillOpacity="0.7"
            textAnchor="middle"
          >
            {indicator.label}
          </SvgText>
        )}
      </G>
    );
  };

  const renderMovementGuide = (guide: MovementGuide, index: number) => {
    const key = `guide_${guide.type}_${index}`;
    
    switch (guide.type) {
      case 'ideal-path':
        return (
          <G key={key}>
            <Line
              x1={guide.from.x}
              y1={guide.from.y}
              x2={guide.to.x}
              y2={guide.to.y}
              stroke={guide.style.color}
              strokeWidth={guide.style.thickness}
              strokeOpacity={guide.style.opacity}
              strokeDasharray={guide.style.dashPattern?.join(' ')}
            />
            
            {/* Arrow head */}
            <Polygon
              points={createArrowHead(guide.to, guide.from, 8)}
              fill={guide.style.color}
              fillOpacity={guide.style.opacity}
            />
          </G>
        );

      case 'correction-hint':
        return (
          <G key={key}>
            <Line
              x1={guide.from.x}
              y1={guide.from.y}
              x2={guide.to.x}
              y2={guide.to.y}
              stroke={guide.style.color}
              strokeWidth={guide.style.thickness + 1}
              strokeOpacity={guide.style.opacity}
              strokeLinecap="round"
            />
            
            {preferences.showLabels && guide.label && (
              <SvgText
                x={(guide.from.x + guide.to.x) / 2}
                y={(guide.from.y + guide.to.y) / 2 - 10}
                fontSize="10"
                fill={guide.style.color}
                fillOpacity={guide.style.opacity * 0.9}
                textAnchor="middle"
              >
                {guide.label}
              </SvgText>
            )}
          </G>
        );

      case 'range-indicator':
        return (
          <G key={key}>
            <Circle
              cx={(guide.from.x + guide.to.x) / 2}
              cy={(guide.from.y + guide.to.y) / 2}
              r={Math.abs(guide.to.y - guide.from.y) / 2}
              fill="none"
              stroke={guide.style.color}
              strokeWidth={guide.style.thickness}
              strokeOpacity={guide.style.opacity * 0.5}
              strokeDasharray="5,5"
            />
          </G>
        );

      default:
        return null;
    }
  };

  const renderErrorHighlight = (error: ErrorHighlight, index: number) => {
    const key = `error_${error.errorType}_${index}`;
    const animatedValue = animatedValues.get(key);
    
    if (!error.position) return null;

    const opacity = preferences.animationLevel !== 'none' && animatedValue
      ? animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.8]
        })
      : 0.6;

    const radius = error.severity === 'high' ? 25 : error.severity === 'medium' ? 20 : 15;

    return (
      <G key={key}>
        {/* Error highlight circle */}
        <Circle
          cx={error.position.x}
          cy={error.position.y}
          r={radius}
          fill="none"
          stroke={error.visualization.color}
          strokeWidth="3"
          strokeOpacity={opacity}
        />
        
        {/* Warning icon (simplified) */}
        <Circle
          cx={error.position.x}
          cy={error.position.y}
          r="3"
          fill={error.visualization.color}
          fillOpacity={opacity}
        />

        {/* Correction hint */}
        {preferences.showLabels && error.correctionHint && (
          <SvgText
            x={error.position.x}
            y={error.position.y + radius + 15}
            fontSize="9"
            fill={error.visualization.color}
            fillOpacity={opacity * 0.9}
            textAnchor="middle"
            maxWidth="100"
          >
            {error.correctionHint}
          </SvgText>
        )}
      </G>
    );
  };

  // Utility functions
  const createAngleArc = (center: Point3D, start: any, end: any, radius: number): string => {
    const startAngle = Math.atan2(start.y, start.x);
    const endAngle = Math.atan2(end.y, end.x);
    
    const startX = center.x + radius * Math.cos(startAngle);
    const startY = center.y + radius * Math.sin(startAngle);
    const endX = center.x + radius * Math.cos(endAngle);
    const endY = center.y + radius * Math.sin(endAngle);
    
    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  const createArrowHead = (to: Point3D, from: Point3D, size: number): string => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const x1 = to.x - size * Math.cos(angle - Math.PI / 6);
    const y1 = to.y - size * Math.sin(angle - Math.PI / 6);
    const x2 = to.x - size * Math.cos(angle + Math.PI / 6);
    const y2 = to.y - size * Math.sin(angle + Math.PI / 6);
    
    return `${to.x},${to.y} ${x1},${y1} ${x2},${y2}`;
  };

  if (preferences.autoHide && overlayState.angles.length === 0 && 
      overlayState.qualityIndicators.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { opacity: preferences.opacity }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#F44336" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#FF9800" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#4CAF50" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Render all overlay elements based on preferences */}
        {preferences.detailLevel !== 'minimal' && overlayState.angles.map(renderAngleVisualization)}
        {overlayState.qualityIndicators.map(renderQualityIndicator)}
        {preferences.detailLevel === 'detailed' && overlayState.movementGuides.map(renderMovementGuide)}
        {overlayState.errorHighlights.map(renderErrorHighlight)}

        {/* Debug information */}
        {preferences.colorScheme === 'default' && overlayState.performance && (
          <SvgText
            x="10"
            y="30"
            fontSize="10"
            fill="#666"
            fillOpacity="0.7"
          >
            FPS: {overlayState.performance.renderFPS} | Elements: {
              overlayState.angles.length + overlayState.qualityIndicators.length + 
              overlayState.movementGuides.length + overlayState.errorHighlights.length
            }
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
