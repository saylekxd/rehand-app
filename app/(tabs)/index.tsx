import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Search, Clock, Target, Play } from 'lucide-react-native';

interface Exercise {
  id: string;
  title: string;
  duration: string;
  difficulty: 'Łatwy' | 'Średni' | 'Trudny';
  category: string;
  image: string;
  description: string;
}

const exercises: Exercise[] = [
  {
    id: '1',
    title: 'Rozciąganie szyi',
    duration: '5 min',
    difficulty: 'Łatwy',
    category: 'Szyja',
    image: 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Delikatne ćwiczenia rozciągające mięśnie szyi'
  },
  {
    id: '2',
    title: 'Rotacje ramion',
    duration: '8 min',
    difficulty: 'Średni',
    category: 'Ramiona',
    image: 'https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Ćwiczenia mobilizacyjne dla stawów ramiennych'
  },
  {
    id: '3',
    title: 'Wzmacnianie pleców',
    duration: '12 min',
    difficulty: 'Trudny',
    category: 'Plecy',
    image: 'https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Zaawansowane ćwiczenia wzmacniające mięśnie grzbietu'
  },
  {
    id: '4',
    title: 'Mobilizacja kolan',
    duration: '10 min',
    difficulty: 'Średni',
    category: 'Kolana',
    image: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Ćwiczenia poprawiające ruchomość stawów kolanowych'
  },
];

const categories = ['Wszystkie', 'Szyja', 'Ramiona', 'Plecy', 'Kolana'];

export default function ExercisesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Wszystkie' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Łatwy': return '#10B981';
      case 'Średni': return '#F59E0B';
      case 'Trudny': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Biblioteka Ćwiczeń</Text>
        <Text style={styles.subtitle}>Wybierz ćwiczenie dostosowane do Twoich potrzeb</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Szukaj ćwiczeń..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
        {filteredExercises.map((exercise) => (
          <TouchableOpacity key={exercise.id} style={styles.exerciseCard}>
            <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
            <View style={styles.exerciseContent}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                    {exercise.difficulty}
                  </Text>
                </View>
              </View>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              <View style={styles.exerciseFooter}>
                <View style={styles.exerciseInfo}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.exerciseInfoText}>{exercise.duration}</Text>
                  <Target size={16} color="#6B7280" />
                  <Text style={styles.exerciseInfoText}>{exercise.category}</Text>
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <Play size={16} color="#FFFFFF" />
                  <Text style={styles.playButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  exerciseContent: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  exerciseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  playButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});