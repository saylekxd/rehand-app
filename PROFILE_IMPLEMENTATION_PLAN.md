# Profile Tab Implementation Plan

## Overview
This document outlines the implementation plan to replace mock data in the Profile tab with real database-connected features. The profile tab currently displays hardcoded statistics and achievements that need to be connected to the actual user data and exercise completion records.

## Current State Analysis

### ✅ Already Implemented (Real Data)
- [x] User profile information (name, fitness level, goals, medical conditions)
- [x] User authentication and profile fetching
- [x] Avatar display with fallback
- [x] Basic profile UI structure

### ❌ Currently Mock Data (Needs Implementation)
- [ ] User exercise statistics (completed exercises, total minutes, streak days)
- [ ] Weekly goal progress calculation
- [ ] Achievement system based on real progress
- [ ] Settings screens functionality
- [ ] Profile editing capabilities

## Database Schema Reference

### Available Tables:
- `profiles` - User profile data ✅ (already connected)
- `user_exercises` - Exercise completion tracking 🔄 (needs connection)
- `user_goals` - Formal goal tracking 🔄 (needs connection)
- `exercises` - Available exercises ✅ (available)
- `workout_plans` - Custom workout plans 🔄 (future use)

## Implementation Tasks

### Phase 1: Statistics Dashboard (Real Data Connection)

#### Task 1.1: User Exercise Statistics Service ✅ COMPLETED
- [x] **Create `UserStatsService`** 
  - [x] Create `services/userStats.ts` file
  - [x] Implement `getCompletedExercisesCount(userId)` function
  - [x] Implement `getTotalMinutesExercised(userId)` function
  - [x] Implement `getCurrentStreak(userId)` function
  - [x] Add proper error handling and loading states

#### Task 1.2: Replace Mock Stats in Profile Component ✅ COMPLETED
- [x] **Update `profile.tsx` stats calculation**
  - [x] Remove hardcoded `ProfileStats` mock data (lines 24-29)
  - [x] Add loading state for stats
  - [x] Implement `useUserStats` hook to fetch real stats
  - [x] Add error handling for failed stats fetching
  - [x] Update UI to show loading skeleton while fetching

#### Task 1.3: Weekly Goal Progress System ✅ COMPLETED
- [x] **Implement weekly goal tracking**
  - [x] Create `getWeeklyProgress(userId)` function in UserStatsService
  - [x] Calculate progress based on user's weekly exercise goal
  - [x] Allow users to set/modify weekly goals (updateWeeklyGoal function)
  - [x] Store weekly goals in `profiles` table (added weekly_goal_minutes column)

### Phase 2: Achievement System (Real Progress-Based)

#### Task 2.1: Achievement Logic System
- [ ] **Create `AchievementService`**
  - [ ] Create `services/achievements.ts` file
  - [ ] Define achievement criteria (first exercise, 7-day streak, 50 exercises, etc.)
  - [ ] Implement `checkAchievements(userId)` function
  - [ ] Create achievement progress tracking logic

#### Task 2.2: Achievement Data Structure
- [ ] **Update achievement system**
  - [ ] Replace hardcoded achievements array (lines 38-42)
  - [ ] Create dynamic achievement loading
  - [ ] Add achievement unlocking timestamps
  - [ ] Consider adding achievement table to database for scalability

#### Task 2.3: Real-time Achievement Updates
- [ ] **Implement achievement checking on exercise completion**
  - [ ] Trigger achievement check when user completes exercise
  - [ ] Show achievement unlock notifications
  - [ ] Update achievement display in real-time

### Phase 3: Settings and Profile Management

#### Task 3.1: Profile Editing Screen
- [ ] **Create profile edit functionality**
  - [ ] Create `EditProfileScreen.tsx` component
  - [ ] Implement editable fields (name, avatar, fitness level, goals, medical conditions)
  - [ ] Add image picker for avatar upload
  - [ ] Connect to `updateProfile` function from AuthContext
  - [ ] Add validation for profile fields

#### Task 3.2: Settings Screens Implementation
- [ ] **Implement settings navigation**
  - [ ] Create `SettingsScreen.tsx` for general app settings
  - [ ] Create `NotificationsScreen.tsx` for notification preferences
  - [ ] Create `PrivacyScreen.tsx` for data management
  - [ ] Create `HelpScreen.tsx` with FAQ and support
  - [ ] Add navigation routing for settings screens

#### Task 3.3: Notification System
- [ ] **Implement push notifications**
  - [ ] Set up Expo notifications
  - [ ] Create reminder system for exercises
  - [ ] Allow users to customize notification preferences
  - [ ] Store notification preferences in database

### Phase 4: Enhanced Features

#### Task 4.1: Goal Management System
- [ ] **Advanced goal tracking**
  - [ ] Connect to `user_goals` table
  - [ ] Create goal creation/editing interface
  - [ ] Implement goal progress tracking
  - [ ] Add goal completion celebration

#### Task 4.2: Exercise History and Analytics
- [ ] **Detailed exercise tracking**
  - [ ] Create exercise history view
  - [ ] Add exercise completion trends
  - [ ] Implement difficulty ratings feedback
  - [ ] Show favorite exercises based on frequency

#### Task 4.3: Social Features (Future)
- [ ] **Community features**
  - [ ] Add sharing achievements capability
  - [ ] Implement leaderboards
  - [ ] Create exercise challenges between users

## Database Queries Needed

### Stats Calculation Queries
```sql
-- Completed exercises count
SELECT COUNT(*) FROM user_exercises WHERE user_id = $1;

-- Total minutes exercised
SELECT SUM(duration_completed) FROM user_exercises WHERE user_id = $1;

-- Current streak calculation
SELECT COUNT(*) FROM (
  SELECT DATE(completed_at) as exercise_date 
  FROM user_exercises 
  WHERE user_id = $1 
  GROUP BY DATE(completed_at) 
  ORDER BY exercise_date DESC
) WHERE exercise_date >= CURRENT_DATE - INTERVAL '30 days';

-- Weekly progress
SELECT SUM(duration_completed) FROM user_exercises 
WHERE user_id = $1 
AND completed_at >= DATE_TRUNC('week', CURRENT_DATE);
```

### Achievement Queries
```sql
-- First exercise completion
SELECT MIN(completed_at) FROM user_exercises WHERE user_id = $1;

-- Exercise count milestones
SELECT COUNT(*) FROM user_exercises WHERE user_id = $1;

-- Consecutive days calculation
-- (Complex query to calculate actual consecutive days)
```

## File Structure for New Components

```
services/
├── userStats.ts
├── achievements.ts
└── notifications.ts

screens/
├── EditProfileScreen.tsx
├── SettingsScreen.tsx
├── NotificationsScreen.tsx
├── PrivacyScreen.tsx
└── HelpScreen.tsx

hooks/
├── useUserStats.ts
├── useAchievements.ts
└── useNotifications.ts
```

## Implementation Priority

### ✅ High Priority (Phase 1) - COMPLETED
1. ✅ **UserStatsService creation** - Critical for removing mock data
2. ✅ **Real stats integration** - Core profile functionality  
3. ✅ **Weekly goal system** - Important user engagement feature

### Medium Priority (Phase 2-3)
4. ✅ **Achievement system** - Gamification feature
5. ✅ **Profile editing** - User control functionality
6. ✅ **Basic settings screens** - Essential app features

### Low Priority (Phase 4)
7. ✅ **Advanced analytics** - Enhanced user experience
8. ✅ **Social features** - Future engagement features

## Testing Checklist

### Unit Tests
- [ ] UserStatsService functions
- [ ] Achievement calculation logic
- [ ] Profile update functionality

### Integration Tests
- [ ] Database query performance
- [ ] Real-time stat updates
- [ ] Achievement unlocking flow

### User Experience Tests
- [ ] Loading states during data fetch
- [ ] Error handling for network issues
- [ ] Profile editing workflow
- [ ] Settings navigation flow

## Notes for Implementation

### Performance Considerations
- Implement caching for stats that don't change frequently
- Use React Query or SWR for data fetching optimization
- Consider pagination for exercise history

### Security Considerations
- Ensure RLS policies are properly configured
- Validate all user inputs in profile editing
- Secure image upload for avatars

### Accessibility
- Add proper accessibility labels
- Ensure good contrast ratios
- Support screen readers

## Completion Criteria

The Profile tab implementation will be considered complete when:
- [ ] All mock data is replaced with real database queries
- [ ] Users can edit their profile information
- [ ] Achievement system works based on real progress
- [ ] Settings screens are functional
- [ ] All features are tested and performant
- [ ] UI/UX is polished and accessible

---

**Next Steps**: Start with Phase 1 Task 1.1 - Create the UserStatsService to replace mock statistics with real data from the user_exercises table. 