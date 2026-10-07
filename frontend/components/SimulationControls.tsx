"use client";

import { useState } from "react";
import { manageSimulation } from "@/lib/apiClient";

export function SimulationControls({ available, disabled, onChanged, onBusyChange }: {
  available: boolean | null;
  disabled: boolean;
  onChanged: (created: boolean) => Promise<void>;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function run(method: "POST" | "DELETE") {
    if (method === "DELETE" && !window.confirm("Remove the simulated dataset and its associated configurations and outputs? Teacher-created records will be preserved; removal is blocked if they depend on the sample list.")) return;
    setBusy(true);
    onBusyChange(true);
    setMessage("");
    setError("");
    try {
      const result = await manageSimulation(method);
      setMessage(result.message);
      await onChanged(method === "POST");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update simulated records.");
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  return (
    <section aria-labelledby="simulation-title" className="border-b border-slate-200 py-5 text-slate-800">
      <h2 id="simulation-title" className="text-lg font-bold text-slate-950">Demonstration dataset</h2>
      <p className="mt-2 text-sm">Status: {available === null ? "Dataset status unavailable" : available ? "Simulated records available" : "No simulated records"}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" disabled={disabled || busy || available !== false} onClick={() => void run("POST")} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Create sample records</button>
        <button type="button" disabled={disabled || busy || !available} onClick={() => void run("DELETE")} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60">Remove sample records</button>
      </div>
      <p role="status" className="mt-3 text-sm">{busy ? "Updating simulated records..." : message}</p>
      {error ? <p role="alert" className="mt-2 border-l-4 border-red-600 pl-3 text-sm">{error}</p> : null}
    </section>
  );
}
