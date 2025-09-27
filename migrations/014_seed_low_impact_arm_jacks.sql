-- Seed: Low‑Impact Arm Jacks (siad) – ramiona + nogi

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
  'Low‑Impact Arm Jacks (siad)',
  'Łagodna wersja pajacyków w siadzie: obie ręce góra/dół z kontrolą postawy oraz ustawieniem stóp szeroko/wąsko.',
  4,
  'easy',
  'Ramiona',
  'https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Usiądź prosto na krześle, stopy na podłodze',
    'Unieś obie ręce nad głowę i utrzymaj, następnie opuść w dół',
    'Wersja z nogami: na zmianę szerzej i węziej ustaw kostki (odwiedź/zbliż stopy)'
  ]::text[],
  ARRAY['deltoideus', 'rotator cuff', 'trapezius', 'hip abductors']::text[],
  ARRAY[]::text[],
  '{
    "version": 1,
    "rounds": 6,
    "steps": [
      {
        "type": "timeWindow",
        "hint": "Ręce nad głowę (8 s), stopy szeroko – proste plecy",
        "success": "Góra + szeroko OK",
        "durationMs": 8000,
        "constraints": {
          "leftArmRaised": { "minHeightX": 0.45 },
          "rightArmRaised": { "minHeightX": 0.45 },
          "feetWide": { "minDeltaY": 0.22 },
          "uprightTorso": { "maxLeanDeg": 12 }
        }
      },
      {
        "type": "timeWindow",
        "hint": "Ręce w dół (8 s), stopy razem – proste plecy",
        "success": "Dół + razem OK",
        "durationMs": 8000,
        "constraints": {
          "leftArmLowered": { "maxHeightX": 0.8 },
          "rightArmLowered": { "maxHeightX": 0.8 },
          "feetTogether": { "maxDeltaY": 0.12 },
          "uprightTorso": { "maxLeanDeg": 12 }
        }
      }
    ]
  }'::jsonb,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e WHERE e.title = 'Low‑Impact Arm Jacks (siad)'
);


