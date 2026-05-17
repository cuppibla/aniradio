import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Late Night Vinyl",
  description: "A radio show hosted by Mira. Curated by Annie.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="room-glow min-h-screen">{children}</body>
    </html>
  );
}
