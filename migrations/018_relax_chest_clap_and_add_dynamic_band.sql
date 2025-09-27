-- Relax chestClap thresholds (wider horizontal proximity, enable dynamic band)

UPDATE public.exercises e
SET steps_json = jsonb_set(
  e.steps_json,
  '{steps}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN idx = 1 THEN (
          jsonb_set(
            step,
            '{constraints,chestClap}',
            (
              (step->'constraints'->'chestClap') || jsonb_build_object(
                'maxDeltaY', 0.12,
                'dynamicBand', true
              )
            )
          )
        )
        ELSE step
      END
    )
    FROM (
      SELECT step, row_number() over () - 1 as idx
      FROM jsonb_array_elements(e.steps_json->'steps') AS step
    ) s
  )
)
WHERE e.title = 'Seated Cross Claps (siad)';


