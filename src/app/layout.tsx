import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsInit } from "./AnalyticsInit";

export const metadata: Metadata = {
  title: "VidyaAI — Adaptive Learning",
  description: "Learn anything. At your pace. Powered by Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ margin: 0, padding: 0, backgroundColor: '#0a0a0a' }}
      >
        <AnalyticsInit />
        {children}
      </body>
    </html>
  );
}
