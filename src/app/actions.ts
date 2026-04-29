"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

export type SaveLiftState = {
  ok: boolean;
  message: string;
};

function readPositiveInt(formData: FormData, key: string) {
  const value = Number(formData.get(key));

  if (!Number.isInteger(value) || value <= 0 || value > 1500) {
    throw new Error("Enter realistic whole-number maxes for all lifts.");
  }

  return value;
}

export async function saveLiftMaxes(
  _previousState: SaveLiftState,
  formData: FormData,
): Promise<SaveLiftState> {
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return {
      ok: false,
      message: "Enter an athlete name between 2 and 80 characters.",
    };
  }

  try {
    const benchPress = readPositiveInt(formData, "bench_press");
    const squat = readPositiveInt(formData, "squat");
    const powerClean = readPositiveInt(formData, "power_clean");
    const db = getDb();

    await db.query(
      `with athlete as (
        insert into athletes (name)
        values ($1)
        on conflict (name) do update set name = excluded.name
        returning id
      )
      insert into lifts (athlete_id, bench_press, squat, power_clean)
      select id, $2, $3, $4 from athlete`,
      [name, benchPress, squat, powerClean],
    );

    revalidatePath("/");

    return {
      ok: true,
      message: "Maxes saved.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not save maxes. Try again.",
    };
  }
}
