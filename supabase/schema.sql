
-- ==============================================================================
-- 1. CLEANUP: Drop all existing tables and functions to ensure a fresh start
-- ==============================================================================

-- Drop tables with CASCADE to remove dependent views, constraints, and policies
drop table if exists public.content_assets cascade;
drop table if exists public.payment_requests cascade;
drop table if exists public.transactions cascade;
drop table if exists public.user_progress cascade;
drop table if exists public.enrollments cascade;
drop table if exists public.lessons cascade;
drop table if exists public.modules cascade;
drop table if exists public.courses cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

-- Drop custom functions
drop function if exists increment_xp cascade;
drop function if exists handle_new_user cascade;
drop function if exists public.check_user_role cascade;

-- Clean up storage policies (We cannot drop storage.objects, only policies on it)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'storage' and tablename = 'objects') then
    drop policy if exists "Admins can upload course content" on storage.objects;
    drop policy if exists "Admins can update course content" on storage.objects;
    drop policy if exists "Admins can delete course content" on storage.objects;
    drop policy if exists "Public Access" on storage.objects;
  end if;
end $$;

-- ==============================================================================
-- 2. SCHEMA CREATION
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'student', -- Using TEXT to prevent ENUM conflicts
  avatar text,
  bio text,
  xp integer default 0,
  streak integer default 0,
  total_hours numeric default 0,
  status text default 'Active',
  last_active timestamp with time zone,
  permissions text[],
  expertise text[],
  job_title text,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CATEGORIES
create table public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. COURSES
create table public.courses (
  id text primary key,
  title text not null,
  description text,
  thumbnail text,
  instructor text,
  instructor_id uuid references public.profiles(id),
  price numeric default 0,
  level text,
  category text,
  enrolled_students integer default 0,
  published boolean default false,
  learning_outcomes text[],
  total_modules integer default 0,
  duration text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. MODULES
create table public.modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade,
  title text not null,
  description text,
  "order" integer default 0,
  is_podcast boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. LESSONS
create table public.lessons (
  id text primary key,
  module_id text references public.modules(id) on delete cascade,
  title text not null,
  type text not null, -- video, reading, quiz, podcast, jupyter
  content_url text,
  content_data jsonb, -- Stores Quiz questions, Code challenge details, etc.
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
  status text not null,
  method text,
  type text,
  reference_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. PAYMENT REQUESTS
create table public.payment_requests (
  id uuid default uuid_generate_v4() primary key,
  student_email text not null,
  amount numeric not null,
  description text,
  status text default 'pending',
  payment_link text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 10. CONTENT ASSETS
create table public.content_assets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  type text not null,
  file_name text,
  file_url text,
  file_size text,
  metadata jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. FUNCTIONS (Must be before Policies)
-- ==============================================================================

-- Security Definer function to check roles without triggering recursion
-- This function runs with the privileges of the creator (postgres/admin),
-- bypassing RLS on the profiles table for the check itself.
create or replace function public.check_user_role(allowed_roles text[])
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = any(allowed_roles)
  );
end;
$$ language plpgsql security definer;

create or replace function increment_xp(x integer, user_row_id uuid)
returns void as $$
begin
  update public.profiles
  set xp = xp + x
  where id = user_row_id;
end;
$$ language plpgsql;

-- Trigger to handle new user creation from Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, avatar, created_at, updated_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Safely recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 4. RLS POLICIES
-- ==============================================================================

-- Enable RLS
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

-- PROFILES
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- CATEGORIES
create policy "Public categories are viewable by everyone" on public.categories for select using (true);
create policy "Admins and Instructors can manage categories" on public.categories for all using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);

-- COURSES
create policy "Public courses are viewable by everyone" on public.courses for select using (true);
create policy "Admins can manage courses" on public.courses for all using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);

-- MODULES
create policy "Public modules are viewable by everyone" on public.modules for select using (true);
create policy "Admins can manage modules" on public.modules for all using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);

-- LESSONS
create policy "Public lessons are viewable by everyone" on public.lessons for select using (true);
create policy "Admins can manage lessons" on public.lessons for all using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);

-- ENROLLMENTS
create policy "Users can view own enrollments" on public.enrollments for select using (auth.uid() = user_id);
create policy "Users can enroll themselves" on public.enrollments for insert with check (auth.uid() = user_id);
-- NEW: Allow Admins to see all enrollments (for student list counts and analytics)
create policy "Admins can view all enrollments" on public.enrollments for select using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);
-- NEW: Allow Admins to enroll others (Required for Transaction Approval)
create policy "Admins can enroll users" on public.enrollments for insert with check (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);

-- PROGRESS
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can delete own progress" on public.user_progress for delete using (auth.uid() = user_id);

-- TRANSACTIONS
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Admins can view all transactions" on public.transactions for select using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'sub_admin'])
);
create policy "Users can create transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Admins can update transactions" on public.transactions for update using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'sub_admin'])
);

-- CONTENT ASSETS
create policy "Admins and Instructors can manage assets" on public.content_assets for all using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
);

-- PAYMENT REQUESTS
create policy "Admins can manage payment requests" on public.payment_requests for all using (
  public.check_user_role(ARRAY['admin', 'super_admin', 'sub_admin'])
);

-- STORAGE POLICIES
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'storage' and tablename = 'objects') then
      -- Insert bucket if not exists
      insert into storage.buckets (id, name, public) 
      values ('course-content', 'course-content', true) 
      on conflict (id) do nothing;

      -- Check if we are inserting/updating/deleting in the course-content bucket
      create policy "Admins can upload course content" on storage.objects for insert to authenticated with check (
        bucket_id = 'course-content' and
        public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
      );
      create policy "Admins can update course content" on storage.objects for update to authenticated using (
        bucket_id = 'course-content' and
        public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
      );
      create policy "Admins can delete course content" on storage.objects for delete to authenticated using (
        bucket_id = 'course-content' and
        public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
      );
      create policy "Public Access" on storage.objects for select using ( bucket_id = 'course-content' ); 
  end if;
exception when others then
  raise notice 'Storage policies skipped (Extension missing or permission denied)';
end $$;
