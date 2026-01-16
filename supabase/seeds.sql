
-- Enable pgcrypto for password hashing
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. AUTH USER CREATION HELPER
-- ==============================================================================
-- This function safely creates a user in auth.users and public.profiles
-- Password defaults to 'password' if creating new.
create or replace function public.create_user_seed(
    email text,
    password text,
    user_role text,
    full_name text
) returns uuid as $$
declare
  user_id uuid;
  encrypted_pw text;
begin
  -- 1. Check if user already exists in auth.users
  select id into user_id from auth.users where auth.users.email = create_user_seed.email;

  -- 2. If not, create in auth.users
  if user_id is null then
    -- Generate UUID
    user_id := gen_random_uuid();
    -- Hash Password
    encrypted_pw := crypt(password, gen_salt('bf'));

    -- Insert into auth.users
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      create_user_seed.email,
      encrypted_pw,
      now(),
      null,
      now(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('full_name', full_name, 'role', user_role),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert into auth.identities (Required for login)
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      user_id,
      jsonb_build_object('sub', user_id, 'email', create_user_seed.email),
      'email',
      user_id,
      now(),
      now(),
      now()
    );
  end if;

  -- 3. Upsert into public.profiles (Ensure role is correct even if user existed)
  insert into public.profiles (id, email, full_name, role, avatar, bio, status)
  values (
    user_id, 
    create_user_seed.email, 
    full_name, 
    user_role, 
    'https://ui-avatars.com/api/?name=' || replace(full_name, ' ', '+') || '&background=random',
    'User created via seed script',
    'Active'
  )
  on conflict (id) do update 
  set role = EXCLUDED.role, full_name = EXCLUDED.full_name;

  return user_id;
end;
$$ language plpgsql;

-- ==============================================================================
-- 2. CREATE REQUESTED USERS
-- ==============================================================================

-- Admin
select public.create_user_seed('kotekarpraveen@gmail.com', 'password', 'admin', 'Praveen Kotekar (Admin)');

-- Instructor
select public.create_user_seed('kotekarrashmip@gmail.com', 'password', 'instructor', 'Rashmi P Kotekar');

-- Student
select public.create_user_seed('kotekarpraveen23@gmail.com', 'password', 'student', 'Praveen Student');


-- ==============================================================================
-- 3. SEED COURSE DATA
-- ==============================================================================

-- Clear existing public data to avoid duplicates (optional, strictly safe due to ON CONFLICT usually)
truncate table public.enrollments, public.lessons, public.modules, public.courses, public.categories cascade;

-- CATEGORIES
insert into public.categories (id, name, slug, description, count) values
('cat_1', 'Development', 'development', 'Programming, coding, and software engineering.', 12),
('cat_2', 'Design', 'design', 'UI/UX, Graphic Design, and Art.', 8),
('cat_3', 'Data Science', 'data-science', 'AI, Machine Learning, and Statistics.', 4),
('cat_4', 'Business', 'business', 'Entrepreneurship, Strategy, and Sales.', 5),
('cat_5', 'Audio Series', 'audio-series', 'Podcast-style learning tracks.', 1);

-- COURSES
insert into public.courses (id, title, description, thumbnail, instructor, price, level, category, enrolled_students, published, learning_outcomes) values
('c1', 'Fullstack React Mastery', 'Learn to build scalable web applications from scratch using modern technologies. Master Hooks, Redux, Express, and MongoDB.', 'https://picsum.photos/id/1/800/600', 'Rashmi P Kotekar', 89.99, 'Intermediate', 'Development', 1205, true, ARRAY['Build production-ready React applications', 'Master State Management', 'Create RESTful APIs', 'Deploy to Cloud']),
('c2', 'Data Science with Python', 'Master data analysis, visualization, and machine learning algorithms using real-world datasets.', 'https://picsum.photos/id/20/800/600', 'Andrew Ng', 129.00, 'Advanced', 'Data Science', 850, true, ARRAY['Analyze complex datasets', 'Visualize data with Matplotlib', 'Build ML models']),
('c3', 'UI/UX Design Fundamentals', 'Create stunning user interfaces and experiences. Learn Figma, prototyping, and design theory.', 'https://picsum.photos/id/3/800/600', 'Gary Simon', 49.99, 'Beginner', 'Design', 3200, true, ARRAY['Master Figma', 'Understand Color Theory', 'Interactive Prototyping']),
('c_audio_1', 'Tech Talk Daily', 'Daily dose of tech news and insights for busy developers.', 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Aelgo Team', 0, 'Beginner', 'Audio Series', 5000, true, ARRAY['Stay updated', 'Learn on the go']);

-- MODULES (For Course c1)
insert into public.modules (id, course_id, title, "order", is_podcast) values
('m1', 'c1', 'Introduction to React', 1, false),
('m2', 'c1', 'Advanced State Management', 2, false),
('m3', 'c1', 'Audio Companion', 3, true);

-- MODULES (For Audio Course)
insert into public.modules (id, course_id, title, "order", is_podcast) values
('m_audio_main', 'c_audio_1', 'Season 1', 1, true);

-- LESSONS (For Module m1)
insert into public.lessons (id, module_id, title, type, content_url, duration, "order") values
('l1', 'm1', 'Why React?', 'video', 'dQw4w9WgXcQ', '5:20', 1),
('l2', 'm1', 'Virtual DOM Explained', 'reading', 'content_text', '10 min', 2),
('l3', 'm1', 'React Basics Quiz', 'quiz', null, '5 min', 3);

-- LESSONS (For Podcast Module m3)
insert into public.lessons (id, module_id, title, type, content_url, duration, "order") values
('l_audio_1', 'm3', 'React Ecosystem Overview', 'podcast', 'audio_url', '15:00', 1),
('l_audio_2', 'm3', 'Developer Career Tips', 'podcast', 'audio_url', '22:00', 2);

-- LESSONS (For Audio Course)
insert into public.lessons (id, module_id, title, type, content_url, duration, "order") values
('l_pd_1', 'm_audio_main', 'The Future of AI', 'podcast', 'url', '12:30', 1),
('l_pd_2', 'm_audio_main', 'Web3 Demystified', 'podcast', 'url', '18:45', 2);

-- Cleanup
drop function public.create_user_seed;
