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
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'Jak rozpocząć pierwsze ćwiczenie?',
      answer: 'Przejdź do zakładki "Główna" i wybierz jedno z proponowanych ćwiczeń. Każde ćwiczenie zawiera szczegółowe instrukcje i ilustracje, które pomogą Ci wykonać je prawidłowo.',
      expanded: false,
    },
    {
      id: '2',
      question: 'Jak mogę zmienić swój tygodniowy cel?',
      answer: 'Możesz zmienić swój tygodniowy cel w sekcji "Profil" > "Edytuj profil". Ustaw liczbę minut, którą chcesz ćwiczyć każdego tygodnia.',
      expanded: false,
    },
    {
      id: '3',
      question: 'Co to są osiągnięcia i jak je zdobyć?',
      answer: 'Osiągnięcia to nagrody za regularność i postępy w ćwiczeniach. Możesz je zdobyć wykonując ćwiczenia, utrzymując serię dni z rzędu, lub osiągając cele czasowe. Sprawdź swoją listę osiągnięć w profilu.',
      expanded: false,
    },
    {
      id: '4',
      question: 'Czy mogę ćwiczyć z problemami zdrowotnymi?',
      answer: 'Aplikacja oferuje ćwiczenia dostosowane do różnych poziomów zaawansowania i ograniczeń zdrowotnych. Zawsze skonsultuj się z lekarzem przed rozpoczęciem nowego programu ćwiczeń, szczególnie jeśli masz problemy zdrowotne.',
      expanded: false,
    },
    {
      id: '5',
      question: 'Jak długo powinno trwać każde ćwiczenie?',
      answer: 'Czas trwania ćwiczeń różni się w zależności od typu i poziomu trudności. Większość ćwiczeń trwa od 3 do 15 minut. Wybierz ćwiczenia odpowiednie do ilości czasu, który masz dostępny.',
      expanded: false,
    },
    {
      id: '6',
      question: 'Jak skonfigurować przypomnienia?',
      answer: 'Przejdź do "Profil" > "Ustawienia" > "Powiadomienia" aby skonfigurować przypomnienia o ćwiczeniach. Możesz wybrać godzinę i dni tygodnia, kiedy chcesz otrzymywać powiadomienia.',
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
          'Kontakt email',
          'Otworzysz aplikację email aby napisać do nas?',
          [
            { text: 'Anuluj', style: 'cancel' },
            { 
              text: 'Otwórz', 
              onPress: () => Linking.openURL('mailto:support@rehandapp.com?subject=Pomoc%20-%20ReHand%20App')
            }
          ]
        );
        break;
      case 'chat':
        Alert.alert('Chat online', 'Funkcja chatu będzie dostępna wkrótce!');
        break;
      case 'phone':
        Alert.alert(
          'Telefon',
          'Zadzwonić na linię wsparcia?',
          [
            { text: 'Anuluj', style: 'cancel' },
            { 
              text: 'Zadzwoń', 
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
        <Text style={styles.title}>Pomoc</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skontaktuj się z nami</Text>
          
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
                <Text style={styles.contactTitle}>Chat online</Text>
                <Text style={styles.contactDescription}>Szybka pomoc w czasie rzeczywistym</Text>
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
                <Text style={styles.contactTitle}>Telefon</Text>
                <Text style={styles.contactDescription}>+48 123 456 789</Text>
              </View>
            </View>
            <ExternalLink size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Często zadawane pytania</Text>
          
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
          <Text style={styles.cardTitle}>Informacje o aplikacji</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Wersja aplikacji</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ostatnia aktualizacja</Text>
            <Text style={styles.infoValue}>15 grudnia 2024</Text>
          </View>
          
          <TouchableOpacity style={[styles.infoItem, styles.lastItem]} onPress={handleOpenWebsite}>
            <Text style={styles.infoLabel}>Strona internetowa</Text>
            <View style={styles.websiteLink}>
              <Text style={styles.linkText}>rehandapp.com</Text>
              <ExternalLink size={16} color="#2563EB" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Szybkie wskazówki</Text>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>💡 Regularne ćwiczenia</Text>
            <Text style={styles.tipDescription}>
              Lepiej ćwiczyć 10 minut dziennie niż godzinę raz w tygodniu. Regularne, krótkie sesje przynoszą lepsze rezultaty.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>🎯 Ustaw realistyczne cele</Text>
            <Text style={styles.tipDescription}>
              Zacznij od małych celów i stopniowo je zwiększaj. To pomoże Ci utrzymać motywację i osiągnąć długoterminowy sukces.
            </Text>
          </View>

          <View style={[styles.tipItem, styles.lastItem]}>
            <Text style={styles.tipTitle}>📱 Użyj powiadomień</Text>
            <Text style={styles.tipDescription}>
              Skonfiguruj przypomnienia o ćwiczeniach w dogodnych dla Ciebie godzinach. To pomoże Ci wypracować stały nawyk.
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