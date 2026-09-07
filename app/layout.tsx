import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const instant = false;

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {

  metadataBase: new URL("https://play-on-words.vercel.app"),
  
  title: {
    default: "Play on Words",
    template: "%s | Play on Words",
  },
  description:
    "Practica diariamente tu vocabulario de inglés y español.",
  applicationName: "Play on Words",

  appleWebApp: {
    capable: true,
    title: "Play on Words",
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
