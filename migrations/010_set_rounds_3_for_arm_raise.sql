-- Set rounds to 3 for the arm raise exercise
UPDATE public.exercises
SET steps_json = jsonb_set(
  steps_json,
  '{rounds}',
  to_jsonb(3),
  true
)
WHERE title = 'Uniesienia rąk nad głowę (lewa 10s, prawa 10s)';


