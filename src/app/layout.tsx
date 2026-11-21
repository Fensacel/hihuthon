import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SocialHub — Kampus Kemang & Sudirman",
  description:
    "SocialHub: aplikasi sosial mahasiswa Kemang/Sudirman dengan prediksi kegiatan kampus berbasis poin virtual.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: ["/logo.png"],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff3f8" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

/**
 * Runs before paint so the stored / OS theme is applied without a flash.
 * Keys must match `THEME_STORAGE_KEY` in `components/ThemeToggle.tsx`.
 */
const THEME_SCRIPT = `(function(){try{var key="socialhub-theme";var stored=localStorage.getItem(key);var prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=stored==="dark"||stored==="light"?stored:(prefersDark?"dark":"light");document.documentElement.setAttribute("data-theme",theme);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${poppins.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} flex min-h-full flex-col`}
      >
        <AppStoreProvider>
          {children}
          <Toaster />
        </AppStoreProvider>
      </body>
    </html>
  );
}

