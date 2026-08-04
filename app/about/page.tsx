import { PageIntro } from "@/components/PageIntro";

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About" title="A frontend-only builder for Assessment 1.">
        <p>
          This project is a Wordle-style web application builder for Speech
          Pathology students and teachers. Assessment 1 focuses on responsive
          frontend design, usability, accessibility, and component structure.
        </p>
      </PageIntro>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Student details</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="font-bold text-slate-950">Name</dt>
              <dd className="text-slate-700">Benjamin Colston</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-950">Student number</dt>
              <dd className="text-slate-700">22557298</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Video explanation</h2>
          <div className="mt-4 grid min-h-56 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Add the short assessment video here before submission.
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-950">Scope</h2>
          <div className="mt-4 grid gap-4 text-slate-700 md:grid-cols-2">
            <p>
              The Wordle tool uses one phoneme-based target word for the first
              assessment stage. Later assessments can expand this into stored
              word lists and dynamic generation.
            </p>
            <p>
              The Word Search tool uses a small fixed phoneme word list and
              produces a standalone HTML activity that runs in a normal browser.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
