"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/settings", label: "Settings" },
];

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Assessment 1
            </p>
            <p className="truncate text-lg font-bold text-slate-950">
              Phoneme Activity Builder
            </p>
          </Link>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  pathname === item.href
                    ? "bg-teal-700 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-xl font-bold text-slate-800 md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            =
          </button>
        </div>
        {open ? (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Compact navigation">
            <div className="mx-auto grid max-w-6xl gap-2">
              {navItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    pathname === item.href
                      ? "bg-teal-700 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Benjamin Colston | Student number 22557298</span>
          <span>Frontend only | React and Next.js</span>
        </div>
      </footer>
    </div>
  );
}
