import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";

export default function Home() {
  return (
    <>
      <PageIntro
        eyebrow="Frontend design and usability"
        title="Build phoneme-based classroom activities without a database."
      >
        <p>
          This Assessment 1 prototype gives Speech Pathology teachers a clear
          workflow for choosing an activity, previewing phoneme content, and
          downloading a single playable HTML file for classroom use.
        </p>
      </PageIntro>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-3">
        {[
          {
            href: "/wordle",
            title: "Wordle Builder",
            body: "Create a one-word HCE phoneme Wordle activity with keyboard entry, hover hints, and answer feedback.",
          },
          {
            href: "/word-search",
            title: "Word Search Builder",
            body: "Generate a five-word phoneme-token word search designed for recognition practice.",
          },
          {
            href: "/about",
            title: "Project Context",
            body: "Review the frontend-only scope, student details, and video explanation space.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{item.body}</p>
            <span className="mt-5 inline-block text-sm font-bold text-teal-700">
              Open
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
