-- Translate muscle_groups and equipment array entries from Polish to English
-- Only known Polish terms are mapped; unknown entries remain unchanged

BEGIN;

-- Helper: translate function via CASE expression embedded in array transform
-- Translate muscle_groups
UPDATE public.exercises e
SET muscle_groups = CASE 
  WHEN e.muscle_groups IS NULL THEN e.muscle_groups
  ELSE (
    SELECT array_agg(
      CASE TRIM(LOWER(elem))
        WHEN 'szyja' THEN 'neck'
        WHEN 'karki' THEN 'upper trapezius'
        WHEN 'górny trapez' THEN 'upper trapezius'
        WHEN 'łopatki' THEN 'scapulae'
        WHEN 'trapez' THEN 'trapezius'
        WHEN 'łydki' THEN 'calves'
        WHEN 'flexors nadgarstka' THEN 'wrist flexors'
        WHEN 'extensors nadgarstka' THEN 'wrist extensors'
        ELSE elem
      END
    )
    FROM unnest(e.muscle_groups) AS mg(elem)
  )
END
WHERE e.muscle_groups IS NOT NULL;

-- Translate equipment
UPDATE public.exercises e
SET equipment = CASE 
  WHEN e.equipment IS NULL THEN e.equipment
  ELSE (
    SELECT array_agg(
      CASE TRIM(LOWER(elem))
        WHEN 'krzesło' THEN 'chair'
        ELSE elem
      END
    )
    FROM unnest(e.equipment) AS eq(elem)
  )
END
WHERE e.equipment IS NOT NULL;

COMMIT;


