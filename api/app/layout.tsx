import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSE3CWA API",
  description: "Backend API service for the CSE3CWA phoneme activity builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
