-- Update the previously inserted exercise to include rounds in steps_json
UPDATE public.exercises
SET steps_json = jsonb_set(
  steps_json,
  '{rounds}',
  to_jsonb(1)
)
WHERE title = 'Uniesienia rąk nad głowę (lewa 10s, prawa 10s)'
  AND (steps_json ->> 'rounds') IS NULL;


