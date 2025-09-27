-- Update Low‑Impact Arm Jacks step 2 to use wristsBelowShoulders instead of individual lowered wrists

UPDATE public.exercises e
SET steps_json = jsonb_set(
  e.steps_json,
  '{steps}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN idx = 1 THEN (
          -- Replace lowered wrists with a more robust condition: both wrists below shoulders by margin
          (
            (step - 'constraints') || jsonb_build_object(
              'constraints',
              (
                (step->'constraints')
                - 'leftArmLowered'
                - 'rightArmLowered'
              ) || jsonb_build_object(
                'wristsBelowShoulders', jsonb_build_object('minDeltaX', 0.05)
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
WHERE e.title = 'Low‑Impact Arm Jacks (siad)';


