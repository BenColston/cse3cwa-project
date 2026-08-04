"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function readThemeCookie(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.cookie.includes("theme=dark") ? "dark" : "light";
}

function applyThemePreference(nextTheme: Theme) {
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeControls() {
  const [theme, setTheme] = useState<Theme>(() => readThemeCookie());
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950">Interface settings</h2>
      <div className="mt-5 grid gap-6">
        <fieldset>
          <legend className="text-sm font-bold uppercase tracking-wide text-slate-600">
            Theme
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["light", "dark"] as Theme[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateTheme(option)}
                className={`rounded-md border px-4 py-2 text-sm font-bold ${
                  theme === option
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {option === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex max-w-xl items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={compact}
            onChange={(event) => setCompact(event.target.checked)}
            className="mt-1"
          />
          <span>
            <strong className="block text-slate-950">Compact preview layout</strong>
            Reduces spacing in builder previews for small classroom laptops.
          </span>
        </label>
      </div>
    </section>
  );
}
