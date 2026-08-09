import { PageIntro } from "@/components/PageIntro";
import { WordleBuilder } from "@/components/WordleBuilder";

export default function WordlePage() {
  return (
    <>
      <PageIntro eyebrow="Wordle" title="Create a phoneme-based Wordle activity.">
        <p>
          Teachers can preview a single HCE corpus target, enter guesses with a
          phoneme keyboard, and generate a classroom-ready HTML file.
        </p>
      </PageIntro>

      <WordleBuilder />
    </>
  );
}
