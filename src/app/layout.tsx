import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Track Maxes",
  description: "Track bench, squat, and power clean maxes for a team.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2f6f4f",
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
