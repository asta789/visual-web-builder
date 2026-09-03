import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Web Builder",
  description: "Build responsive websites visually with reusable assets and live previews.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
