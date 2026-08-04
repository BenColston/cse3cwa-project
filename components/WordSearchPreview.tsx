import { wordSearchGrid, wordSearchWords } from "@/lib/activityData";

export function WordSearchPreview() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Fixed word list</p>
          <h2 className="text-2xl font-bold text-slate-950">
            Phoneme Word Search
          </h2>
        </div>
        <span className="w-fit rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
          Five words
        </span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(260px,420px)_1fr]">
        <div
          className="grid grid-cols-8 gap-1"
          aria-label="Word search preview grid"
        >
          {wordSearchGrid.flat().map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="grid aspect-square place-items-center rounded border border-slate-300 bg-white text-sm font-extrabold text-slate-900 sm:text-base"
            >
              {letter}
            </span>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            Phoneme clues
          </h3>
          <ul className="mt-3 grid gap-2">
            {wordSearchWords.map((word) => (
              <li
                key={word.english}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <strong className="text-slate-950">{word.phonemes}</strong>
                <span> - {word.clue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
