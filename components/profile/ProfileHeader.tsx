import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  avatar_url?: string;
}

interface ProfileHeaderProps {
  user: User;
  onEditPress: () => void;
}

export default function ProfileHeader({ user, onEditPress }: ProfileHeaderProps) {
  const { t } = useTranslation(['profileHeader']);
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email?.split('@')[0] || t('profileHeader:userFallback');
  };

  const getFitnessLevelDisplay = () => {
    switch (user?.fitness_level) {
      case 'beginner':
        return t('profileHeader:levelBeginner');
      case 'intermediate':
        return t('profileHeader:levelIntermediate');
      case 'advanced':
        return t('profileHeader:levelAdvanced');
      default:
        return t('profileHeader:levelUnknown');
    }
  };

  const getAvatarUrl = () => {
    return user?.avatar_url || 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=200';
  };

  return (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: getAvatarUrl() }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.userLevel}>{getFitnessLevelDisplay()}</Text>
          {user.goals && user.goals.length > 0 && (
            <View style={styles.goalsContainer}>
              <Text style={styles.goalsLabel}>{t('profileHeader:goalsLabel')}</Text>
              <Text style={styles.goalsText} numberOfLines={1}>
                {user.goals.slice(0, 2).join(', ')}
                {user.goals.length > 2 ? '...' : ''}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={onEditPress}
        >
          <User size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  goalsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  goalsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
}); 