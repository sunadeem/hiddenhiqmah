import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@hidden-hiqmah/ui/context/ThemeContext";
import { QuranAudioProvider } from "@hidden-hiqmah/ui/context/QuranAudioContext";
import { AdhanAudioProvider } from "@hidden-hiqmah/ui/context/AdhanAudioContext";
import AppShellGate from "@/components/AppShellGate";

export const metadata: Metadata = {
  title: "Hidden Hiqmah — Hidden Wisdom",
  description:
    "Explore the Quran, Hadith, stories of the Prophets, and more with authentic references.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Cormorant+Garamond:ital@1&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9a84c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <QuranAudioProvider>
            <AdhanAudioProvider>
              <AppShellGate>{children}</AppShellGate>
            </AdhanAudioProvider>
          </QuranAudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
