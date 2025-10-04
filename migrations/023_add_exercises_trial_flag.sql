-- Mark free content available without subscription
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS is_trial BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS exercises_trial_idx ON public.exercises(is_trial);


