import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phoneme Activity Builder",
  description:
    "Assessment 3 phoneme activity builder with stored Wordle and Word Search activities, dashboard reporting, and operational statistics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-stone-50 text-slate-950">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
