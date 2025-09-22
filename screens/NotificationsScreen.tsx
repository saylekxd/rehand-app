import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { X, Bell, Clock, Target, Trophy, Calendar, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface NotificationsScreenProps {
  onClose: () => void;
}

interface NotificationSettings {
  exerciseReminders: boolean;
  dailyGoals: boolean;
  achievements: boolean;
  weeklyProgress: boolean;
  streakReminders: boolean;
  reminderTime: string;
  reminderDays: string[];
}

export default function NotificationsScreen({ onClose }: NotificationsScreenProps) {
  const { t } = useTranslation(['notifications']);
  const [settings, setSettings] = useState<NotificationSettings>({
    exerciseReminders: true,
    dailyGoals: true,
    achievements: true,
    weeklyProgress: true,
    streakReminders: true,
    reminderTime: '09:00',
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  });

  const handleSave = () => {
    // TODO: Save notification settings
    Alert.alert(t('common:ok', 'OK'), t('notifications:saved'));
  };

  const toggleSetting = (key: keyof NotificationSettings, value?: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value !== undefined ? value : !prev[key]
    }));
  };

  const toggleDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      reminderDays: prev.reminderDays.includes(day)
        ? prev.reminderDays.filter(d => d !== day)
        : [...prev.reminderDays, day]
    }));
  };

  const weekDays = [
    { value: 'monday', label: t('notifications:weekdaysShort.0') },
    { value: 'tuesday', label: t('notifications:weekdaysShort.1') },
    { value: 'wednesday', label: t('notifications:weekdaysShort.2') },
    { value: 'thursday', label: t('notifications:weekdaysShort.3') },
    { value: 'friday', label: t('notifications:weekdaysShort.4') },
    { value: 'saturday', label: t('notifications:weekdaysShort.5') },
    { value: 'sunday', label: t('notifications:weekdaysShort.6') },
  ];

  const timeOptions = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('notifications:title')}</Text>
        <TouchableOpacity style={[styles.headerButton, styles.saveButton]} onPress={handleSave}>
          <Check size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Reminders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('notifications:exerciseReminders')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('notifications:dailyReminders')}</Text>
                <Text style={styles.settingDescription}>{t('notifications:dailyRemindersDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.exerciseReminders}
              onValueChange={(value) => toggleSetting('exerciseReminders', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.exerciseReminders ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          {settings.exerciseReminders && (
            <>
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{t('notifications:reminderTime')}</Text>
                <View style={styles.optionsContainer}>
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        settings.reminderTime === time && styles.optionSelected
                      ]}
                      onPress={() => toggleSetting('reminderTime', time)}
                    >
                      <Text style={[
                        styles.optionText,
                        settings.reminderTime === time && styles.optionTextSelected
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>{t('notifications:reminderDays')}</Text>
                <View style={styles.daysContainer}>
                  {weekDays.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayOption,
                        settings.reminderDays.includes(day.value) && styles.optionSelected
                      ]}
                      onPress={() => toggleDay(day.value)}
                    >
                      <Text style={[
                        styles.dayOptionText,
                        settings.reminderDays.includes(day.value) && styles.optionTextSelected
                      ]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Progress Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('notifications:progress')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Target size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('notifications:dailyGoals')}</Text>
                <Text style={styles.settingDescription}>{t('notifications:dailyGoalsDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.dailyGoals}
              onValueChange={(value) => toggleSetting('dailyGoals', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.dailyGoals ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('notifications:weeklyProgress')}</Text>
                <Text style={styles.settingDescription}>{t('notifications:weeklyProgressDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.weeklyProgress}
              onValueChange={(value) => toggleSetting('weeklyProgress', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.weeklyProgress ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={[styles.settingItem, styles.lastItem]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Clock size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('notifications:streaks')}</Text>
                <Text style={styles.settingDescription}>{t('notifications:streaksDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.streakReminders}
              onValueChange={(value) => toggleSetting('streakReminders', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.streakReminders ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Achievement Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('notifications:achievements')}</Text>
          
          <View style={[styles.settingItem, styles.lastItem]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Trophy size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('notifications:achievements')}</Text>
                <Text style={styles.settingDescription}>{t('notifications:achievementsDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.achievements}
              onValueChange={(value) => toggleSetting('achievements', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.achievements ? '#FFFFFF' : '#F3F4F6'}
            />
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  subSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subSectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  optionTextSelected: {
    color: '#2563EB',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  dayOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 32,
  },
}); 