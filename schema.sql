create extension if not exists pgcrypto;

create table if not exists athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  workout_date date not null,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists workout_lifts (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  lift_name text not null,
  target text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists lift_entries (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  workout_lift_id uuid not null references workout_lifts(id) on delete cascade,
  weight integer not null check (weight > 0 and weight <= 2000),
  reps integer not null check (reps > 0 and reps <= 2000),
  notes text,
  recorded_at timestamp with time zone default now()
);

create index if not exists workouts_workout_date_idx on workouts (workout_date);
create index if not exists workout_lifts_workout_id_idx on workout_lifts (workout_id);
create index if not exists lift_entries_workout_lift_id_idx on lift_entries (workout_lift_id);
create index if not exists lift_entries_athlete_id_idx on lift_entries (athlete_id);
create index if not exists lift_entries_recorded_at_idx on lift_entries (recorded_at desc);
