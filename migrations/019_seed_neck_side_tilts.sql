-- Seed: Neck Side Tilts (siad) – delikatne skłony głowy w lewo/prawo

INSERT INTO public.exercises (
  title,
  description,
  duration_minutes,
  difficulty,
  category,
  image_url,
  instructions,
  muscle_groups,
  equipment,
  steps_json,
  is_active
)
SELECT
  'Neck Side Tilts (siad)',
  'Delikatne rozluźnienie szyi: przechyl głowę na lewo i prawo, wracając do centrum. Utrzymuj proste plecy.',
  3,
  'easy',
  'Szyja',
  'https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Usiądź prosto, barki rozluźnione, broda równolegle do podłogi',
    'Przechyl głowę delikatnie w jedną stronę, nie unosząc barku',
    'Wróć do centrum i powtórz na drugą stronę'
  ]::text[],
  ARRAY['sternocleidomastoideus', 'upper trapezius']::text[],
  ARRAY[]::text[],
  '{
    "version": 1,
    "rounds": 6,
    "steps": [
      {
        "type": "timeWindow",
        "hint": "Centrum (2 s) – proste plecy",
        "success": "Centrum OK",
        "durationMs": 2000,
        "constraints": {
          "headTiltNeutral": { "maxDeltaX": 0.03 },
          "headYawCenter": { "maxAbsDeltaY": 0.06 },
          "headPitchNeutral": { "maxAbsDeltaX": 0.06 },
          "uprightTorso": { "maxLeanDeg": 10 }
        }
      },
      {
        "type": "timeWindow",
        "hint": "Skłon głowy w lewo (5 s)",
        "success": "Lewy skłon OK",
        "durationMs": 5000,
        "constraints": {
          "headTiltLeft": { "minDeltaX": 0.03 },
          "uprightTorso": { "maxLeanDeg": 10 }
        }
      },
      {
        "type": "timeWindow",
        "hint": "Centrum (2 s)",
        "success": "Centrum OK",
        "durationMs": 2000,
        "constraints": {
          "headTiltNeutral": { "maxDeltaX": 0.03 },
          "headYawCenter": { "maxAbsDeltaY": 0.06 },
          "headPitchNeutral": { "maxAbsDeltaX": 0.06 },
          "uprightTorso": { "maxLeanDeg": 10 }
        }
      },
      {
        "type": "timeWindow",
        "hint": "Skłon głowy w prawo (5 s)",
        "success": "Prawy skłon OK",
        "durationMs": 5000,
        "constraints": {
          "headTiltRight": { "minDeltaX": 0.03 },
          "uprightTorso": { "maxLeanDeg": 10 }
        }
      }
    ]
  }'::jsonb,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e WHERE e.title = 'Neck Side Tilts (siad)'
);


