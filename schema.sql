create extension if not exists pgcrypto;

create table if not exists athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

create table if not exists lifts (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  bench_press integer not null check (bench_press > 0 and bench_press <= 1500),
  squat integer not null check (squat > 0 and squat <= 1500),
  power_clean integer not null check (power_clean > 0 and power_clean <= 1500),
  recorded_at timestamp with time zone default now()
);

create index if not exists lifts_recorded_at_idx on lifts (recorded_at desc);
create index if not exists lifts_athlete_id_idx on lifts (athlete_id);
