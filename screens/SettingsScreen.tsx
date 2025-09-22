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
import { X, Moon, Volume2, Globe, Database, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '@/lib/i18n';

interface SettingsScreenProps {
  onClose: () => void;
}

interface AppSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  language: string;
  autoSync: boolean;
  dataUsage: 'wifi' | 'all';
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    soundEnabled: true,
    language: 'pl',
    autoSync: true,
    dataUsage: 'wifi',
  });

  const handleSave = () => {
    // TODO: Save settings to storage/database
    Alert.alert(t('common:ok', 'OK'), t('settings.saved'));
  };

  const toggleSetting = (key: keyof AppSettings, value?: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value !== undefined ? value : !prev[key]
    }));
  };

  const languageOptions = [
    { value: 'pl', label: t('settings:polish') },
    { value: 'en', label: t('settings:english') },
  ];

  const dataUsageOptions = [
    { value: 'wifi', label: t('settings:wifiOnly') },
    { value: 'all', label: t('settings:wifiAndCellular') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings:title')}</Text>
        <TouchableOpacity style={[styles.headerButton, styles.saveButton]} onPress={handleSave}>
          <Check size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:appearance')}</Text>
          
          <View style={[styles.settingItem, styles.lastItem]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Moon size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings:darkMode')}</Text>
                <Text style={styles.settingDescription}>{t('settings:darkModeDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => toggleSetting('darkMode', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.darkMode ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Audio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:sound')}</Text>
          
          <View style={[styles.settingItem, styles.lastItem]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Volume2 size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings:appSounds')}</Text>
                <Text style={styles.settingDescription}>{t('settings:appSoundsDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => toggleSetting('soundEnabled', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.soundEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:language')}</Text>
          
          <View style={styles.optionsContainer}>
            {languageOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  settings.language === option.value && styles.optionItemSelected,
                  index === languageOptions.length - 1 && styles.lastItem
                ]}
                onPress={async () => {
                  toggleSetting('language', option.value);
                  if (option.value === 'pl' || option.value === 'en') {
                    await setAppLanguage(option.value);
                  }
                }}
              >
                <Text style={[
                  styles.optionText,
                  settings.language === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data & Sync */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:dataSync')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Database size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings:autoSync')}</Text>
                <Text style={styles.settingDescription}>{t('settings:autoSyncDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => toggleSetting('autoSync', value)}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={settings.autoSync ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>{t('settings:dataUsage')}</Text>
            <View style={styles.optionsContainer}>
              {dataUsageOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    settings.dataUsage === option.value && styles.optionItemSelected,
                    index === dataUsageOptions.length - 1 && styles.lastItem
                  ]}
                  onPress={() => toggleSetting('dataUsage', option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.dataUsage === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    gap: 0,
  },
  optionItem: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  optionTextSelected: {
    color: '#2563EB',
  },
  bottomSpacing: {
    height: 32,
  },
}); 