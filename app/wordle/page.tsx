import { DownloadButton } from "@/components/DownloadButton";
import { PageIntro } from "@/components/PageIntro";
import { WordlePreview } from "@/components/WordlePreview";
import { generateWordleHtml } from "@/lib/htmlGenerators";

export default function WordlePage() {
  return (
    <>
      <PageIntro eyebrow="Wordle" title="Create a phoneme-based Wordle activity.">
        <p>
          Teachers can preview a single target word built from phoneme symbols,
          check the English equivalence, and generate a classroom-ready HTML
          file.
        </p>
      </PageIntro>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <WordlePreview />
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Output settings</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-700">
            <p>
              Difficulty is set to beginner and the generated file includes
              hover hints for each phoneme token.
            </p>
            <DownloadButton
              filename="phoneme-wordle.html"
              html={generateWordleHtml()}
            />
          </div>
        </aside>
      </section>
    </>
  );
}
