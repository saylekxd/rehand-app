import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { X, ChevronDown, ChevronRight, Mail, MessageCircle, Phone, ExternalLink } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface HelpScreenProps {
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function HelpScreen({ onClose }: HelpScreenProps) {
  const { t } = useTranslation(['help']);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: t('help:q1'),
      answer: t('help:a1'),
      expanded: false,
    },
    {
      id: '2',
      question: t('help:q2'),
      answer: t('help:a2'),
      expanded: false,
    },
    {
      id: '3',
      question: t('help:q3'),
      answer: t('help:a3'),
      expanded: false,
    },
    {
      id: '4',
      question: t('help:q4'),
      answer: t('help:a4'),
      expanded: false,
    },
    {
      id: '5',
      question: t('help:q5'),
      answer: t('help:a5'),
      expanded: false,
    },
    {
      id: '6',
      question: t('help:q6'),
      answer: t('help:a6'),
      expanded: false,
    },
  ]);

  const toggleFAQ = (id: string) => {
    setFaqItems(prev => prev.map(item => 
      item.id === id ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const handleContact = (method: 'email' | 'chat' | 'phone') => {
    switch (method) {
      case 'email':
        Alert.alert(
          t('help:contactEmailTitle'),
          t('help:contactEmailText'),
          [
            { text: t('common:cancel'), style: 'cancel' },
            { 
              text: t('help:open'), 
              onPress: () => Linking.openURL('mailto:support@rehandapp.com?subject=Pomoc%20-%20ReHand%20App')
            }
          ]
        );
        break;
      case 'chat':
        Alert.alert(t('help:chat'), t('help:chatSoon'));
        break;
      case 'phone':
        Alert.alert(
          t('help:phone'),
          t('help:callSupport'),
          [
            { text: t('common:cancel'), style: 'cancel' },
            { 
              text: t('help:call'), 
              onPress: () => Linking.openURL('tel:+48123456789')
            }
          ]
        );
        break;
    }
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://rehandapp.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('help:title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('help:contactUs')}</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={() => handleContact('email')}>
            <View style={styles.contactLeft}>
              <View style={[styles.iconContainer, styles.blueIconContainer]}>
                <Mail size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactDescription}>support@rehandapp.com</Text>
              </View>
            </View>
            <ExternalLink size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={() => handleContact('chat')}>
            <View style={styles.contactLeft}>
              <View style={[styles.iconContainer, styles.greenIconContainer]}>
                <MessageCircle size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.contactTitle}>{t('help:chat')}</Text>
                <Text style={styles.contactDescription}>{t('help:chatDesc')}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactItem, styles.lastItem]} onPress={() => handleContact('phone')}>
            <View style={styles.contactLeft}>
              <View style={[styles.iconContainer, styles.orangeIconContainer]}>
                <Phone size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.contactTitle}>{t('help:phone')}</Text>
                <Text style={styles.contactDescription}>+48 123 456 789</Text>
              </View>
            </View>
            <ExternalLink size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('help:faq')}</Text>
          
          {faqItems.map((item, index) => (
            <View key={item.id} style={[styles.faqItem, index === faqItems.length - 1 && styles.lastItem]}>
              <TouchableOpacity 
                style={styles.faqQuestion} 
                onPress={() => toggleFAQ(item.id)}
              >
                <Text style={styles.questionText}>{item.question}</Text>
                {item.expanded ? (
                  <ChevronDown size={20} color="#6B7280" />
                ) : (
                  <ChevronRight size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
              
              {item.expanded && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* App Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('help:appInfo')}</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('help:appVersion')}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('help:lastUpdate')}</Text>
            <Text style={styles.infoValue}>15 grudnia 2024</Text>
          </View>
          
          <TouchableOpacity style={[styles.infoItem, styles.lastItem]} onPress={handleOpenWebsite}>
            <Text style={styles.infoLabel}>{t('help:website')}</Text>
            <View style={styles.websiteLink}>
              <Text style={styles.linkText}>rehandapp.com</Text>
              <ExternalLink size={16} color="#2563EB" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('help:quickTips')}</Text>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>💡 {t('help:tip1Title')}</Text>
            <Text style={styles.tipDescription}>
              {t('help:tip1Desc')}
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>🎯 {t('help:tip2Title')}</Text>
            <Text style={styles.tipDescription}>
              {t('help:tip2Desc')}
            </Text>
          </View>

          <View style={[styles.tipItem, styles.lastItem]}>
            <Text style={styles.tipTitle}>📱 {t('help:tip3Title')}</Text>
            <Text style={styles.tipDescription}>
              {t('help:tip3Desc')}
            </Text>
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
  headerSpacer: {
    width: 40,
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
  contactItem: {
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
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  blueIconContainer: {
    backgroundColor: '#EFF6FF',
  },
  greenIconContainer: {
    backgroundColor: '#ECFDF5',
  },
  orangeIconContainer: {
    backgroundColor: '#FEF3C7',
  },
  contactTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingBottom: 12,
  },
  answerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  websiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  tipItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tipTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
}); 