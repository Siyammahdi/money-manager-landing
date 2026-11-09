import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

/** Plus Jakarta has no ৳ glyph; this supplies it at matching weights. */
const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: "Money Manager · Know where every taka goes",
  description:
    "A private money manager for income, expenses, accounts and client dues. Works offline, supports two currencies, and backs up to your own Google Drive.",
  openGraph: {
    title: "Money Manager · Know where every taka goes",
    description:
      "Income, expenses, accounts and client dues in one place. Stored on your phone, backed up to your own Google Drive.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F3F4EF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${bengali.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
