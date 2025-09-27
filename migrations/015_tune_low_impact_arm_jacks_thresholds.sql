-- Tune thresholds for Low‑Impact Arm Jacks (siad):
-- Step 2 (arms down + feet together) was too strict.
-- Relax arms-down height and feet-together separation; increase torso tolerance slightly.

UPDATE public.exercises e
SET steps_json = jsonb_set(
  e.steps_json,
  '{steps}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN idx = 1 THEN (
          -- step index 1 (second step)
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(step,
                  '{constraints,leftArmLowered}',
                  jsonb_build_object('maxHeightX', 0.70)
                ),
                '{constraints,rightArmLowered}',
                jsonb_build_object('maxHeightX', 0.70)
              ),
              '{constraints,feetTogether}',
              jsonb_build_object('maxDeltaY', 0.16)
            ),
            '{constraints,uprightTorso}',
            jsonb_build_object('maxLeanDeg', 15)
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


