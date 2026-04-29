"use client";

import { useActionState } from "react";
import { saveLiftMaxes, type SaveLiftState } from "./actions";

const initialState: SaveLiftState = {
  ok: false,
  message: "",
};

export function LiftForm() {
  const [state, formAction, pending] = useActionState(
    saveLiftMaxes,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-700">
          Athlete name
        </span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          className="h-12 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          placeholder="Jordan Lee"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["bench_press", "Bench Press"],
          ["squat", "Squat"],
          ["power_clean", "Power Clean"],
        ].map(([name, label]) => (
          <label className="grid gap-2" key={name}>
            <span className="text-sm font-semibold text-stone-700">
              {label}
            </span>
            <input
              name={name}
              required
              type="number"
              inputMode="numeric"
              min={1}
              max={1500}
              className="h-12 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              placeholder="185"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {pending ? "Saving..." : "Save Maxes"}
        </button>
        {state.message ? (
          <p
            className={`text-sm font-medium ${
              state.ok ? "text-emerald-800" : "text-red-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
