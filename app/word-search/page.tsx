import { DownloadButton } from "@/components/DownloadButton";
import { PageIntro } from "@/components/PageIntro";
import { WordSearchPreview } from "@/components/WordSearchPreview";
import { generateWordSearchHtml } from "@/lib/htmlGenerators";

export default function WordSearchPage() {
  return (
    <>
      <PageIntro
        eyebrow="Word Search"
        title="Create a phoneme-recognition word search."
      >
        <p>
          This builder uses a fixed set of five phoneme-based words for
          Assessment 1 and previews the activity before downloading a standalone
          HTML page.
        </p>
      </PageIntro>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <WordSearchPreview />
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Output settings</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-700">
            <p>
              The generated file contains the grid, phoneme clues, and English
              equivalences for teacher-guided classroom use.
            </p>
            <DownloadButton
              filename="phoneme-word-search.html"
              html={generateWordSearchHtml()}
            />
          </div>
        </aside>
      </section>
    </>
  );
}
