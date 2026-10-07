import { PageIntro } from "@/components/PageIntro";
import { SavedDataPanel } from "@/components/SavedDataPanel";

export default function SavedDataPage() {
  return (
    <>
      <PageIntro
        eyebrow="Saved Data"
        title="Review word lists and activity settings from the backend."
      >
        <p>
          Review stored phoneme word lists, saved activity configurations, and
          generated HTML outputs. Demonstration records are labelled separately
          from teacher-created content.
        </p>
      </PageIntro>

      <SavedDataPanel />
    </>
  );
}
