-- Seed: Goalpost → Overhead Circuit (siad)

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
  'Goalpost → Overhead Circuit (siad)',
  'Sekwencja w siadzie: ramiona na wysokości barków (bramka) → obie ręce nad głowę → odpoczynek. Dla mobilizacji i wzmocnienia barków przy zachowaniu prostej postawy.',
  4,
  'easy',
  'Ramiona',
  'https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Usiądź prosto na krześle (stopy płasko na podłodze)',
    'Utrzymaj proste plecy (nie pochylaj tułowia)',
    'Ramiona na wysokości barków z prostymi łokciami',
    'Następnie unieś obie ręce nad głowę i utrzymaj',
    'Oddychaj spokojnie i nie unosź barków do uszu'
  ]::text[],
  ARRAY['deltoideus', 'rotator cuff', 'trapezius']::text[],
  ARRAY[]::text[],
  '{
    "version": 1,
    "rounds": 5,
    "steps": [
      {
        "type": "timeWindow",
        "hint": "Ramiona na wysokości barków (15 s)",
        "success": "Poziom barków OK",
        "durationMs": 15000,
        "constraints": {
          "wristsAtShoulderHeight": { "toleranceX": 0.08 },
          "elbowsExtended": { "minAngleDeg": 155 },
          "uprightTorso": { "maxLeanDeg": 10 }
        }
      },
      {
        "type": "timeWindow",
        "hint": "Obie ręce nad głowę (10 s)",
        "success": "Overhead OK",
        "durationMs": 10000,
        "constraints": {
          "leftArmRaised": { "minHeightX": 0.45 },
          "rightArmRaised": { "minHeightX": 0.45 },
          "uprightTorso": { "maxLeanDeg": 10 }
        }
      },
      {
        "type": "timeWindow",
        "hint": "Odpoczynek (10 s, proste plecy)",
        "success": "OK",
        "durationMs": 10000,
        "constraints": { "uprightTorso": { "maxLeanDeg": 10 } }
      }
    ]
  }'::jsonb,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e WHERE e.title = 'Goalpost → Overhead Circuit (siad)'
);


