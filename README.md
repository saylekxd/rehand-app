# Rehand App - Rehabilitation Exercise App

A React Native app built with Expo for rehabilitation exercises, featuring Supabase authentication and user onboarding.

## Features

- 🔐 **Authentication**: Email/password signup and login with Supabase
- 📋 **User Onboarding**: Multi-step form to collect user information and health data
- 👤 **User Profiles**: Comprehensive user profiles with health and fitness information
- 💪 **Exercise Library**: Browse and search rehabilitation exercises
- 🎯 **Personalized Goals**: Set and track fitness and health goals
- 📱 **Cross-platform**: Works on iOS, Android, and Web

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Supabase** for backend services (auth, database)
- **Expo SecureStore** for secure token storage
- **Lucide React Native** for icons

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy the environment template and add your credentials:

```bash
cp .env.example .env
```

4. Edit `.env` and replace the placeholder values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Run Database Migrations

In your Supabase dashboard SQL editor, run the migration files in order:

1. `migrations/001_initial_schema.sql` - Creates the main database schema
2. `migrations/002_seed_exercises.sql` - Populates the exercises table

### 4. Start the Development Server

```bash
npm run dev
```

## Database Schema

### Tables

- **profiles**: Extended user profiles with health and fitness data
- **exercises**: Library of rehabilitation exercises
- **user_exercises**: Track completed exercises and progress
- **user_goals**: User-defined fitness and health goals
- **workout_plans**: Custom workout plans
- **workout_plan_exercises**: Exercises within workout plans

### Key Features

- **Row Level Security (RLS)**: All user data is protected
- **Auto-profile creation**: Profiles are automatically created when users sign up
- **Data validation**: Proper constraints and checks on data integrity

## Authentication Flow

1. **Login/Register**: Users can create accounts or sign in
2. **Email Verification**: Supabase handles email verification
3. **Onboarding**: New users complete a 4-step onboarding process:
   - Personal information (name, DOB, gender, phone)
   - Health conditions and medical history
   - Fitness level assessment
   - Goal setting

## File Structure

```
├── app/
│   ├── _layout.tsx          # Root layout with auth provider
│   ├── (tabs)/
│   │   ├── index.tsx        # Exercise library
│   │   ├── profile.tsx      # User profile
│   │   └── ...
├── components/
│   └── auth/
│       ├── AuthWrapper.tsx   # Authentication state manager
│       ├── LoginScreen.tsx   # Login form
│       ├── RegisterScreen.tsx # Registration form
│       └── OnboardingScreen.tsx # Multi-step onboarding
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_seed_exercises.sql
└── types/
    └── index.ts            # TypeScript type definitions
```

## Environment Variables

The app uses environment variables for Supabase configuration. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Important**: Never commit your `.env` file to version control. It's already added to `.gitignore`.

## Development

### Running the app

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal  
- **Web**: Press `w` in the terminal

### Useful Commands

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License. # rehand-app
