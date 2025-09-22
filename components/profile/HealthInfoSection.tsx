import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface HealthInfoSectionProps {
  medicalConditions: string[];
}

export default function HealthInfoSection({ medicalConditions }: HealthInfoSectionProps) {
  const { t } = useTranslation(['healthInfo']);
  const [isVisible, setIsVisible] = useState(false);

  if (!medicalConditions || medicalConditions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{t('healthInfo:title')}</Text>
          <View style={styles.sensitiveLabel}>
            <Lock size={12} color="#EF4444" />
            <Text style={styles.sensitiveLabelText}>{t('healthInfo:sensitive')}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.visibilityButton}
          onPress={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <EyeOff size={20} color="#6B7280" />
          ) : (
            <Eye size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.healthCard}>
        {!isVisible ? (
          <View style={styles.hiddenContent}>
            <Shield size={32} color="#D1D5DB" />
            <Text style={styles.hiddenText}>{t('healthInfo:hidden')}</Text>
            <Text style={styles.hiddenSubtext}>{t('healthInfo:tapToShow')}</Text>
          </View>
        ) : (
          <View style={styles.visibleContent}>
            <View style={styles.conditionsHeader}>
              <Text style={styles.conditionsLabel}>{t('healthInfo:notes')}</Text>
              <Text style={styles.conditionsCount}>
                {medicalConditions.length} {medicalConditions.length === 1 ? t('healthInfo:item') : t('healthInfo:items')}
              </Text>
            </View>
            
            <View style={styles.tagsContainer}>
              {medicalConditions.map((condition, index) => (
                <View key={index} style={styles.conditionTag}>
                  <Text style={styles.conditionTagText}>{condition}</Text>
                </View>
              ))}
            </View>

            <View style={styles.privacyNotice}>
              <Shield size={14} color="#6B7280" />
              <Text style={styles.privacyNoticeText}>{t('healthInfo:private')}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  sensitiveLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sensitiveLabelText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
  visibilityButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  hiddenContent: {
    padding: 32,
    alignItems: 'center',
  },
  hiddenText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  hiddenSubtext: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  visibleContent: {
    padding: 20,
  },
  conditionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conditionsLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  conditionsCount: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  conditionTag: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  conditionTagText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  privacyNoticeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
  },
}); 