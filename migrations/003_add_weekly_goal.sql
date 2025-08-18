-- Add weekly_goal_minutes column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN weekly_goal_minutes INTEGER DEFAULT 120; 