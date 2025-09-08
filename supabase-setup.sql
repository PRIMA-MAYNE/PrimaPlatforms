-- Catalyst Supabase Schema (core)
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text not null,
  role text not null default 'teacher',
  school_name text not null,
  phone text,
  address text,
  profile_image_url text,
  school_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Classes
create table if not exists public.classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  grade_level int not null,
  section text,
  subject text,
  teacher_id uuid,
  school_id uuid,
  academic_year text not null default to_char(now(), 'YYYY'),
  capacity int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Students
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  student_id text not null,
  first_name text not null,
  last_name text not null,
  full_name text generated always as (trim(first_name || ' ' || last_name)) stored,
  date_of_birth date,
  gender text check (gender in ('male','female')),
  class_id uuid references public.classes(id) on delete set null,
  parent_guardian_name text,
  parent_guardian_phone text,
  parent_guardian_email text,
  address text,
  enrollment_date date,
  status text not null default 'active' check (status in ('active','inactive','transferred','graduated')),
  school_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Attendance
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id text not null,
  class_id text not null,
  date date not null default current_date,
  status text not null check (status in ('present','absent','late','sick','excused')),
  time_in timestamptz,
  time_out timestamptz,
  notes text,
  marked_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, date)
);

-- Minimal RLS setup (adjust as needed)
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;

-- Allow authenticated users to read their data (broad read for demo)
create policy if not exists "Read all" on public.classes for select using (true);
create policy if not exists "Read all" on public.students for select using (true);
create policy if not exists "Read all" on public.attendance for select using (true);

-- Allow inserts/updates by authenticated users
create policy if not exists "Ins all" on public.attendance for insert with check (auth.role() = 'authenticated');
create policy if not exists "Upd all" on public.attendance for update using (auth.role() = 'authenticated');

-- Helpful index
create index if not exists idx_attendance_date_class on public.attendance(date, class_id);
