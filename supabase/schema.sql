
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'student', -- student, admin, instructor, etc.
  avatar text,
  bio text,
  xp integer default 0,
  streak integer default 0,
  total_hours numeric default 0,
  
  -- New fields for Role Management & Instructors
  status text default 'Active', -- Active, Inactive, Suspended
  last_active timestamp with time zone,
  permissions text[], -- Array of permission codes for admins
  expertise text[], -- Array of skills for instructors
  job_title text, -- e.g. "Senior Developer"
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CATEGORIES
create table public.categories (
  id text primary key, -- Changed to text to allow slugs like 'cat_1'
  name text not null,
  slug text not null unique,
  description text,
  count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. COURSES
create table public.courses (
  id text primary key, -- Using text ID to allow slugs or custom IDs like 'c1'
  title text not null,
  description text,
  thumbnail text,
  instructor text, -- Storing name for display simplicity, could be FK
  instructor_id uuid references public.profiles(id), -- Optional FK for strict linking
  price numeric default 0,
  level text, -- Beginner, Intermediate, Advanced
  category text,
  enrolled_students integer default 0,
  published boolean default false,
  learning_outcomes text[],
  total_modules integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. MODULES
create table public.modules (
  id text primary key, -- Changed to text for flexibility
  course_id text references public.courses(id) on delete cascade,
  title text not null,
  description text,
  "order" integer default 0,
  is_podcast boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. LESSONS
create table public.lessons (
  id text primary key, -- Changed to text for flexibility
  module_id text references public.modules(id) on delete cascade,
  title text not null,
  type text not null, -- video, reading, quiz, podcast, jupyter
  content_url text, -- URL or content reference
  duration text,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. ENROLLMENTS
create table public.enrollments (
  user_id uuid references public.profiles(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, course_id)
);

-- 7. USER PROGRESS
create table public.user_progress (
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete cascade,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, lesson_id)
);

-- 8. TRANSACTIONS
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  course_id text references public.courses(id),
  amount numeric not null,
  status text not null, -- succeeded, pending_approval, failed
  method text, -- Credit Card, Bank Transfer
  type text, -- online, offline
  reference_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. PAYMENT REQUESTS
create table public.payment_requests (
  id uuid default uuid_generate_v4() primary key,
  student_email text not null,
  amount numeric not null,
  description text,
  status text default 'pending', -- pending, paid
  payment_link text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 10. CONTENT ASSETS (New: For Course Builder Library)
create table public.content_assets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  type text not null, -- Video Content, Reading Material, etc.
  file_name text,
  file_url text, -- S3 URL or YouTube link
  file_size text,
  metadata jsonb, -- Stores extra info like code snippets, duration, etc.
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.user_progress enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_requests enable row level security;
alter table public.content_assets enable row level security;

-- Public Access Policies
create policy "Public categories are viewable by everyone" on public.categories for select using (true);
create policy "Public courses are viewable by everyone" on public.courses for select using (true);
create policy "Public modules are viewable by everyone" on public.modules for select using (true);
create policy "Public lessons are viewable by everyone" on public.lessons for select using (true);

-- Profile Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin', 'instructor'))
);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Enrollment Policies
create policy "Users can view own enrollments" on public.enrollments for select using (auth.uid() = user_id);
create policy "Users can enroll themselves" on public.enrollments for insert with check (auth.uid() = user_id);

-- Progress Policies
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can delete own progress" on public.user_progress for delete using (auth.uid() = user_id);

-- Transaction Policies
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Admins can view all transactions" on public.transactions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
create policy "Users can create transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Admins can update transactions" on public.transactions for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- Content Asset Policies
create policy "Admins and Instructors can view assets" on public.content_assets for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin', 'instructor'))
);
create policy "Admins and Instructors can insert assets" on public.content_assets for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin', 'instructor'))
);
create policy "Admins and Instructors can delete assets" on public.content_assets for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin', 'instructor'))
);

-- RPC Function for XP
create or replace function increment_xp(x integer, user_row_id uuid)
returns void as $$
begin
  update public.profiles
  set xp = xp + x
  where id = user_row_id;
end;
$$ language plpgsql;
