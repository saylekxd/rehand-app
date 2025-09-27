-- Convert steps_json constraints for armsRaised from minShoulderHeightY to minShoulderHeightX
UPDATE public.exercises e
SET steps_json = jsonb_set(
  e.steps_json,
  '{steps}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN step ? 'constraints'
          AND (step->'constraints' ? 'armsRaised')
          AND ((step->'constraints'->'armsRaised') ? 'minShoulderHeightY')
        THEN (
          jsonb_set(
            step,
            '{constraints,armsRaised}',
            (
              (step->'constraints'->'armsRaised') - 'minShoulderHeightY'
            ) || jsonb_build_object(
              'minShoulderHeightX', step->'constraints'->'armsRaised'->'minShoulderHeightY'
            )
          )
        )
        ELSE step
      END
    )
    FROM jsonb_array_elements(e.steps_json->'steps') AS step
  )
)
WHERE e.steps_json ? 'steps';


