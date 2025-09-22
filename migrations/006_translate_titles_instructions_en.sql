-- Translate exercise titles and instructions from Polish to English
-- Difficulty values are already in English ('easy', 'medium', 'hard') and remain unchanged

BEGIN;

-- Update titles and instructions for known seeded exercises in a single pass
WITH mapping(title_pl, title_en, instructions_en) AS (
  VALUES
    (
      'Rozciąganie szyi',
      'Neck stretches',
      ARRAY[
        'Sit upright with a straight back',
        'Gently tilt your head to the left, aiming ear toward shoulder',
        'Feel the stretch on the right side of the neck',
        'Hold for 15–30 seconds',
        'Return to start and repeat on the other side',
        'Also move forward and backward'
      ]::text[]
    ),
    (
      'Rotacje ramion',
      'Shoulder rotations',
      ARRAY[
        'Stand tall with feet shoulder-width apart',
        'Extend your arms out at shoulder height',
        'Make small forward circles with your hands for 30 seconds',
        'Then make circles backward for 30 seconds',
        'Gradually increase the circle size',
        'Finish with gentle shoulder shakes'
      ]::text[]
    ),
    (
      'Wzmacnianie pleców',
      'Back strengthening',
      ARRAY[
        'Lie on your stomach with arms alongside your body',
        'Lift your chest off the floor, engaging back muscles',
        'Hold for 5–10 seconds',
        'Lower slowly back down',
        'Repeat 10–15 times',
        'Increase intensity by lifting your legs too'
      ]::text[]
    ),
    (
      'Mobilizacja kolan',
      'Knee mobilization',
      ARRAY[
        'Sit on a chair with a straight back',
        'Slowly straighten one leg at the knee',
        'Hold for 5 seconds',
        'Slowly bend the leg back',
        'Repeat 10 times per leg',
        'Move slowly and with control'
      ]::text[]
    ),
    (
      'Rozciąganie nadgarstków',
      'Wrist stretches',
      ARRAY[
        'Extend your arm forward with a neutral wrist',
        'With the other hand, gently pull the fingers toward you',
        'Feel a stretch in the wrist and forearm',
        'Hold for 15–30 seconds',
        'Repeat with the hand facing down',
        'Do it for both hands'
      ]::text[]
    ),
    (
      'Rozciąganie klatki piersiowej',
      'Chest stretch',
      ARRAY[
        'Stand in a doorway with hands on the frame',
        'Step forward, feeling a stretch in the chest',
        'Hold for 30 seconds',
        'Change arm height to target different areas',
        'Breathe deeply during the stretch',
        'Do not force — the stretch should feel pleasant'
      ]::text[]
    ),
    (
      'Wzmacnianie core',
      'Core strengthening',
      ARRAY[
        'Lie on your back with knees bent',
        'Hands behind head, elbows wide',
        'Lift shoulder blades off the floor without pulling the neck',
        'Engage your abdominal muscles',
        'Hold for 2–3 seconds',
        'Slowly return to the starting position'
      ]::text[]
    ),
    (
      'Rozciąganie IT band',
      'IT band stretch',
      ARRAY[
        'Stand by a wall for support',
        'Cross your legs, right behind left',
        'Lean sideways toward the wall',
        'Feel a stretch on the outer thigh',
        'Hold for 30 seconds',
        'Repeat on the other side'
      ]::text[]
    )
)
UPDATE public.exercises e
SET 
  title = m.title_en,
  instructions = m.instructions_en
FROM mapping m
WHERE e.title = m.title_pl;

-- Translate known test titles (instructions left unchanged if unknown)
UPDATE public.exercises
SET title = CASE title
  WHEN 'TEST - Ręka nad głową' THEN 'TEST - Arm overhead'
  WHEN 'Sekwencja rąk - góra/dół' THEN 'Arm sequence - up/down'
  ELSE title
END
WHERE title IN ('TEST - Ręka nad głową', 'Sekwencja rąk - góra/dół');

COMMIT;


