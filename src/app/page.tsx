import { getRecentMaxes } from "@/lib/db";
import { LiftForm } from "./lift-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recentMaxes = await getRecentMaxes();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-5xl gap-6">
        <header className="flex flex-col gap-2 border-b border-stone-300 pb-4">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
            Team strength tracker
          </p>
          <h1 className="text-3xl font-bold text-stone-950 sm:text-4xl">
            Track Maxes
          </h1>
        </header>

        <LiftForm />

        <section className="grid gap-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-bold text-stone-950">Recent Maxes</h2>
            <p className="text-sm text-stone-600">{recentMaxes.length} shown</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="bg-stone-100 text-stone-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Bench</th>
                    <th className="px-4 py-3 font-semibold">Squat</th>
                    <th className="px-4 py-3 font-semibold">Clean</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMaxes.length ? (
                    recentMaxes.map((lift) => (
                      <tr className="border-t border-stone-200" key={lift.id}>
                        <td className="px-4 py-3 font-semibold text-stone-950">
                          {lift.athlete_name}
                        </td>
                        <td className="px-4 py-3">{lift.bench_press}</td>
                        <td className="px-4 py-3">{lift.squat}</td>
                        <td className="px-4 py-3">{lift.power_clean}</td>
                        <td className="px-4 py-3 text-stone-600">
                          {new Intl.DateTimeFormat("en", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(lift.recorded_at))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-stone-600" colSpan={5}>
                        No maxes recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
