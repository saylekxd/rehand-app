import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingData } from '@/types';
import { usePaywall } from '@/contexts/PaywallContext';
import { Calendar, User, Phone, Target, Activity, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const medicalConditionsPL = ['Bóle pleców','Problemy z szyją','Bóle stawów','Kontuzje sportowe','Brak przeciwwskazań'];

const fitnessGoalsPL = ['Zmniejszenie bólu','Poprawa mobilności','Wzmocnienie mięśni','Poprawa postawy','Profilaktyka kontuzji','Ogólna sprawność'];

export default function OnboardingScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = useAuth();
  const { open } = usePaywall();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'other',
    phone: '',
    medical_conditions: [],
    fitness_level: 'beginner',
    goals: [],
  });

  // i18n-driven lists (fallback to PL arrays if i18n not loaded yet)
  const medicalConditionsList = (t('onboarding:issues', { returnObjects: true }) as unknown as string[]) || medicalConditionsPL;
  const fitnessGoalsList = (t('onboarding:goalItems', { returnObjects: true }) as unknown as string[]) || fitnessGoalsPL;

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleInputChange('date_of_birth', formattedDate);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleArrayItem = (field: 'medical_conditions' | 'goals', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await completeOnboarding(formData);
    
    if (error) {
      Alert.alert(t('common:error'), t('onboarding:error'));
    } else {
      // Show paywall right after successful onboarding
      try { open(); } catch {}
    }
    setLoading(false);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('onboarding:basicInfo')}</Text>
      
      <View style={styles.inputContainer}>
        <User size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={t('onboarding:firstName')}
          value={formData.first_name}
          onChangeText={(value) => handleInputChange('first_name', value)}
          autoCapitalize="words"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <User size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={t('onboarding:lastName')}
          value={formData.last_name}
          onChangeText={(value) => handleInputChange('last_name', value)}
          autoCapitalize="words"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={() => setShowDatePicker(true)}
      >
        <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
        <Text style={[
          styles.input,
          !formData.date_of_birth && styles.placeholderText
        ]}>
          {formData.date_of_birth ? formatDisplayDate(formData.date_of_birth) : t('onboarding:dob')}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
            textColor="#1F2937"
            themeVariant="light"
          />
        </View>
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <TouchableOpacity 
          style={styles.datePickerCloseButton}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.datePickerCloseButtonText}>{t('common:done')}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.inputContainer}>
        <Phone size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={t('onboarding:phone')}
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          keyboardType="phone-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <Text style={styles.sectionTitle}>{t('onboarding:gender')}</Text>
      <View style={styles.genderContainer}>
        {[
          { key: 'male', label: t('onboarding:male') },
          { key: 'female', label: t('onboarding:female') },
          { key: 'other', label: t('onboarding:other') },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.genderOption,
              formData.gender === option.key && styles.genderOptionSelected
            ]}
            onPress={() => handleInputChange('gender', option.key)}
          >
            <Text style={[
              styles.genderOptionText,
              formData.gender === option.key && styles.genderOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('onboarding:medical')}</Text>
      <Text style={styles.stepSubtitle}>{t('onboarding:pickIssues')}</Text>
      
      {/* Medical Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>⚠️ {t('onboarding:disclaimerTitle')}</Text>
        <Text style={styles.disclaimerText}>{t('onboarding:disclaimerText')}</Text>
      </View>
      
      {medicalConditionsList.map((condition) => (
        <TouchableOpacity
          key={condition}
          style={[
            styles.optionItem,
            formData.medical_conditions.includes(condition) && styles.optionItemSelected
          ]}
          onPress={() => toggleArrayItem('medical_conditions', condition)}
        >
          <CheckCircle 
            size={20} 
            color={formData.medical_conditions.includes(condition) ? '#2563EB' : '#D1D5DB'} 
          />
          <Text style={[
            styles.optionText,
            formData.medical_conditions.includes(condition) && styles.optionTextSelected
          ]}>
            {condition}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('onboarding:activityLevel')}</Text>
      <Text style={styles.stepSubtitle}>{t('onboarding:whatLevel')}</Text>
      
      {[
        { key: 'beginner', label: t('onboarding:beginner'), desc: t('onboarding:beginnerDesc') },
        { key: 'intermediate', label: t('onboarding:intermediate'), desc: t('onboarding:intermediateDesc') },
        { key: 'advanced', label: t('onboarding:advanced'), desc: t('onboarding:advancedDesc') },
      ].map((level) => (
        <TouchableOpacity
          key={level.key}
          style={[
            styles.levelOption,
            formData.fitness_level === level.key && styles.levelOptionSelected
          ]}
          onPress={() => handleInputChange('fitness_level', level.key)}
        >
          <Activity 
            size={24} 
            color={formData.fitness_level === level.key ? '#2563EB' : '#6B7280'} 
          />
          <View style={styles.levelContent}>
            <Text style={[
              styles.levelTitle,
              formData.fitness_level === level.key && styles.levelTitleSelected
            ]}>
              {level.label}
            </Text>
            <Text style={styles.levelDesc}>{level.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('onboarding:goals')}</Text>
      <Text style={styles.stepSubtitle}>{t('onboarding:whatGoals')}</Text>
      
      {fitnessGoalsList.map((goal) => (
        <TouchableOpacity
          key={goal}
          style={[
            styles.optionItem,
            formData.goals.includes(goal) && styles.optionItemSelected
          ]}
          onPress={() => toggleArrayItem('goals', goal)}
        >
          <Target 
            size={20} 
            color={formData.goals.includes(goal) ? '#2563EB' : '#D1D5DB'} 
          />
          <Text style={[
            styles.optionText,
            formData.goals.includes(goal) && styles.optionTextSelected
          ]}>
            {goal}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding:basicInfo')}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{step} / 4</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>{t('onboarding:back')}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>{step === 4 ? t('onboarding:finish') : t('onboarding:next')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  genderOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  genderOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  genderOptionTextSelected: {
    color: '#2563EB',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginLeft: 12,
  },
  optionTextSelected: {
    color: '#2563EB',
    fontFamily: 'Inter-Medium',
  },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  levelOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  levelContent: {
    flex: 1,
    marginLeft: 12,
  },
  levelTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  levelTitleSelected: {
    color: '#2563EB',
  },
  levelDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  disclaimerBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#991B1B',
    lineHeight: 20,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  datePickerCloseButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  datePickerCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 