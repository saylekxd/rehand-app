-- Translate exercise data to English
-- Standardizes title, description, category, and instructions columns

BEGIN;

-- Overhead arm raises (alternating hold)
UPDATE exercises
SET
  title = 'Overhead arm raises',
  description = 'Alternating overhead holds to improve shoulder mobility and strength',
  category = 'Shoulders',
  instructions = ARRAY[
    'Stand upright with a straight back',
    'Raise your left arm overhead and hold for 10 seconds',
    'Lower your arm, then raise your right arm and hold for 10 seconds',
    'Keep breathing steadily and avoid shrugging your shoulders'
  ]::text[]
WHERE id = '022484a4-304e-4c2b-b846-e15dd1d1e75b';

-- Low-impact arm jacks (seated)
UPDATE exercises
SET
  title = 'Low-impact arm jacks',
  description = 'Seated variation of jumping jacks to improve coordination and shoulder mobility',
  category = 'Shoulders',
  instructions = ARRAY[
    'Sit upright with feet flat on the floor and a straight back',
    'Raise both arms overhead and hold briefly, then lower them down',
    'Optional: Alternate moving your feet wider and narrower as you raise and lower your arms',
    'Keep breathing steadily and maintain good posture throughout'
  ]::text[]
WHERE id = '2c1fd1ab-b2b6-4436-bbd6-2cc7df48653f';

-- Neck side tilts
UPDATE exercises
SET
  title = 'Neck side tilts',
  description = 'Gentle lateral neck stretches to relieve tension and improve flexibility',
  category = 'Neck',
  instructions = ARRAY[
    'Sit upright with a straight back and shoulders relaxed',
    'Keep your chin parallel to the floor',
    'Gently tilt your head to one side without raising your shoulder',
    'Return to center and repeat on the other side',
    'Keep breathing steadily throughout the movement'
  ]::text[]
WHERE id = '89c90f76-bee3-4380-87e4-6eecafc7102d';

-- Cross claps
UPDATE exercises
SET
  title = 'Cross claps',
  description = 'Dynamic seated exercise to improve shoulder coordination and mobility',
  category = 'Shoulders',
  instructions = ARRAY[
    'Sit upright with feet flat on the floor and a straight back',
    'Raise both arms overhead, then cross your hands at your chest',
    'Return to the overhead position and repeat',
    'Maintain a moderate pace (approximately 4 seconds per position)',
    'Keep breathing steadily and maintain good posture throughout'
  ]::text[]
WHERE id = 'b755a689-de42-46b0-928b-8ca89dbd98e3';

-- Goalpost to overhead circuit
UPDATE exercises
SET
  title = 'Goalpost to overhead circuit',
  description = 'Seated shoulder strengthening exercise alternating between goalpost and overhead positions',
  category = 'Shoulders',
  instructions = ARRAY[
    'Sit upright with feet flat on the floor and a straight back',
    'Raise your arms to shoulder height with elbows bent at 90 degrees (goalpost position)',
    'Extend your arms straight overhead and hold briefly',
    'Return to goalpost position and repeat',
    'Keep breathing steadily and avoid raising your shoulders toward your ears'
  ]::text[]
WHERE id = 'f85170c1-f2c4-4727-915b-39081cab36c6';

COMMIT;
