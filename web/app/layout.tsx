import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentio - AI-Powered Sentiment Analytics",
  description: "Transform customer feedback into actionable insights with AI-powered sentiment analysis",
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

