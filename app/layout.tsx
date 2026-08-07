import type { Metadata } from "next";
import { Bungee, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Bungee({ variable: "--font-display", weight: "400", subsets: ["latin"] });
const mono = Space_Mono({ variable: "--font-mono", weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bagel Bandit — A tiny pigeon crime spree",
  description: "Steal the Everything Bagel. Evade the café staff. Become ungovernable.",
  openGraph: {
    title: "Bagel Bandit",
    description: "A tiny pigeon crime spree.",
    type: "website",
    images: [{ url: "/og.png", width: 1728, height: 907, alt: "Bagel Bandit game artwork" }],
  },
  twitter: { card: "summary_large_image", title: "Bagel Bandit", description: "A tiny pigeon crime spree.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
