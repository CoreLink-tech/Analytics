import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analytics History Archive",
  description:
    "Preserve your website analytics, explore historical trends, and keep your data organized in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
