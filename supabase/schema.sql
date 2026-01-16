
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'student',
  avatar text,
  bio text,
  xp integer default 0,
  streak integer default 0,
  total_hours numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
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
  instructor text,
  price numeric default 0,
  level text, -- Beginner, Intermediate, Advanced
  category text,
  enrolled_students integer default 0,
  published boolean default false,
  learning_outcomes text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. MODULES
create table public.modules (
  id uuid default uuid_generate_v4() primary key,
  course_id text references public.courses(id) on delete cascade,
  title text not null,
  description text,
  "order" integer default 0,
  is_podcast boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. LESSONS
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  type text not null, -- video, reading, quiz, etc.
  content_url text,
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
  lesson_id uuid references public.lessons(id) on delete cascade,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, lesson_id)
);

-- 8. TRANSACTIONS (New)
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

-- 9. PAYMENT REQUESTS (New)
create table public.payment_requests (
  id uuid default uuid_generate_v4() primary key,
  student_email text not null,
  amount numeric not null,
  description text,
  status text default 'pending', -- pending, paid
  payment_link text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Basic Setup)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.user_progress enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_requests enable row level security;

-- Policies
create policy "Public courses are viewable by everyone" on public.courses for select using (true);
create policy "Public modules are viewable by everyone" on public.modules for select using (true);
create policy "Public lessons are viewable by everyone" on public.lessons for select using (true);

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own enrollments" on public.enrollments for select using (auth.uid() = user_id);
create policy "Users can enroll themselves" on public.enrollments for insert with check (auth.uid() = user_id);

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

-- RPC Function for XP
create or replace function increment_xp(x integer, user_row_id uuid)
returns void as $$
begin
  update public.profiles
  set xp = xp + x
  where id = user_row_id;
end;
$$ language plpgsql;
