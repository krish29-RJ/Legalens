import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legalens — Legal clarity for everyone",
  description: "Understand legal documents, compare agreements, and prepare your next steps with Google Gemini.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
