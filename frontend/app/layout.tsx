import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phoneme Activity Builder",
  description:
    "Assessment 1 frontend builder for phoneme-based Wordle and Word Search classroom activities.",
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
