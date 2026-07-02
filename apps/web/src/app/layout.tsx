import type { Metadata } from "next";
// Self-hosted fonts (bundled into the app) so the reading experience — including
// the Amiri Arabic font — renders fully offline, with no Google Fonts CDN call.
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource/amiri/latin-400.css";
import "@fontsource/amiri/latin-700.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "./globals.css";
import { ThemeProvider } from "@hidden-hiqmah/ui/context/ThemeContext";
import { QuranAudioProvider } from "@hidden-hiqmah/ui/context/QuranAudioContext";
import { AdhanAudioProvider } from "@hidden-hiqmah/ui/context/AdhanAudioContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGateProvider } from "@/context/AuthGateContext";
import AppShellGate from "@/components/AppShellGate";

export const metadata: Metadata = {
  title: "Hidden Hiqmah — Hidden Wisdom",
  description:
    "Explore the Quran, Hadith, stories of the Prophets, and more with authentic references.",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#000" }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9a84c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AuthGateProvider>
              <QuranAudioProvider>
                <AdhanAudioProvider>
                  <AppShellGate>{children}</AppShellGate>
                </AdhanAudioProvider>
              </QuranAudioProvider>
            </AuthGateProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
