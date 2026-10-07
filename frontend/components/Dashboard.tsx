"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiMetrics, fetchApiHealth, fetchMetrics } from "@/lib/apiClient";
import { SimulationControls } from "@/components/SimulationControls";

const activityTypes = ["WORDLE", "WORD_SEARCH"] as const;
const activityNames = { WORDLE: "Wordle", WORD_SEARCH: "Word Search" };
const number = (value: number) => value.toLocaleString("en-AU");

export function Dashboard() {
  const [metrics, setMetrics] = useState<ApiMetrics | null>(null);
  const [source, setSource] = useState<"recorded" | "simulated">("recorded");
  const [simulationBusy, setSimulationBusy] = useState(false);
  const [health, setHealth] = useState<"checking" | "healthy" | "unavailable">("checking");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort(), 10000);
    const [healthResult, metricsResult] = await Promise.allSettled([
      fetchApiHealth(request.signal), fetchMetrics(request.signal, source),
    ]);
    clearTimeout(timeout);
    return { request, healthResult, metricsResult };
  }, [source]);

  const applyResults = useCallback(({ request, healthResult, metricsResult }: Awaited<ReturnType<typeof load>>) => {
    if (controller.current !== request) return;
    setHealth(healthResult.status === "fulfilled" ? "healthy" : "unavailable");
    if (metricsResult.status === "fulfilled") {
      setMetrics(metricsResult.value);
      setError("");
      setUpdatedAt(new Date());
    } else {
      setMetrics(null);
      setUpdatedAt(null);
      setError("Metrics unavailable. Check the API and database, then refresh.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load().then(applyResults);
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [load, applyResults]);

  const usage = metrics?.activityUsageByType ?? [];
  const visits = activityTypes.map((type) => usage.find((item) => item.type === type)?.count ?? 0);
  const maxVisits = Math.max(...visits);
  const mostUsed = maxVisits === 0
    ? "No usage recorded"
    : visits[0] === visits[1]
      ? "Wordle and Word Search (tie)"
      : activityNames[activityTypes[visits[0] > visits[1] ? 0 : 1]];
  const stats = metrics ? [
    ["Saved word lists", number(metrics.wordLists)],
    ["Saved configurations", number(metrics.activitiesCreated)],
    ["Stored HTML outputs", number(metrics.totalGeneratedOutputs)],
    ["Average visible page time", metrics.pagesMeasured ? `${(metrics.averageTimeOnPageMs / 1000).toFixed(1)} seconds` : "Not recorded"],
    ["Successful generations", number(metrics.successfulGenerations)],
    ["Failed generations", number(metrics.failedGenerations)],
  ] : [];

  return (
    <div className="dashboard mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
          <p className="mt-2 text-slate-600">Activity reporting</p>
        </div>
        <button type="button" disabled={loading || simulationBusy} onClick={() => {
          setLoading(true);
          setHealth("checking");
          void load().then(applyResults);
        }} className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 disabled:opacity-60">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <fieldset className="flex flex-wrap gap-4 border-b border-slate-200 py-4 text-sm text-slate-800">
        <legend className="pt-4 font-semibold">Reporting data</legend>
        {(["recorded", "simulated"] as const).map((value) => (
          <label key={value} className="flex items-center gap-2">
            <input type="radio" name="reporting-source" value={value} checked={source === value} disabled={loading || simulationBusy}
              onChange={() => { setLoading(true); setHealth("checking"); setSource(value); }} />
            {value === "recorded" ? "Recorded usage" : "Simulated demonstration"}
          </label>
        ))}
      </fieldset>
      {source === "simulated" ? <p className="border-b border-slate-200 py-3 text-sm font-semibold text-slate-800">Simulated data only. Sample outcomes are not actual activity generations or failures.</p> : null}

      <div role="status" className="flex flex-wrap justify-between gap-3 border-b border-slate-200 py-4 text-sm text-slate-700">
        <span>API health: <strong>{health === "checking" ? "Checking" : health === "healthy" ? "Healthy" : "Unavailable"}</strong></span>
        <span>{loading ? "Loading latest metrics..." : updatedAt ? `Metrics updated ${updatedAt.toLocaleTimeString("en-AU")}` : "No metrics available"}</span>
      </div>
      {!loading && (error || health === "unavailable") ? (
        <div role="alert" className="my-4 border-l-4 border-red-600 bg-white p-4 text-slate-900">
          {error || "API health unavailable. Metrics were retrieved, but the health check failed."}
        </div>
      ) : null}

      {metrics && !loading ? (
        <>
          <section aria-label="Operational alerts" className="border-b border-slate-200 py-4 text-slate-800">
            {metrics.failedGenerations > 0 ? <p role="alert" className="border-l-4 border-amber-600 pl-3">{source === "simulated" ? "Simulated warning: " : ""}{number(metrics.failedGenerations)} failed generation events recorded. {source === "simulated" ? "Demonstration only; no real failure occurred." : "Review the builder inputs and retry the affected activity."}</p> : <p>No failed generation events recorded.</p>}
            {metrics.wordLists === 0 ? <p className="mt-2">No saved word lists. <Link href="/saved-data" className="font-semibold text-teal-700 underline">Create a word list</Link></p> : null}
            {metrics.activitiesCreated === 0 ? <p className="mt-2">No saved activity configurations.</p> : null}
          </section>
          <section aria-label="Operational statistics" className="py-6">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map(([label, value]) => (
                <div key={label} className="border-b border-slate-200 pb-4">
                  <dt className="text-sm text-slate-600">{label}</dt>
                  <dd className="mt-2 text-2xl font-bold text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-slate-600">Page-time samples: {number(metrics.pagesMeasured)}. Saved totals reflect current records; usage and generation totals reflect recorded events.</p>
          </section>
          <section aria-labelledby="activity-report-title" className="border-t border-slate-200 py-6">
            <h2 id="activity-report-title" className="text-xl font-bold text-slate-950">Activity report</h2>
            <p className="my-3 text-slate-700">Most-used activity: <strong>{mostUsed}</strong></p>
            <table className="w-full table-fixed text-left text-sm text-slate-800">
              <caption className="sr-only">Saved configurations and recorded builder visits by activity type</caption>
              <thead className="border-b border-slate-300">
                <tr>
                  <th scope="col" className="py-3 pr-2">Activity</th>
                  <th scope="col" className="px-2 py-3">Saved configurations</th>
                  <th scope="col" className="pl-2 py-3">Builder visits</th>
                </tr>
              </thead>
              <tbody>
                {activityTypes.map((type, index) => (
                  <tr key={type} className="border-b border-slate-200">
                    <th scope="row" className="py-4 pr-2">{activityNames[type]}</th>
                    <td className="px-2">{number(metrics.activitiesCreatedByType[type])}</td>
                    <td className="pl-2">{number(visits[index])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-teal-700">
              <Link href="/saved-data" className="underline">Saved data and outputs</Link>
              <Link href="/wordle" className="underline">Wordle builder</Link>
              <Link href="/word-search" className="underline">Word Search builder</Link>
            </div>
          </section>
        </>
      ) : null}
      <SimulationControls available={metrics ? metrics.simulationAvailable ?? false : null} disabled={loading || !metrics}
        onBusyChange={setSimulationBusy}
        onChanged={async (created) => {
          setLoading(true);
          setHealth("checking");
          if (created && source !== "simulated") {
            setSource("simulated");
          } else {
            applyResults(await load());
          }
        }} />
    </div>
  );
}
