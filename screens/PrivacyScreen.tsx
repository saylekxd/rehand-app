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
      'Eksport danych',
      'Czy chcesz wyeksportować swoje dane? Otrzymasz plik z wszystkimi informacjami o swoim koncie.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Eksportuj', 
          onPress: () => Alert.alert('Sukces', 'Eksport danych został rozpoczęty. Otrzymasz e-mail z linkiem do pobrania.')
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Usuń konto',
      'UWAGA: Ta operacja jest nieodwracalna! Wszystkie Twoje dane, postępy i osiągnięcia zostaną trwale usunięte.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Usuń konto', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Ostatnie ostrzeżenie',
              'Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna.',
              [
                { text: 'Anuluj', style: 'cancel' },
                { 
                  text: 'TAK, USUŃ', 
                  style: 'destructive',
                  onPress: () => Alert.alert('Konto zostało usunięte', 'Dziękujemy za korzystanie z aplikacji.')
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
      'Wyczyść dane lokalne',
      'Czy chcesz wyczyścić wszystkie dane przechowywane lokalnie na tym urządzeniu? Twoje konto online pozostanie nienaruszone.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Wyczyść', 
          onPress: () => Alert.alert('Sukces', 'Dane lokalne zostały wyczyszczone.')
        }
      ]
    );
  };

  const handleSavePrivacy = () => {
    Alert.alert('Sukces', 'Ustawienia prywatności zostały zapisane');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Prywatność</Text>
        <TouchableOpacity style={[styles.headerButton, styles.saveButton]} onPress={handleSavePrivacy}>
          <Check size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ustawienia prywatności</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Database size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Zbieranie danych</Text>
                <Text style={styles.settingDescription}>Pozwól na zbieranie danych w celu poprawy aplikacji</Text>
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
                <Text style={styles.settingTitle}>Analityka</Text>
                <Text style={styles.settingDescription}>Udostępniaj anonimowe dane analityczne</Text>
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
                <Text style={styles.settingTitle}>Raporty błędów</Text>
                <Text style={styles.settingDescription}>Wysyłaj automatyczne raporty o błędach</Text>
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
                <Text style={styles.settingTitle}>Marketing</Text>
                <Text style={styles.settingDescription}>Otrzymuj spersonalizowane oferty i treści</Text>
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
          <Text style={styles.cardTitle}>Zarządzanie danymi</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconContainer, styles.blueIconContainer]}>
                <Download size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.actionTitle}>Eksportuj dane</Text>
                <Text style={styles.actionDescription}>Pobierz kopię wszystkich swoich danych</Text>
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
                <Text style={styles.actionTitle}>Wyczyść dane lokalne</Text>
                <Text style={styles.actionDescription}>Usuń dane przechowywane na urządzeniu</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dokumenty prawne</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <View style={styles.iconContainer}>
                <Shield size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.actionTitle}>Polityka prywatności</Text>
                <Text style={styles.actionDescription}>Przeczytaj naszą politykę prywatności</Text>
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
                <Text style={styles.actionTitle}>Regulamin</Text>
                <Text style={styles.actionDescription}>Warunki korzystania z aplikacji</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, styles.dangerTitle]}>Strefa ryzyka</Text>
          
          <TouchableOpacity style={[styles.actionItem, styles.dangerItem, styles.lastItem]} onPress={handleDeleteAccount}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconContainer, styles.redIconContainer]}>
                <Trash2 size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.actionTitle, styles.dangerText]}>Usuń konto</Text>
                <Text style={styles.actionDescription}>Trwale usuń swoje konto i wszystkie dane</Text>
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