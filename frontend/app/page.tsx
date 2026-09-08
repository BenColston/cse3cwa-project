import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";

export default function Home() {
  return (
    <>
      <PageIntro
        eyebrow="Backend implementation and database integration"
        title="Build phoneme-based classroom activities from stored data."
      >
        <p>
          This Assessment 2 version keeps the Speech Pathology activity builder
          from Assessment 1 and adds backend storage for phoneme word lists and
          saved activity settings.
        </p>
      </PageIntro>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-4">
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
            href: "/saved-data",
            title: "Saved Data",
            body: "Review word lists and activity configurations loaded from the backend API.",
          },
          {
            href: "/about",
            title: "Project Context",
            body: "Review the project scope, student details, and video explanation space.",
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
