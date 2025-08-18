-- Onboarding Data for adamrojek8@gmail.com
-- This script adds complete onboarding data for the user

-- OPTION 1: If user exists in auth.users but not in profiles
-- OPTION 2: If you need to create a new profile entry with known UUID

DO $$
DECLARE
    user_uuid UUID;
    auth_user_uuid UUID;
BEGIN
    -- First, try to get user ID from profiles table
    SELECT id INTO user_uuid 
    FROM public.profiles 
    WHERE email = 'adamrojek8@gmail.com';
    
    -- If user doesn't exist in profiles, check if they exist in auth.users
    IF user_uuid IS NULL THEN
        -- Try to get from auth.users (requires superuser access or service role)
        BEGIN
            SELECT id INTO auth_user_uuid 
            FROM auth.users 
            WHERE email = 'adamrojek8@gmail.com';
            
            IF auth_user_uuid IS NOT NULL THEN
                -- User exists in auth.users, create profile
                INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
                VALUES (auth_user_uuid, 'adamrojek8@gmail.com', 'Adam', 'Rojek', NOW());
                user_uuid := auth_user_uuid;
                RAISE NOTICE 'Created profile for existing auth user: %', auth_user_uuid;
            ELSE
                -- User doesn't exist anywhere, generate new UUID for manual insertion
                user_uuid := uuid_generate_v4();
                INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
                VALUES (user_uuid, 'adamrojek8@gmail.com', 'Adam', 'Rojek', NOW());
                RAISE NOTICE 'Created new profile with UUID: %. You may need to create corresponding auth.users entry.', user_uuid;
            END IF;
        EXCEPTION
            WHEN insufficient_privilege THEN
                -- Can't access auth.users, create new profile with generated UUID
                user_uuid := uuid_generate_v4();
                INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
                VALUES (user_uuid, 'adamrojek8@gmail.com', 'Adam', 'Rojek', NOW());
                RAISE NOTICE 'Created new profile with UUID: %. You may need to create corresponding auth.users entry.', user_uuid;
        END;
    END IF;
    
    -- Step 2: Update profile with onboarding information
    UPDATE public.profiles 
    SET 
        first_name = 'Adam',
        last_name = 'Rojek',
        date_of_birth = '1990-01-01', -- Adjust as needed
        gender = 'male',
        phone = '+48 123 456 789', -- Example Polish phone
        medical_conditions = ARRAY['Brak istotnych schorzeń'], -- No significant conditions
        fitness_level = 'intermediate',
        goals = ARRAY[
            'Poprawa ruchomości',
            'Wzmocnienie mięśni grzbietu', 
            'Redukcja bólu kręgosłupa',
            'Zwiększenie kondycji ogólnej'
        ],
        onboarding_completed = TRUE,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Step 3: Create initial user goals
    INSERT INTO public.user_goals (user_id, goal_type, goal_description, target_date)
    VALUES 
    (user_uuid, 'fitness', 'Wykonywanie ćwiczeń rehabilitacyjnych 5 razy w tygodniu', CURRENT_DATE + INTERVAL '3 months'),
    (user_uuid, 'strength', 'Wzmocnienie mięśni core i pleców', CURRENT_DATE + INTERVAL '2 months'),
    (user_uuid, 'flexibility', 'Poprawa ruchomości szyi i ramion', CURRENT_DATE + INTERVAL '1 month'),
    (user_uuid, 'wellness', 'Redukcja bólu kręgosłupa przez regularne ćwiczenia', CURRENT_DATE + INTERVAL '6 months');
    
    -- Step 4: Create a personalized workout plan
    WITH new_plan AS (
        INSERT INTO public.workout_plans (user_id, name, description, difficulty, estimated_duration)
        VALUES (
            user_uuid,
            'Plan rehabilitacyjny - poziom początkowy',
            'Personalizowany plan ćwiczeń skupiający się na poprawie ruchomości i wzmocnieniu mięśni stabilizujących',
            'medium',
            25
        )
        RETURNING id
    )
    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, order_index, sets, repetitions, duration_seconds, rest_seconds)
    SELECT 
        new_plan.id,
        e.id,
        row_number() OVER (ORDER BY 
            CASE e.difficulty 
                WHEN 'easy' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'hard' THEN 3 
            END,
            e.duration_minutes
        ),
        CASE 
            WHEN e.difficulty = 'easy' THEN 2
            WHEN e.difficulty = 'medium' THEN 2
            ELSE 1
        END as sets,
        CASE 
            WHEN e.category IN ('Szyja', 'Nadgarstki') THEN 8
            WHEN e.category IN ('Ramiona', 'Kolana') THEN 10
            ELSE 12
        END as repetitions,
        e.duration_minutes * 60 as duration_seconds,
        CASE 
            WHEN e.difficulty = 'easy' THEN 30
            WHEN e.difficulty = 'medium' THEN 45
            ELSE 60
        END as rest_seconds
    FROM new_plan, public.exercises e
    WHERE e.title IN (
        'Rozciąganie szyi',
        'Rotacje ramion', 
        'Rozciąganie nadgarstków',
        'Rozciąganie klatki piersiowej',
        'Wzmacnianie core',
        'Mobilizacja kolan'
    );
    
    -- Step 5: Add some initial completed exercises to show progress
    INSERT INTO public.user_exercises (user_id, exercise_id, duration_completed, difficulty_rating, notes)
    SELECT 
        user_uuid,
        e.id,
        e.duration_minutes,
        CASE 
            WHEN e.difficulty = 'easy' THEN 4
            WHEN e.difficulty = 'medium' THEN 3
            ELSE 2
        END as difficulty_rating,
        CASE 
            WHEN e.title = 'Rozciąganie szyi' THEN 'Pierwsze ćwiczenie - dobrze się czułem'
            WHEN e.title = 'Rozciąganie nadgarstków' THEN 'Ulgę w nadgarstkach po pracy przy komputerze'
            ELSE 'Ćwiczenie wykonane zgodnie z instrukcją'
        END as notes
    FROM public.exercises e
    WHERE e.title IN ('Rozciąganie szyi', 'Rozciąganie nadgarstków')
    AND e.difficulty = 'easy';
    
    RAISE NOTICE 'Onboarding data successfully added for user: %', user_uuid;
END $$; 