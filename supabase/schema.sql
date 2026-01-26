
-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- TABLES (Safe Creation)
-- ==============================================================================

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'student',
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

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.courses (
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
  average_rating numeric default 0,
  total_reviews integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade,
  title text not null,
  description text,
  "order" integer default 0,
  is_podcast boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.lessons (
  id text primary key,
  module_id text references public.modules(id) on delete cascade,
  title text not null,
  type text not null,
  content_url text,
  content_data jsonb,
  duration text,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.course_faqs (
  id uuid default uuid_generate_v4() primary key,
  course_id text references public.courses(id) on delete cascade,
  question text not null,
  answer text not null,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.course_reviews (
  id uuid default uuid_generate_v4() primary key,
  course_id text references public.courses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.enrollments (
  user_id uuid references public.profiles(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, course_id)
);

create table if not exists public.user_progress (
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete cascade,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, lesson_id)
);

create table if not exists public.transactions (
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

create table if not exists public.payment_requests (
  id uuid default uuid_generate_v4() primary key,
  student_email text not null,
  amount numeric not null,
  description text,
  status text default 'pending',
  payment_link text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.content_assets (
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
-- FUNCTIONS
-- ==============================================================================

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

-- Trigger check
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- RLS POLICIES (Safe)
-- ==============================================================================

-- Enable RLS on all tables
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
alter table public.course_faqs enable row level security;
alter table public.course_reviews enable row level security;

-- Helper macro for safe policy creation
do $$
begin
  -- PROFILES
  if not exists (select from pg_policies where policyname = 'Users can view own profile') then
    create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can view all profiles') then
    create policy "Admins can view all profiles" on public.profiles for select using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;
  if not exists (select from pg_policies where policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;

  -- CATEGORIES
  if not exists (select from pg_policies where policyname = 'Public categories are viewable by everyone') then
    create policy "Public categories are viewable by everyone" on public.categories for select using (true);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins and Instructors can manage categories') then
    create policy "Admins and Instructors can manage categories" on public.categories for all using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;

  -- COURSES
  if not exists (select from pg_policies where policyname = 'Public courses are viewable by everyone') then
    create policy "Public courses are viewable by everyone" on public.courses for select using (true);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can manage courses') then
    create policy "Admins can manage courses" on public.courses for all using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;

  -- MODULES & LESSONS
  if not exists (select from pg_policies where policyname = 'Public modules are viewable by everyone') then
    create policy "Public modules are viewable by everyone" on public.modules for select using (true);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can manage modules') then
    create policy "Admins can manage modules" on public.modules for all using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;
  if not exists (select from pg_policies where policyname = 'Public lessons are viewable by everyone') then
    create policy "Public lessons are viewable by everyone" on public.lessons for select using (true);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can manage lessons') then
    create policy "Admins can manage lessons" on public.lessons for all using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;

  -- FAQS & REVIEWS
  if not exists (select from pg_policies where policyname = 'Public can view FAQs') then
    create policy "Public can view FAQs" on public.course_faqs for select using (true);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can manage FAQs') then
    create policy "Admins can manage FAQs" on public.course_faqs for all using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;
  if not exists (select from pg_policies where policyname = 'Public can view Reviews') then
    create policy "Public can view Reviews" on public.course_reviews for select using (true);
  end if;
  if not exists (select from pg_policies where policyname = 'Authenticated users can post reviews') then
    create policy "Authenticated users can post reviews" on public.course_reviews for insert with check (auth.uid() = user_id);
  end if;

  -- ENROLLMENTS
  if not exists (select from pg_policies where policyname = 'Users can view own enrollments') then
    create policy "Users can view own enrollments" on public.enrollments for select using (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can enroll themselves') then
    create policy "Users can enroll themselves" on public.enrollments for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can view all enrollments') then
    create policy "Admins can view all enrollments" on public.enrollments for select using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can enroll users') then
    create policy "Admins can enroll users" on public.enrollments for insert with check (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;

  -- PROGRESS
  if not exists (select from pg_policies where policyname = 'Users can view own progress') then
    create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can update own progress') then
    create policy "Users can update own progress" on public.user_progress for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can delete own progress') then
    create policy "Users can delete own progress" on public.user_progress for delete using (auth.uid() = user_id);
  end if;

  -- TRANSACTIONS
  if not exists (select from pg_policies where policyname = 'Users can view own transactions') then
    create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can view all transactions') then
    create policy "Admins can view all transactions" on public.transactions for select using (public.check_user_role(ARRAY['admin', 'super_admin', 'sub_admin']));
  end if;
  if not exists (select from pg_policies where policyname = 'Users can create transactions') then
    create policy "Users can create transactions" on public.transactions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can update transactions') then
    create policy "Admins can update transactions" on public.transactions for update using (public.check_user_role(ARRAY['admin', 'super_admin', 'sub_admin']));
  end if;

  -- ASSETS & REQUESTS
  if not exists (select from pg_policies where policyname = 'Admins and Instructors can manage assets') then
    create policy "Admins and Instructors can manage assets" on public.content_assets for all using (public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin']));
  end if;
  if not exists (select from pg_policies where policyname = 'Admins can manage payment requests') then
    create policy "Admins can manage payment requests" on public.payment_requests for all using (public.check_user_role(ARRAY['admin', 'super_admin', 'sub_admin']));
  end if;

end $$;

-- Storage Policies
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'storage' and tablename = 'objects') then
      insert into storage.buckets (id, name, public) 
      values ('course-content', 'course-content', true) 
      on conflict (id) do nothing;

      if not exists (select from pg_policies where policyname = 'Admins can upload course content' and tablename = 'objects') then
        create policy "Admins can upload course content" on storage.objects for insert to authenticated with check (
          bucket_id = 'course-content' and
          public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
        );
      end if;
      
      if not exists (select from pg_policies where policyname = 'Admins can update course content' and tablename = 'objects') then
        create policy "Admins can update course content" on storage.objects for update to authenticated using (
          bucket_id = 'course-content' and
          public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
        );
      end if;

      if not exists (select from pg_policies where policyname = 'Admins can delete course content' and tablename = 'objects') then
        create policy "Admins can delete course content" on storage.objects for delete to authenticated using (
          bucket_id = 'course-content' and
          public.check_user_role(ARRAY['admin', 'super_admin', 'instructor', 'sub_admin'])
        );
      end if;

      if not exists (select from pg_policies where policyname = 'Public Access' and tablename = 'objects') then
        create policy "Public Access" on storage.objects for select using ( bucket_id = 'course-content' );
      end if;
  end if;
end $$;
