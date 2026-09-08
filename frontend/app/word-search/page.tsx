import { PageIntro } from "@/components/PageIntro";
import { WordSearchBuilder } from "@/components/WordSearchBuilder";

export default function WordSearchPage() {
  return (
    <>
      <PageIntro
        eyebrow="Word Search"
        title="Create a phoneme-recognition word search."
      >
        <p>
          Teachers can use the local HCE corpus or a saved backend word list to
          generate a phoneme-token grid and download a standalone HTML activity.
        </p>
      </PageIntro>

      <WordSearchBuilder />
    </>
  );
}
