export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  medical_conditions?: string[];
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image_url?: string;
  video_url?: string;
  instructions?: string[];
  muscle_groups?: string[];
  equipment?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserExercise {
  id: string;
  user_id: string;
  exercise_id: string;
  completed_at: string;
  duration_completed?: number;
  difficulty_rating?: number;
  notes?: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: string;
  goal_description: string;
  target_date?: string;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimated_duration?: number;
  is_custom: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  medical_conditions: string[];
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
} 