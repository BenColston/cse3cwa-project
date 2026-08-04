"use client";

import { downloadHtml } from "@/lib/htmlGenerators";

export function DownloadButton({
  filename,
  html,
  children = "Generate HTML",
}: {
  filename: string;
  html: string;
  children?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadHtml(filename, html)}
      className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
    >
      {children}
    </button>
  );
}
