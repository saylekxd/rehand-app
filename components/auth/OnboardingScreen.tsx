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
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingData } from '@/types';
import { Calendar, User, Phone, Target, Activity, CheckCircle } from 'lucide-react-native';

const medicalConditions = [
  'Bóle pleców',
  'Problemy z szyją',
  'Bóle stawów',
  'Kontuzje sportowe',
  'Brak przeciwwskazań',
];

const fitnessGoals = [
  'Zmniejszenie bólu',
  'Poprawa mobilności',
  'Wzmocnienie mięśni',
  'Poprawa postawy',
  'Profilaktyka kontuzji',
  'Ogólna sprawność',
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = useAuth();

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

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      Alert.alert('Błąd', 'Wystąpił problem podczas zapisywania danych');
    }
    setLoading(false);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Podstawowe informacje</Text>
      
      <View style={styles.inputContainer}>
        <User size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Imię"
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
          placeholder="Nazwisko"
          value={formData.last_name}
          onChangeText={(value) => handleInputChange('last_name', value)}
          autoCapitalize="words"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Data urodzenia (YYYY-MM-DD)"
          value={formData.date_of_birth}
          onChangeText={(value) => handleInputChange('date_of_birth', value)}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Phone size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Numer telefonu (opcjonalnie)"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          keyboardType="phone-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <Text style={styles.sectionTitle}>Płeć</Text>
      <View style={styles.genderContainer}>
        {[
          { key: 'male', label: 'Mężczyzna' },
          { key: 'female', label: 'Kobieta' },
          { key: 'other', label: 'Inne' },
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
      <Text style={styles.stepTitle}>Stan zdrowia</Text>
      <Text style={styles.stepSubtitle}>Wybierz swoje problemy zdrowotne</Text>
      
      {medicalConditions.map((condition) => (
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
      <Text style={styles.stepTitle}>Poziom aktywności</Text>
      <Text style={styles.stepSubtitle}>Jaki jest Twój obecny poziom sprawności?</Text>
      
      {[
        { key: 'beginner', label: 'Początkujący', desc: 'Rzadko ćwiczę lub dopiero zaczynam' },
        { key: 'intermediate', label: 'Średniozaawansowany', desc: 'Ćwiczę regularnie, 2-3 razy w tygodniu' },
        { key: 'advanced', label: 'Zaawansowany', desc: 'Ćwiczę intensywnie, ponad 4 razy w tygodniu' },
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
      <Text style={styles.stepTitle}>Twoje cele</Text>
      <Text style={styles.stepSubtitle}>Co chcesz osiągnąć?</Text>
      
      {fitnessGoals.map((goal) => (
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
        <Text style={styles.title}>Konfiguracja profilu</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{step} z 4</Text>
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
            <Text style={styles.backButtonText}>Wstecz</Text>
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
            <Text style={styles.nextButtonText}>
              {step === 4 ? 'Zakończ' : 'Dalej'}
            </Text>
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
}); 