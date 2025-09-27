-- Seed: Seated Cross Claps (siad) – szybkie 4s interwały

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
  'Seated Cross Claps (siad)',
  'Szybka sekwencja w siadzie: ręce nad głowę → skrzyżuj dłonie na klatce (clap). Poprawia koordynację i mobilność barków.',
  3,
  'easy',
  'Ramiona',
  'https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Usiądź prosto, stopy płasko na podłodze',
    'Unieś ręce nad głowę, następnie skrzyżuj dłonie na klatce i wróć',
    'Tempo umiarkowanie szybkie (4 sekundy na pozycję)'
  ]::text[],
  ARRAY['deltoideus', 'pectoralis', 'trapezius']::text[],
  ARRAY[]::text[],
  '{
    "version": 1,
    "rounds": 8,
    "steps": [
      {
        "type": "timeWindow",
        "hint": "Ręce nad głowę (4 s) – proste plecy",
        "success": "Overhead OK",
        "durationMs": 4000,
        "constraints": {
          "leftArmRaised": { "minHeightX": 0.45 },
          "rightArmRaised": { "minHeightX": 0.45 },
          "uprightTorso": { "maxLeanDeg": 12 }
        }
      },
      {
        "type": "timeWindow",
        "hint": "Skrzyżuj dłonie na klatce (4 s)",
        "success": "Clap OK",
        "durationMs": 4000,
        "constraints": {
          "chestClap": { "minChestX": 0.50, "maxChestX": 0.65, "maxDeltaY": 0.08 },
          "uprightTorso": { "maxLeanDeg": 12 }
        }
      }
    ]
  }'::jsonb,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e WHERE e.title = 'Seated Cross Claps (siad)'
);


