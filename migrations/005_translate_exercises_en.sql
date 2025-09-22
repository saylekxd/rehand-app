-- Translate exercise categories and descriptions from Polish to English
-- This migration updates only known seeded rows identified by Polish titles/categories

BEGIN;

-- Translate categories
UPDATE public.exercises
SET category = CASE category
  WHEN 'Szyja' THEN 'Neck'
  WHEN 'Ramiona' THEN 'Shoulders'
  WHEN 'Plecy' THEN 'Back'
  WHEN 'Kolana' THEN 'Knees'
  WHEN 'Nadgarstki' THEN 'Wrists'
  WHEN 'Klatka piersiowa' THEN 'Chest'
  WHEN 'Uda' THEN 'Thighs'
  ELSE category
END
WHERE category IN (
  'Szyja','Ramiona','Plecy','Kolana','Nadgarstki','Klatka piersiowa','Uda'
);

-- Translate descriptions by matching Polish titles
UPDATE public.exercises
SET description = CASE title
  WHEN 'Rozciąganie szyi' THEN 'Gentle stretches for the neck muscles'
  WHEN 'Rotacje ramion' THEN 'Mobilization exercises for the shoulder joints'
  WHEN 'Wzmacnianie pleców' THEN 'Advanced exercises to strengthen the back muscles'
  WHEN 'Mobilizacja kolan' THEN 'Exercises to improve knee joint mobility'
  WHEN 'Rozciąganie nadgarstków' THEN 'Exercises for people who work at a computer'
  WHEN 'Rozciąganie klatki piersiowej' THEN 'Exercise to counteract slouching'
  WHEN 'Wzmacnianie core' THEN 'Basic exercises to strengthen the abdominal and back muscles'
  WHEN 'Rozciąganie IT band' THEN 'Exercise for runners and active people'
  WHEN 'TEST - Ręka nad głową' THEN 'Simple test exercise — raise your right arm above your head'
  WHEN 'Sekwencja rąk - góra/dół' THEN 'Sequential exercise: left arm up→down, then right arm up→down'
  ELSE description
END
WHERE title IN (
  'Rozciąganie szyi',
  'Rotacje ramion',
  'Wzmacnianie pleców',
  'Mobilizacja kolan',
  'Rozciąganie nadgarstków',
  'Rozciąganie klatki piersiowej',
  'Wzmacnianie core',
  'Rozciąganie IT band',
  'TEST - Ręka nad głową',
  'Sekwencja rąk - góra/dół'
);

COMMIT;


