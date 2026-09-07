import { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <div className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
          {children}
        </div>
      </div>
    </section>
  );
}
