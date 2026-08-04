import { PageIntro } from "@/components/PageIntro";
import { ThemeControls } from "@/components/ThemeControls";

export default function SettingsPage() {
  return (
    <>
      <PageIntro eyebrow="Settings" title="Adjust interface preferences.">
        <p>
          These controls demonstrate the planned settings surface for teachers,
          including a light or dark theme preference stored in cookies.
        </p>
      </PageIntro>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <ThemeControls />
      </section>
    </>
  );
}
