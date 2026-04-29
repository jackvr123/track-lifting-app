import { createPool, type VercelPool } from "@vercel/postgres";

let pool: VercelPool | null = null;

export function getDb() {
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing POSTGRES_URL or DATABASE_URL. Attach a Postgres database before saving lift maxes.",
    );
  }

  if (!pool) {
    pool = createPool({ connectionString });
  }

  return pool;
}

export type LiftRow = {
  id: string;
  athlete_name: string;
  bench_press: number;
  squat: number;
  power_clean: number;
  recorded_at: string;
};

export async function getRecentMaxes() {
  try {
    const db = getDb();
    const { rows } = await db.query<LiftRow>(
      `select
        lifts.id,
        athletes.name as athlete_name,
        lifts.bench_press,
        lifts.squat,
        lifts.power_clean,
        lifts.recorded_at
      from lifts
      join athletes on athletes.id = lifts.athlete_id
      order by lifts.recorded_at desc
      limit 12`,
    );

    return rows;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Missing POSTGRES_URL")
    ) {
      return [];
    }

    throw error;
  }
}
