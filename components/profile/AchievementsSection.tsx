import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Trophy, Flame, Target, Clock, Star } from 'lucide-react-native';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  progress?: number;
  target?: number;
}

interface AchievementsSectionProps {
  achievements: Achievement[];
  loading: boolean;
  error: any;
  onRetry: () => void;
}

export default function AchievementsSection({ achievements, loading, error, onRetry }: AchievementsSectionProps) {
  // Achievement icon mapping function
  const getAchievementIcon = (icon: string, earned: boolean) => {
    const color = earned ? '#F59E0B' : '#D1D5DB';
    const size = 20;
    
    switch (icon) {
      case 'trophy':
        return <Trophy size={size} color={color} />;
      case 'fire':
        return <Flame size={size} color={color} />;
      case 'target':
        return <Target size={size} color={color} />;
      case 'clock':
        return <Clock size={size} color={color} />;
      case 'star':
        return <Star size={size} color={color} />;
      default:
        return <Trophy size={size} color={color} />;
    }
  };

  // Rarity style mapping function
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'bronze':
        return styles.rarityBronze;
      case 'silver':
        return styles.raritySilver;
      case 'gold':
        return styles.rarityGold;
      case 'platinum':
        return styles.rarityPlatinum;
      default:
        return styles.rarityBronze;
    }
  };

  return (
    <View style={styles.achievementsContainer}>
      <Text style={styles.sectionTitle}>Osiągnięcia</Text>
      {loading ? (
        <View style={styles.loadingAchievements}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Ładowanie osiągnięć...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorAchievements}>
          <Text style={styles.errorText}>Błąd ładowania osiągnięć</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScrollContainer}
        >
          {achievements.map((achievement) => (
            <View key={achievement.id} style={[
              styles.achievementCard,
              !achievement.earned && styles.achievementCardLocked
            ]}>
              {getAchievementIcon(achievement.icon, achievement.earned)}
              <View style={styles.achievementContent}>
                <View style={styles.achievementHeader}>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.achievementTitleLocked
                  ]}>
                    {achievement.title}
                  </Text>
                  <View style={[styles.rarityBadge, getRarityStyle(achievement.rarity)]}>
                    <Text style={styles.rarityText}>{achievement.rarity}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
                {!achievement.earned && achievement.progress !== undefined && achievement.target !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill, 
                        { width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }
                      ]} />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.progress}/{achievement.target}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  achievementsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  achievementsScrollContainer: {
    paddingRight: 24, // Dodajemy padding po prawej stronie dla lepszego wyglądu
  },
  achievementCard: {
    width: 200, // Zmniejszam szerokość z 280 na 200 dla bardziej kwadratowego kształtu
    flexDirection: 'column', // Zmieniam z 'row' na 'column' dla pionowego układu
    alignItems: 'center', // Centruję elementy
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginRight: 12,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementContent: {
    flex: 1,
    alignItems: 'center', // Centruję zawartość
    width: '100%', // Pełna szerokość kontenera
  },
  achievementHeader: {
    flexDirection: 'column', // Zmieniam z 'row' na 'column' dla pionowego układu
    alignItems: 'center', // Centruję elementy
    marginBottom: 8, // Zwiększam margines
    width: '100%',
  },
  achievementTitle: {
    fontSize: 14, // Zmniejszam rozmiar czcionki
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 6, // Dodaję margines pod tytułem
    textAlign: 'center', // Centruję tekst
  },
  achievementTitleLocked: {
    color: '#9CA3AF',
  },
  achievementDescription: {
    fontSize: 12, // Zmniejszam rozmiar czcionki
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center', // Centruję tekst
    lineHeight: 16, // Dodaję wysokość linii
  },
  achievementDescriptionLocked: {
    color: '#D1D5DB',
  },
  loadingAchievements: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  errorAchievements: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  rarityBronze: {
    backgroundColor: '#F59E0B',
  },
  raritySilver: {
    backgroundColor: '#9CA3AF',
  },
  rarityGold: {
    backgroundColor: '#F59E0B',
  },
  rarityPlatinum: {
    backgroundColor: '#8B5CF6',
  },
  rarityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  viewMoreButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
}); 