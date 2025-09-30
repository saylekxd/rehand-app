-- Translate steps_json hint and success fields to English
-- Updates only hint and success text within steps array

BEGIN;

-- Overhead arm raises
UPDATE exercises
SET steps_json = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        steps_json,
        '{steps,0,hint}', '"Raise your left arm overhead and hold for 10 seconds"'
      ),
      '{steps,0,success}', '"Left arm completed"'
    ),
    '{steps,1,hint}', '"Raise your right arm overhead and hold for 10 seconds"'
  ),
  '{steps,1,success}', '"Right arm completed"'
)
WHERE id = '022484a4-304e-4c2b-b846-e15dd1d1e75b';

-- Goalpost to overhead circuit
UPDATE exercises
SET steps_json = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            steps_json,
            '{steps,0,hint}', '"Arms at shoulder height (15s)"'
          ),
          '{steps,0,success}', '"Shoulder level OK"'
        ),
        '{steps,1,hint}', '"Both arms overhead (10s)"'
      ),
      '{steps,1,success}', '"Overhead OK"'
    ),
    '{steps,2,hint}', '"Rest (10s, straight back)"'
  ),
  '{steps,2,success}', '"OK"'
)
WHERE id = 'f85170c1-f2c4-4727-915b-39081cab36c6';

-- Low-impact arm jacks
UPDATE exercises
SET steps_json = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        steps_json,
        '{steps,0,hint}', '"Arms overhead (8s), feet wide – straight back"'
      ),
      '{steps,0,success}', '"Up + wide OK"'
    ),
    '{steps,1,hint}', '"Arms down (8s), feet together – straight back"'
  ),
  '{steps,1,success}', '"Down + together OK"'
)
WHERE id = '2c1fd1ab-b2b6-4436-bbd6-2cc7df48653f';

-- Cross claps
UPDATE exercises
SET steps_json = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        steps_json,
        '{steps,0,hint}', '"Arms overhead (4s) – straight back"'
      ),
      '{steps,0,success}', '"Overhead OK"'
    ),
    '{steps,1,hint}', '"Cross hands on chest (4s)"'
  ),
  '{steps,1,success}', '"Clap OK"'
)
WHERE id = 'b755a689-de42-46b0-928b-8ca89dbd98e3';

-- Neck side tilts
UPDATE exercises
SET steps_json = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                steps_json,
                '{steps,0,hint}', '"Center (2s) – straight back"'
              ),
              '{steps,0,success}', '"Center OK"'
            ),
            '{steps,1,hint}', '"Tilt head to the left (5s)"'
          ),
          '{steps,1,success}', '"Left tilt OK"'
        ),
        '{steps,2,hint}', '"Center (2s)"'
      ),
      '{steps,2,success}', '"Center OK"'
    ),
    '{steps,3,hint}', '"Tilt head to the right (5s)"'
  ),
  '{steps,3,success}', '"Right tilt OK"'
)
WHERE id = '89c90f76-bee3-4380-87e4-6eecafc7102d';

COMMIT;
