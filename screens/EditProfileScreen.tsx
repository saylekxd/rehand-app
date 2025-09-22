import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { User, Calendar, Phone, Target, Camera, Check, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileScreenProps {
  onClose: () => void;
}

interface EditableProfile {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  medical_conditions: string[];
  avatar_url: string;
  weekly_goal_minutes: number;
}


export default function EditProfileScreen({ onClose }: EditProfileScreenProps) {
  const { t } = useTranslation(['editProfile']);
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profile, setProfile] = useState<EditableProfile>({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'other',
    fitness_level: 'beginner',
    goals: [],
    medical_conditions: [],
    avatar_url: '',
    weekly_goal_minutes: 120,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || 'other',
        fitness_level: user.fitness_level || 'beginner',
        goals: user.goals || [],
        medical_conditions: user.medical_conditions || [],
        avatar_url: user.avatar_url || '',
        weekly_goal_minutes: user.weekly_goal_minutes || 120,
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!profile.first_name.trim() || !profile.last_name.trim()) {
        Alert.alert('Error', t('editProfile:requiredName'));
        return;
      }

      const { error } = await updateProfile(profile);

      if (error) {
        Alert.alert('Error', t('editProfile:saveError'));
        return;
      }

      Alert.alert('OK', t('editProfile:saveSuccess'), [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      Alert.alert('Error', t('editProfile:unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', t('editProfile:galleryAccessNeeded'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfile(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', t('editProfile:galleryAccessNeeded'));
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setProfile(prev => ({ ...prev, date_of_birth: dateString }));
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (fn: (prev: EditableProfile) => EditableProfile) => void, key: keyof EditableProfile) => {
    setter(prev => ({
      ...prev,
      [key]: array.includes(item)
        ? array.filter(i => i !== item)
        : [...array, item]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('editProfile:title')}</Text>
        <TouchableOpacity 
          style={[styles.headerButton, styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Check size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.card}>
          <View style={styles.avatarSection}>
            <Image
              source={{ 
                uri: profile.avatar_url || 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=200' 
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('editProfile:basicInfo')}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('editProfile:firstNameLabel')}</Text>
            <TextInput
              style={styles.input}
              value={profile.first_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, first_name: text }))}
              placeholder={t('editProfile:firstNamePlaceholder')}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('editProfile:lastNameLabel')}</Text>
            <TextInput
              style={styles.input}
              value={profile.last_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, last_name: text }))}
              placeholder={t('editProfile:lastNamePlaceholder')}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('editProfile:phoneLabel')}</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
              placeholder={t('editProfile:phonePlaceholder')}
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('editProfile:dobLabel')}</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.dateText, !profile.date_of_birth && styles.placeholder]}>
                {profile.date_of_birth || t('editProfile:dobPlaceholder')}
              </Text>
              <Calendar size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={profile.date_of_birth ? new Date(profile.date_of_birth) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Gender & Fitness Level */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('editProfile:genderTitle')}</Text>
          <View style={styles.optionsRow}>
            {(t('editProfile:genders', { returnObjects: true }) as any[]).map((option: any) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  profile.gender === option.value && styles.optionButtonSelected
                ]}
                onPress={() => setProfile(prev => ({ ...prev, gender: option.value as any }))}
              >
                <Text style={[
                  styles.optionText,
                  profile.gender === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.cardTitle, { marginTop: 20 }]}>{t('editProfile:levelTitle')}</Text>
          <View style={styles.optionsColumn}>
            {(t('editProfile:levels', { returnObjects: true }) as any[]).map((level: any) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.optionButton,
                  profile.fitness_level === level.value && styles.optionButtonSelected
                ]}
                onPress={() => setProfile(prev => ({ ...prev, fitness_level: level.value as any }))}
              >
                <Text style={[
                  styles.optionText,
                  profile.fitness_level === level.value && styles.optionTextSelected
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Goal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('editProfile:weeklyGoalLabel')}</Text>
          <TextInput
            style={styles.input}
            value={profile.weekly_goal_minutes.toString()}
            onChangeText={(text) => setProfile(prev => ({ 
              ...prev, 
              weekly_goal_minutes: parseInt(text) || 0 
            }))}
            placeholder={t('editProfile:weeklyGoalPlaceholder')}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        {/* Goals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('editProfile:goalsTitle')}</Text>
          <View style={styles.tagsContainer}>
            {(t('editProfile:commonGoals', { returnObjects: true }) as string[]).map((goal: string) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.tag,
                  profile.goals.includes(goal) && styles.tagSelected
                ]}
                onPress={() => toggleArrayItem(profile.goals, goal, setProfile, 'goals')}
              >
                <Text style={[
                  styles.tagText,
                  profile.goals.includes(goal) && styles.tagTextSelected
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Medical Conditions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('editProfile:conditionsTitle')}</Text>
          <View style={styles.tagsContainer}>
            {(t('editProfile:commonConditions', { returnObjects: true }) as string[]).map((condition: string) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.tag,
                  profile.medical_conditions.includes(condition) && styles.tagSelected
                ]}
                onPress={() => toggleArrayItem(profile.medical_conditions, condition, setProfile, 'medical_conditions')}
              >
                <Text style={[
                  styles.tagText,
                  profile.medical_conditions.includes(condition) && styles.tagTextSelected
                ]}>
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '50%',
    marginRight: -28,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  dateInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionsColumn: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
  },
  optionButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#2563EB',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  tagTextSelected: {
    color: '#2563EB',
  },
  bottomSpacing: {
    height: 32,
  },
}); 