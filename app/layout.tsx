import "@/app/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Viewport } from "next";
import DevToolsBlocker from "@/components/common/dev-tools-blocker";
import ErrorBoundary from "@/components/common/error-boundary";
import { WebsiteSchema } from "@/components/common/website-schema";
import { Toaster } from "@/components/ui/sonner";

import { env } from "@/lib/env-validation";
import { Providers } from "./providers";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ConsentBanner } from "@/components/analytics/consent-banner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(var(--primary))" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(var(--primary))" },
  ],
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
<meta name="apple-mobile-web-app-title" content={env.NEXT_PUBLIC_STORE_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
<meta name="application-name" content={env.NEXT_PUBLIC_STORE_NAME} />
        <meta name="msapplication-TileColor" content="hsl(var(--primary))" />

        <WebsiteSchema />
      </head>
      <body className="will-change-scroll">
        <ErrorBoundary>
          <DevToolsBlocker />
          <Providers>
            <AnalyticsProvider>
              <div className="">
                {children}
              </div>
              <Toaster />
              {/* <MessagePackMonitor /> */}
              <ConsentBanner />
            </AnalyticsProvider>
          </Providers>
        </ErrorBoundary>
        {/* <ChatWidgetProvider /> */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
