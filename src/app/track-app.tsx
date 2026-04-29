"use client";

import { useMemo, useState, useActionState } from "react";
import type { CalendarWorkout, DashboardData } from "@/lib/db";
import { createWorkout, logLiftEntry, type FormState } from "./actions";

type Tab = "athlete" | "calendar";

const initialState: FormState = {
  ok: false,
  message: "",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function statusFor(workout: CalendarWorkout) {
  const today = new Date().toISOString().slice(0, 10);

  if (workout.workout_date < today) {
    return workout.entry_count ? "Completed" : "Past";
  }

  if (workout.workout_date === today) {
    return "Today";
  }

  return "Planned";
}

function CoachWorkoutForm() {
  const [state, formAction, pending] = useActionState(
    createWorkout,
    initialState,
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-950">Coach Workout</h2>
        <p className="text-sm text-stone-600">
          Add the lifting plan athletes will see on their page.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-700">Title</span>
          <input
            name="title"
            required
            maxLength={120}
            className="h-11 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            placeholder="Lower Body Power"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-700">Date</span>
          <input
            name="workout_date"
            required
            type="date"
            defaultValue={today}
            className="h-11 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-700">
          Planned lifts
        </span>
        <textarea
          name="lifts"
          required
          rows={4}
          className="rounded-md border border-stone-300 px-3 py-2 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          placeholder={"Back Squat - 5x3 @ 80%\nBench Press - 4x5\nPower Clean - 6x2"}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-700">Notes</span>
        <input
          name="notes"
          maxLength={240}
          className="h-11 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          placeholder="Fast reps, full rest between heavy sets"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {pending ? "Adding..." : "Add Workout"}
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

function AthleteLiftForm({ dashboard }: { dashboard: DashboardData }) {
  const [state, formAction, pending] = useActionState(
    logLiftEntry,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-950">Athlete Entry</h2>
        <p className="text-sm text-stone-600">
          Log results against the coach&apos;s planned lifts.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
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
            className="h-11 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            placeholder="Jordan Lee"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-700">
            Planned lift
          </span>
          <select
            name="workout_lift_id"
            required
            className="h-11 rounded-md border border-stone-300 bg-white px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            defaultValue=""
          >
            <option value="" disabled>
              Choose a lift
            </option>
            {dashboard.plannedLifts.map((lift) => (
              <option value={lift.id} key={lift.id}>
                {formatDate(lift.workout_date)} - {lift.lift_name}
                {lift.target ? ` (${lift.target})` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[120px_120px_1fr]">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-700">Weight</span>
          <input
            name="weight"
            required
            type="number"
            min={1}
            max={2000}
            className="h-11 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            placeholder="185"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-700">Reps</span>
          <input
            name="reps"
            required
            type="number"
            min={1}
            max={2000}
            className="h-11 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            placeholder="5"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-700">Notes</span>
          <input
            name="notes"
            maxLength={240}
            className="h-11 rounded-md border border-stone-300 px-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            placeholder="Felt smooth"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending || !dashboard.plannedLifts.length}
          className="h-11 rounded-md bg-emerald-800 px-5 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {pending ? "Logging..." : "Log Lift"}
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

function RecentEntries({ dashboard }: { dashboard: DashboardData }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-lg font-bold text-stone-950">Recent Results</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-stone-100 text-stone-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Athlete</th>
              <th className="px-4 py-3 font-semibold">Workout</th>
              <th className="px-4 py-3 font-semibold">Lift</th>
              <th className="px-4 py-3 font-semibold">Weight</th>
              <th className="px-4 py-3 font-semibold">Reps</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.recentEntries.length ? (
              dashboard.recentEntries.map((entry) => (
                <tr className="border-t border-stone-200" key={entry.id}>
                  <td className="px-4 py-3 font-semibold text-stone-950">
                    {entry.athlete_name}
                  </td>
                  <td className="px-4 py-3">{entry.workout_title}</td>
                  <td className="px-4 py-3">{entry.lift_name}</td>
                  <td className="px-4 py-3">{entry.weight}</td>
                  <td className="px-4 py-3">{entry.reps}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {formatDate(entry.workout_date)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-stone-600" colSpan={6}>
                  No athlete results have been logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CalendarView({ dashboard }: { dashboard: DashboardData }) {
  const grouped = useMemo(() => {
    return dashboard.calendarWorkouts.reduce<Record<string, CalendarWorkout[]>>(
      (groups, workout) => {
        groups[workout.workout_date] ??= [];
        groups[workout.workout_date].push(workout);
        return groups;
      },
      {},
    );
  }, [dashboard.calendarWorkouts]);

  const dates = Object.keys(grouped);

  return (
    <section className="grid gap-3">
      {dates.length ? (
        dates.map((date) => (
          <div
            className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
            key={date}
          >
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-stone-950">
                {formatDate(date)}
              </h2>
              <span className="text-sm font-semibold text-emerald-800">
                {grouped[date].length} workout
                {grouped[date].length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-3">
              {grouped[date].map((workout) => (
                <article
                  className="grid gap-3 rounded-md border border-stone-200 p-3"
                  key={workout.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-stone-950">
                        {workout.title}
                      </h3>
                      {workout.notes ? (
                        <p className="text-sm text-stone-600">
                          {workout.notes}
                        </p>
                      ) : null}
                    </div>
                    <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">
                      {statusFor(workout)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workout.lifts.map((lift) => (
                      <span
                        className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-800"
                        key={`${workout.id}-${lift}`}
                      >
                        {lift}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-stone-600">
                    {workout.entry_count} logged result
                    {workout.entry_count === 1 ? "" : "s"} from{" "}
                    {workout.athlete_count} athlete
                    {workout.athlete_count === 1 ? "" : "s"}.
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-stone-600 shadow-sm">
          No workouts are on the calendar yet.
        </div>
      )}
    </section>
  );
}

export function TrackApp({ dashboard }: { dashboard: DashboardData }) {
  const [tab, setTab] = useState<Tab>("athlete");

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
              Team strength tracker
            </p>
            <h1 className="text-3xl font-bold text-stone-950 sm:text-4xl">
              Track Maxes
            </h1>
          </div>
          <nav className="flex w-full rounded-lg border border-stone-300 bg-white p-1 sm:w-fit">
            {[
              ["athlete", "Athlete"],
              ["calendar", "Calendar"],
            ].map(([value, label]) => (
              <button
                className={`h-10 flex-1 rounded-md px-4 text-sm font-bold transition sm:flex-none ${
                  tab === value
                    ? "bg-emerald-800 text-white"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
                key={value}
                type="button"
                onClick={() => setTab(value as Tab)}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        {tab === "athlete" ? (
          <>
            <CoachWorkoutForm />
            <AthleteLiftForm dashboard={dashboard} />
            <RecentEntries dashboard={dashboard} />
          </>
        ) : (
          <CalendarView dashboard={dashboard} />
        )}
      </section>
    </main>
  );
}
