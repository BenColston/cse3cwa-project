"use client";

import { useState } from "react";
import { recordUsageEvent, type ApiActivityConfig } from "@/lib/apiClient";
import { downloadHtml } from "@/lib/htmlGenerators";

export function DownloadButton({
  filename,
  html,
  activityType,
  children = "Generate HTML",
}: {
  filename: string;
  html: string;
  activityType: ApiActivityConfig["type"];
  children?: string;
}) {
  const [message, setMessage] = useState("");

  function generateDownload() {
    try {
      downloadHtml(filename, html);
      setMessage("HTML download started.");
      void recordUsageEvent({
        eventType: "GENERATION_SUCCEEDED",
        activityType,
      });
    } catch {
      setMessage("Could not generate or download the HTML activity.");
      void recordUsageEvent({
        eventType: "GENERATION_FAILED",
        activityType,
      });
    }
  }

  return (
    <div className="grid justify-items-start gap-2">
      <button
        type="button"
        onClick={generateDownload}
        className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
      >
        {children}
      </button>
      {message ? (
        <p className="text-sm font-semibold text-slate-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
