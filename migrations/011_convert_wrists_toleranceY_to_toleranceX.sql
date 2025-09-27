-- Convert steps_json constraints for wristsAtShoulderHeight from toleranceY to toleranceX
-- For each step in steps_json.steps, if constraints.wristsAtShoulderHeight.toleranceY exists,
-- move its value to toleranceX and remove toleranceY.

UPDATE public.exercises e
SET steps_json = jsonb_set(
  e.steps_json,
  '{steps}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN step ? 'constraints'
          AND (step->'constraints' ? 'wristsAtShoulderHeight')
          AND ((step->'constraints'->'wristsAtShoulderHeight') ? 'toleranceY')
        THEN (
          -- replace wristsAtShoulderHeight object
          jsonb_set(
            step,
            '{constraints,wristsAtShoulderHeight}',
            (
              (step->'constraints'->'wristsAtShoulderHeight') - 'toleranceY'
            ) || jsonb_build_object(
              'toleranceX', step->'constraints'->'wristsAtShoulderHeight'->'toleranceY'
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


