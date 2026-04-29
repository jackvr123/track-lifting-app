import { createPool, type VercelPool } from "@vercel/postgres";

let pool: VercelPool | null = null;

export function getDb() {
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing POSTGRES_URL or DATABASE_URL. Attach a Postgres database before saving workouts.",
    );
  }

  if (!pool) {
    pool = createPool({ connectionString });
  }

  return pool;
}

export type PlannedLift = {
  id: string;
  workout_id: string;
  workout_title: string;
  workout_date: string;
  lift_name: string;
  target: string | null;
};

export type CalendarWorkout = {
  id: string;
  title: string;
  workout_date: string;
  notes: string | null;
  lifts: string[];
  entry_count: number;
  athlete_count: number;
};

export type RecentEntry = {
  id: string;
  athlete_name: string;
  workout_title: string;
  workout_date: string;
  lift_name: string;
  target: string | null;
  weight: number;
  reps: number;
  recorded_at: string;
};

export type DashboardData = {
  plannedLifts: PlannedLift[];
  calendarWorkouts: CalendarWorkout[];
  recentEntries: RecentEntry[];
};

const emptyDashboard: DashboardData = {
  plannedLifts: [],
  calendarWorkouts: [],
  recentEntries: [],
};

function isSetupError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("Missing POSTGRES_URL") ||
      error.message.includes('relation "workouts" does not exist') ||
      error.message.includes('relation "workout_lifts" does not exist') ||
      error.message.includes('relation "lift_entries" does not exist'))
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const db = getDb();

    const [plannedLifts, calendarWorkouts, recentEntries] = await Promise.all([
      db.query<PlannedLift>(
        `select
          workout_lifts.id,
          workouts.id as workout_id,
          workouts.title as workout_title,
          workouts.workout_date::text,
          workout_lifts.lift_name,
          workout_lifts.target
        from workout_lifts
        join workouts on workouts.id = workout_lifts.workout_id
        where workouts.workout_date >= current_date - interval '7 days'
        order by workouts.workout_date asc, workout_lifts.sort_order asc
        limit 80`,
      ),
      db.query<CalendarWorkout>(
        `select
          workouts.id,
          workouts.title,
          workouts.workout_date::text,
          workouts.notes,
          coalesce(
            array_agg(workout_lifts.lift_name order by workout_lifts.sort_order)
              filter (where workout_lifts.id is not null),
            '{}'
          ) as lifts,
          count(lift_entries.id)::int as entry_count,
          count(distinct lift_entries.athlete_id)::int as athlete_count
        from workouts
        left join workout_lifts on workout_lifts.workout_id = workouts.id
        left join lift_entries on lift_entries.workout_lift_id = workout_lifts.id
        where workouts.workout_date between current_date - interval '45 days'
          and current_date + interval '45 days'
        group by workouts.id
        order by workouts.workout_date asc`,
      ),
      db.query<RecentEntry>(
        `select
          lift_entries.id,
          athletes.name as athlete_name,
          workouts.title as workout_title,
          workouts.workout_date::text,
          workout_lifts.lift_name,
          workout_lifts.target,
          lift_entries.weight,
          lift_entries.reps,
          lift_entries.recorded_at::text
        from lift_entries
        join athletes on athletes.id = lift_entries.athlete_id
        join workout_lifts on workout_lifts.id = lift_entries.workout_lift_id
        join workouts on workouts.id = workout_lifts.workout_id
        order by lift_entries.recorded_at desc
        limit 12`,
      ),
    ]);

    return {
      plannedLifts: plannedLifts.rows,
      calendarWorkouts: calendarWorkouts.rows,
      recentEntries: recentEntries.rows,
    };
  } catch (error) {
    if (isSetupError(error)) {
      return emptyDashboard;
    }

    throw error;
  }
}
