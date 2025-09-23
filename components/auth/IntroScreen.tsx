import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface IntroScreenProps {
  onComplete: () => void;
}

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  media: string | number; // URL to image/video or require() result for local assets
  isVideo?: boolean;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const { t } = useTranslation(['intro']);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const [mediaStates, setMediaStates] = useState<{ [key: number]: { isVideo: boolean; loading: boolean } }>({});

  // Demo slides - replace with real content
  const slides: Slide[] = [
    {
      id: 0,
      title: t('intro:slide1.title'),
      subtitle: t('intro:slide1.subtitle'),
      media: 'https://ihgfxnyppyoitmzdexic.supabase.co/storage/v1/object/public/marketing/intro-movie1.mp4', // Will auto-detect as video
    },
    {
      id: 1,
      title: t('intro:slide2.title'),
      subtitle: t('intro:slide2.subtitle'),
      media: require('@/assets/images/intro-image1.png'),
    },
    {
      id: 2,
      title: t('intro:slide3.title'),
      subtitle: t('intro:slide3.subtitle'),
      media: require('@/assets/images/into-image2.png'),
    },
  ];

  // Auto-detect if media is video or image (no delayed state updates to avoid flicker)
  useEffect(() => {
    slides.forEach((slide) => {
      if (!mediaStates[slide.id]) {
        // Simple video detection based on URL (only for string URLs, not require() objects)
        const isVideo = typeof slide.media === 'string' && (
          slide.media.includes('.mp4') || 
          slide.media.includes('.mov') || 
          slide.media.includes('.avi') ||
          slide.media.includes('video') ||
          slide.media.includes('mp4')
        );

        setMediaStates(prev => ({
          ...prev,
          [slide.id]: { isVideo, loading: false }
        }));
      }
    });
  }, []);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      Animated.timing(slideAnim, {
        toValue: -nextIndex * width,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const prevIndex = currentSlide - 1;
      setCurrentSlide(prevIndex);
      Animated.timing(slideAnim, {
        toValue: -prevIndex * width,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    Animated.timing(slideAnim, {
      toValue: -index * width,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('intro_completed', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving intro completion:', error);
      onComplete();
    }
  };

  // Create video players for all slides upfront (Rules of Hooks compliance)
  const videoPlayer0 = useVideoPlayer(
    typeof slides[0].media === 'string' ? slides[0].media : '', 
    (player) => {
      player.loop = true;
      player.muted = true;
    }
  );
  
  // slides[1] and slides[2] are images, so no video players needed
  
  const getVideoPlayer = (slideId: number) => {
    switch (slideId) {
      case 0: return videoPlayer0;
      default: return null;
    }
  };

  const renderSlide = (slide: Slide, index: number) => {
    const mediaState = mediaStates[slide.id];
    const player = mediaState?.isVideo ? getVideoPlayer(slide.id) : null;
    
    // Simple video control
    React.useEffect(() => {
      if (player) {
        if (index === currentSlide) {
          player.play();
        } else {
          player.pause();
        }
      }
    }, [currentSlide, index, player]);
    
    return (
      <View key={slide.id} style={styles.slide}>
        <View style={styles.mediaContainer}>
          {mediaState?.isVideo && player ? (
            <VideoView
              player={player}
              style={styles.media}
              contentFit="cover"
              nativeControls={false}
            />
          ) : (
            <Image
              source={typeof slide.media === 'string' ? { uri: slide.media } : slide.media}
              style={styles.media}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.darkOverlay} />
        </View>

        {/* Text Overlay */}
        <View style={styles.textOverlay}>
          <Text style={styles.slideText}>
            {index === 0 && t('intro:tagline1')}
            {index === 1 && t('intro:tagline2')}
            {index === 2 && t('intro:tagline3')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Slides Container - Fullscreen */}
      <View style={styles.slidesContainer}>
        <Animated.View 
          style={{
            flexDirection: 'row',
            height: '100%',
            width: width * slides.length,
            transform: [{ translateX: slideAnim }],
          }}
        >
          {slides.map((slide, index) => 
            renderSlide(slide, index)
          )}
        </Animated.View>
      </View>

      {/* Logo Overlay */}
      <View style={styles.logoOverlay}>
        <Image
          source={require('@/assets/images/logotype-long.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Pagination Dots Overlay */}
      <View style={styles.paginationOverlay}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentSlide === index && styles.activeDot,
            ]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>

      {/* Navigation Overlay */}
      <View style={styles.navigationOverlay}>
        <TouchableOpacity
          style={[styles.navButton, currentSlide === 0 && styles.navButtonDisabled]}
          onPress={prevSlide}
          disabled={currentSlide === 0}
        >
          <ChevronLeft size={24} color={currentSlide === 0 ? 'rgba(255,255,255,0.5)' : '#FFFFFF'} />
          <Text style={[styles.navText, currentSlide === 0 && styles.navTextDisabled]}>
            {t('intro:navigation.previous')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={nextSlide}>
          <Text style={styles.navText}>
            {currentSlide === slides.length - 1 ? t('intro:navigation.getStarted') : t('intro:navigation.next')}
          </Text>
          <ChevronRight size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  slidesContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  logoOverlay: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 20,
  },
  logo: {
    width: 160,
    height: 44,
    tintColor: '#FFFFFF',
  },
  slidesWrapper: {
    flexDirection: 'row',
    height: '100%',
    width: width * 3, // Total width for 3 slides
  },
  slide: {
    width: width,
    position: 'relative',
  },
  mediaContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E5E7EB',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  paginationOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  navigationOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 160,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  slideText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
