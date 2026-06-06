import type { Metadata } from "next";
import { Anton, Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fanzonstore.com"),
  title: {
    default: "Fanzonstore — World Cup 2026 Fan Gear",
    template: "%s · Fanzonstore",
  },
  description:
    "World Cup 2026 fan gear for supporters who want to belong to the moment. Shop emotional soccer apparel, fan tees, hoodies, caps, mugs, and matchday essentials at fanzonstore.com.",
  keywords: [
    "World Cup 2026",
    "World Cup 2026 fan gear",
    "fan gear",
    "USA soccer fan shirt",
    "soccer apparel",
    "supporter apparel",
    "matchday fits",
    "fanzonstore",
  ],
  openGraph: {
    title: "Fanzonstore — World Cup 2026 Fan Gear",
    description:
      "Wear your colors, carry the moment, and belong to the World Cup 2026 summer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${anton.variable} ${chakra.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
