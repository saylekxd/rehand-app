-- Insert initial exercises data
INSERT INTO public.exercises (
  title,
  description,
  duration_minutes,
  difficulty,
  category,
  image_url,
  instructions,
  muscle_groups,
  equipment
) VALUES 
(
  'Rozciąganie szyi',
  'Delikatne ćwiczenia rozciągające mięśnie szyi',
  5,
  'easy',
  'Szyja',
  'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Siedź prosto z wyprostowanymi plecami',
    'Powoli opuść głowę w lewo, starając się dotknąć uchem ramienia',
    'Poczuj rozciągnięcie po prawej stronie szyi',
    'Utrzymaj pozycję przez 15-30 sekund',
    'Wróć do pozycji wyjściowej i powtórz na drugą stronę',
    'Wykonaj również ruchy w przód i w tył'
  ],
  ARRAY['szyja', 'karki', 'górny trapez'],
  ARRAY[]::text[]
),
(
  'Rotacje ramion',
  'Ćwiczenia mobilizacyjne dla stawów ramiennych',
  8,
  'medium',
  'Ramiona',
  'https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Stań prosto z nogami na szerokość ramion',
    'Wyciągnij ręce w bok na wysokość ramion',
    'Wykonuj małe kółka rękami w przód przez 30 sekund',
    'Następnie wykonuj kółka w tył przez 30 sekund',
    'Zwiększ rozmiar kółek stopniowo',
    'Zakończ delikatnym potrząsaniem ramion'
  ],
  ARRAY['deltoideus', 'rotator cuff', 'łopatki'],
  ARRAY[]::text[]
),
(
  'Wzmacnianie pleców',
  'Zaawansowane ćwiczenia wzmacniające mięśnie grzbietu',
  12,
  'hard',
  'Plecy',
  'https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Połóż się na brzuchu z rękoma wzdłuż ciała',
    'Unieś klatkę piersiową od podłoża, napinając mięśnie pleców',
    'Utrzymaj pozycję przez 5-10 sekund',
    'Powoli wróć do pozycji wyjściowej',
    'Powtórz 10-15 razy',
    'Zwiększ intensywność unosząc również nogi'
  ],
  ARRAY['erector spinae', 'latissimus dorsi', 'rhomboids', 'trapez'],
  ARRAY[]::text[]
),
(
  'Mobilizacja kolan',
  'Ćwiczenia poprawiające ruchomość stawów kolanowych',
  10,
  'medium',
  'Kolana',
  'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Siedź na krześle z prostymi plecami',
    'Powoli wyprostuj jedną nogę w kolanie',
    'Utrzymaj pozycję przez 5 sekund',
    'Powoli zegnij nogę z powrotem',
    'Powtórz 10 razy dla każdej nogi',
    'Wykonuj ruch powoli i kontrolowanie'
  ],
  ARRAY['quadriceps', 'hamstrings', 'łydki'],
  ARRAY['krzesło']
),
(
  'Rozciąganie nadgarstków',
  'Ćwiczenia dla osób pracujących przy komputerze',
  3,
  'easy',
  'Nadgarstki',
  'https://images.pexels.com/photos/5473184/pexels-photo-5473184.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Wyciągnij rękę przed siebie z prostym nadgarstkiem',
    'Drugą ręką delikatnie pociągnij palce w kierunku siebie',
    'Poczuj rozciągnięcie w nadgarstku i przedramieniu',
    'Utrzymaj przez 15-30 sekund',
    'Powtórz z ręką skierowaną w dół',
    'Wykonaj dla obu rąk'
  ],
  ARRAY['flexors nadgarstka', 'extensors nadgarstka'],
  ARRAY[]::text[]
),
(
  'Rozciąganie klatki piersiowej',
  'Ćwiczenie przeciwdziałające garbieniu się',
  6,
  'easy',
  'Klatka piersiowa',
  'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Stań w drzwiach z rękami opartymi o framugę',
    'Zrób krok do przodu, czując rozciągnięcie w klatce',
    'Utrzymaj pozycję przez 30 sekund',
    'Zmień wysokość rąk dla różnych części mięśnia',
    'Oddychaj głęboko podczas rozciągania',
    'Nie forsuj - rozciąganie powinno być przyjemne'
  ],
  ARRAY['pectoralis major', 'pectoralis minor', 'deltoideus anterior'],
  ARRAY[]::text[]
),
(
  'Wzmacnianie core',
  'Podstawowe ćwiczenia wzmacniające mięśnie brzucha i pleców',
  8,
  'medium',
  'Core',
  'https://images.pexels.com/photos/3823021/pexels-photo-3823021.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Połóż się na plecach z kolanami zgiętymi',
    'Ręce za głową, łokcie szeroko',
    'Unieś łopatki od podłoża, nie ciągnij za szyję',
    'Poczuj napięcie w mięśniach brzucha',
    'Utrzymaj przez 2-3 sekundy',
    'Powoli wróć do pozycji wyjściowej'
  ],
  ARRAY['rectus abdominis', 'obliques', 'transversus abdominis'],
  ARRAY[]::text[]
),
(
  'Rozciąganie IT band',
  'Ćwiczenie dla biegaczy i aktywnych osób',
  7,
  'medium',
  'Uda',
  'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'Stań przy ścianie dla podpora',
    'Skrzyżuj nogi, prawa za lewą',
    'Pochyl się w bok w kierunku ściany',
    'Poczuj rozciągnięcie po zewnętrznej stronie uda',
    'Utrzymaj przez 30 sekund',
    'Powtórz dla drugiej strony'
  ],
  ARRAY['IT band', 'tensor fasciae latae', 'gluteus medius'],
  ARRAY[]::text[]
); 