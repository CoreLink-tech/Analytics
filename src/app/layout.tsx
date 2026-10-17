import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Analytics History Archive",
    template: "%s · Analytics History Archive",
  },
  description:
    "Preserve your website analytics, explore historical trends, and keep your data organized in one place. Your analytics shouldn't disappear just because your provider forgets them.",
  keywords: [
    "analytics archive",
    "historical analytics",
    "website traffic history",
    "CSV analytics import",
    "long-term analytics",
    "vercel analytics",
  ],
  openGraph: {
    title: "Analytics History Archive",
    description:
      "Preserve your website analytics and explore historical trends beyond your provider's retention window.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
