-- Insert exercise: Raise left arm above head for 10s, then right arm for 10s
-- Uses timeWindow steps with pose constraints leftArmRaised/rightArmRaised

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
  'Uniesienia rąk nad głowę (lewa 10s, prawa 10s)' AS title,
  'Podnieś lewą rękę nad głowę i utrzymaj przez 10 sekund, następnie powtórz dla prawej ręki.' AS description,
  2 AS duration_minutes,
  'easy' AS difficulty,
  'Ramiona' AS category,
  'https://images.pexels.com/photos/3912474/pexels-photo-3912474.jpeg?auto=compress&cs=tinysrgb&w=800' AS image_url,
  ARRAY[
    'Stań prosto, wyprostuj plecy',
    'Podnieś lewą rękę nad głowę i utrzymaj pozycję przez 10 sekund',
    'Opuść rękę, następnie podnieś prawą rękę i utrzymaj przez 10 sekund',
    'Oddychaj spokojnie, nie unoś barków'
  ]::text[] AS instructions,
  ARRAY['deltoideus', 'trapezius', 'rotator cuff']::text[] AS muscle_groups,
  ARRAY[]::text[] AS equipment,
  '{
    "version": 1,
    "steps": [
      {
        "type": "timeWindow",
        "hint": "Podnieś lewą rękę nad głowę i utrzymaj 10 sekund",
        "success": "Lewa ręka zaliczona",
        "durationMs": 10000,
        "constraints": { "leftArmRaised": { "minHeightX": 0.45 } }
      },
      {
        "type": "timeWindow",
        "hint": "Podnieś prawą rękę nad głowę i utrzymaj 10 sekund",
        "success": "Prawa ręka zaliczona",
        "durationMs": 10000,
        "constraints": { "rightArmRaised": { "minHeightX": 0.45 } }
      }
    ]
  }'::jsonb AS steps_json,
  TRUE AS is_active
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e WHERE e.title = 'Uniesienia rąk nad głowę (lewa 10s, prawa 10s)'
);


