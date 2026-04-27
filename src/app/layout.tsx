import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mbakit.vercel.app"),
  title: "MBAKit - Sharp tools for MBA students",
  description:
    "Free toolkit of small, sharp tools for MBA students. No sign-up, no fluff. Cold emails, thank-you notes, resume bullets, STAR stories, coffee chat prep.",
  openGraph: {
    title: "MBAKit - Sharp tools for MBA students",
    description:
      "Free AI tools for cold emails, thank-you notes, resume bullets, STAR stories, and coffee chat prep. No sign-up required.",
    url: "https://mbakit.vercel.app",
    siteName: "MBAKit",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MBAKit - Sharp tools for MBA students",
    description:
      "Free AI tools for cold emails, thank-you notes, resume bullets, STAR stories, and coffee chat prep.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
            Built by{" "}
              <a href="https://www.linkedin.com/in/vatsal-khemani-39a483192" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground transition-colors">
                Vatsal Khemani
              </a>
              , Wharton &apos;28
          </footer>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
