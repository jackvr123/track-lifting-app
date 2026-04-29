"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

export type FormState = {
  ok: boolean;
  message: string;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readPositiveInt(formData: FormData, key: string, label: string) {
  const value = Number(formData.get(key));

  if (!Number.isInteger(value) || value <= 0 || value > 2000) {
    throw new Error(`${label} must be a positive whole number.`);
  }

  return value;
}

export async function createWorkout(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = readString(formData, "title");
  const workoutDate = readString(formData, "workout_date");
  const notes = readString(formData, "notes");
  const liftLines = readString(formData, "lifts")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const plannedLifts = liftLines.map((line) => {
    const [liftName, ...targetParts] = line.split("-");

    return {
      liftName: liftName.trim().slice(0, 120),
      target: targetParts.join("-").trim().slice(0, 160),
    };
  });

  if (title.length < 3 || title.length > 120) {
    return { ok: false, message: "Give the workout a clear title." };
  }

  if (!workoutDate) {
    return { ok: false, message: "Choose a workout date." };
  }

  if (!plannedLifts.length || plannedLifts.some((lift) => !lift.liftName)) {
    return { ok: false, message: "Add at least one planned lift." };
  }

  try {
    const db = getDb();
    const workout = await db.query<{ id: string }>(
      `insert into workouts (title, workout_date, notes)
       values ($1, $2, nullif($3, ''))
       returning id`,
      [title, workoutDate, notes],
    );
    const createdWorkout = workout.rows[0];

    if (!createdWorkout) {
      throw new Error("Could not create the workout.");
    }

    for (const [index, lift] of plannedLifts.entries()) {
      await db.query(
        `insert into workout_lifts (workout_id, lift_name, target, sort_order)
         values ($1, $2, nullif($3, ''), $4)`,
        [createdWorkout.id, lift.liftName, lift.target, index],
      );
    }

    revalidatePath("/");
    return { ok: true, message: "Workout added to the calendar." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not add the workout. Try again.",
    };
  }
}

export async function logLiftEntry(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readString(formData, "name");
  const workoutLiftId = readString(formData, "workout_lift_id");
  const notes = readString(formData, "notes");

  if (name.length < 2 || name.length > 80) {
    return { ok: false, message: "Enter an athlete name." };
  }

  if (!workoutLiftId) {
    return { ok: false, message: "Choose a planned lift." };
  }

  try {
    const weight = readPositiveInt(formData, "weight", "Weight");
    const reps = readPositiveInt(formData, "reps", "Reps");
    const db = getDb();

    await db.query(
      `with athlete as (
        insert into athletes (name)
        values ($1)
        on conflict (name) do update set name = excluded.name
        returning id
      )
      insert into lift_entries (athlete_id, workout_lift_id, weight, reps, notes)
      select id, $2, $3, $4, nullif($5, '') from athlete`,
      [name, workoutLiftId, weight, reps, notes],
    );

    revalidatePath("/");
    return { ok: true, message: "Lift logged." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not log that lift.",
    };
  }
}
