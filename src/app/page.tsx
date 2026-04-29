import { getDashboardData } from "@/lib/db";
import { TrackApp } from "./track-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboard = await getDashboardData();

  return <TrackApp dashboard={dashboard} />;
}
