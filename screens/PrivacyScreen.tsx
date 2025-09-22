import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { X, Shield, Eye, Download, Trash2, Database, Lock, Check, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface PrivacyScreenProps {
  onClose: () => void;
}

interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  crashReports: boolean;
  marketing: boolean;
}

export default function PrivacyScreen({ onClose }: PrivacyScreenProps) {
  const { t } = useTranslation(['privacy', 'common']);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataCollection: true,
    analytics: false,
    crashReports: true,
    marketing: false,
  });

  const togglePrivacySetting = (key: keyof PrivacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = () => {
    Alert.alert(
      t('privacy:exportTitle'),
      t('privacy:exportText'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        { 
          text: t('privacy:export'), 
          onPress: () => Alert.alert(t('common:ok'), t('privacy:exportStarted'))
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('privacy:deleteTitle'),
      t('privacy:deleteWarning'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        { 
          text: t('privacy:deleteTitle'), 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('privacy:lastWarning'),
              t('privacy:deleteConfirm'),
              [
                { text: t('common:cancel'), style: 'cancel' },
                { 
                  text: t('privacy:deleteYes'), 
                  style: 'destructive',
                  onPress: () => Alert.alert(t('privacy:deleted'), t('privacy:thanks'))
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      t('privacy:clearLocalTitle'),
      t('privacy:clearLocalText'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        { 
          text: t('privacy:clear'), 
          onPress: () => Alert.alert(t('common:ok'), t('privacy:cleared'))
        }
      ]
    );
  };

  const handleSavePrivacy = () => {
    Alert.alert(t('common:ok'), t('privacy:saved'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('privacy:title')}</Text>
        <TouchableOpacity style={[styles.headerButton, styles.saveButton]} onPress={handleSavePrivacy}>
          <Check size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('privacy:settings')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Database size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('privacy:dataCollection')}</Text>
                <Text style={styles.settingDescription}>{t('privacy:dataCollectionDesc')}</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.dataCollection}
              onValueChange={() => togglePrivacySetting('dataCollection')}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={privacySettings.dataCollection ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Eye size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('privacy:analytics')}</Text>
                <Text style={styles.settingDescription}>{t('privacy:analyticsDesc')}</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.analytics}
              onValueChange={() => togglePrivacySetting('analytics')}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={privacySettings.analytics ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Shield size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('privacy:crashReports')}</Text>
                <Text style={styles.settingDescription}>{t('privacy:crashReportsDesc')}</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.crashReports}
              onValueChange={() => togglePrivacySetting('crashReports')}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={privacySettings.crashReports ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={[styles.settingItem, styles.lastItem]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Lock size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('privacy:marketing')}</Text>
                <Text style={styles.settingDescription}>{t('privacy:marketingDesc')}</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.marketing}
              onValueChange={() => togglePrivacySetting('marketing')}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={privacySettings.marketing ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('privacy:dataManagement')}</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconContainer, styles.blueIconContainer]}>
                <Download size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.actionTitle}>{t('privacy:exportData')}</Text>
                <Text style={styles.actionDescription}>{t('privacy:exportDataDesc')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.lastItem]} onPress={handleClearData}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconContainer, styles.orangeIconContainer]}>
                <Database size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.actionTitle}>{t('privacy:clearLocal')}</Text>
                <Text style={styles.actionDescription}>{t('privacy:clearLocalDesc')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('privacy:legal')}</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <View style={styles.iconContainer}>
                <Shield size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.actionTitle}>{t('privacy:policy')}</Text>
                <Text style={styles.actionDescription}>{t('privacy:policyDesc')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.lastItem]}>
            <View style={styles.actionLeft}>
              <View style={styles.iconContainer}>
                <Lock size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.actionTitle}>{t('privacy:terms')}</Text>
                <Text style={styles.actionDescription}>{t('privacy:termsDesc')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, styles.dangerTitle]}>{t('privacy:danger')}</Text>
          
          <TouchableOpacity style={[styles.actionItem, styles.dangerItem, styles.lastItem]} onPress={handleDeleteAccount}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconContainer, styles.redIconContainer]}>
                <Trash2 size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.actionTitle, styles.dangerText]}>{t('privacy:deleteTitle')}</Text>
                <Text style={styles.actionDescription}>{t('privacy:deleteWarning')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
  dangerTitle: {
    color: '#EF4444',
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dangerItem: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionLeft: {
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
  blueIconContainer: {
    backgroundColor: '#EFF6FF',
  },
  orangeIconContainer: {
    backgroundColor: '#FEF3C7',
  },
  redIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actionDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 32,
  },
}); 