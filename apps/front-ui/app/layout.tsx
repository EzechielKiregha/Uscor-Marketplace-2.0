import { ThemeProvider } from "@/components/theme-provider";
import { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import ClientWrapper from "./ClientWrapper";
import { LoadingProvider } from "./context/loadingContext";
import { CartProvider } from "./context/use-cart";
import "./globals.css";
import { SerwistProvider } from "./serwist";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Uscor Marketplace";
const APP_DEFAULT_TITLE = "Uscor";
const APP_TITLE_TEMPLATE = "%s";
const APP_DESCRIPTION =
  "Empowering creators and businesses through a seamless digital marketplace experience.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <LoadingProvider>
        <CartProvider>
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
                  {process.env.NODE_ENV === "production" ? (
                    <SerwistProvider swUrl="/sw.js">{children}</SerwistProvider>
                  ) : (
                    <>{children}</>
                  )}
                </ClientWrapper>
              </main>
              <Toaster />
              {/* <Toaster position='top-center' richColors /> */}
            </ThemeProvider>
          </body>
        </CartProvider>
      </LoadingProvider>
    </html>
  );
}
