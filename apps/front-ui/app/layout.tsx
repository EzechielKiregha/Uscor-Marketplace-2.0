import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./ClientWrapper";
import { LoadingProvider } from "./context/loadingContext";
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uscor Marketplace",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  description: "Empowering creators and businesses through a seamless digital marketplace experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <LoadingProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative font-sans h-full`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="relative flex flex-col min-h-screen">
              <ClientWrapper>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ClientWrapper>
            </main>

            {/* <Toaster position='top-center' richColors /> */}
          </ThemeProvider>

        </body>
      </LoadingProvider>
    </html>
  );
}
