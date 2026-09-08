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
          This page connects the frontend to the Assignment 2 API so stored
          phoneme word lists and saved activity configurations can be reviewed
          from the user interface.
        </p>
      </PageIntro>

      <SavedDataPanel />
    </>
  );
}
