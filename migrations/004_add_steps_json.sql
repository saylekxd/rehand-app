-- Add steps_json column to exercises for prompt-driven session plans
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS steps_json JSONB;

-- Note: RLS policy for SELECT on public.exercises already permits authenticated users
-- to read all columns, so no additional policy changes are required here.

