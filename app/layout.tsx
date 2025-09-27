import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import type { Viewport } from "next";
import "./globals.css";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SchemaMarkup } from "@/components/common/schema-markup";
import { Providers } from "./providers";
import { CookieBanner } from "@/components/common/cookie-banner";
import { PWAProvider } from "@/components/pwa/pwa-provider";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ErrorBoundary from "@/components/common/error-boundary";
import DebugTracker from "@/components/common/debug-track";



export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#336571" },
		{ media: "(prefers-color-scheme: dark)", color: "#336571" },
	],
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
			<head>
				<meta name="apple-mobile-web-app-title" content="Originz" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="application-name" content="Originz" />
				<meta name="msapplication-TileColor" content="#336571" />
				<meta name="msapplication-config" content="/browserconfig.xml" />
				<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
				<link rel="manifest" href="/manifest.json" />
				<SchemaMarkup />
			</head>
			<body className='will-change-scroll'>
				<ErrorBoundary>
				<Providers>
					<PWAProvider>
						<div className="flex flex-col bg-background min-h-screen">
							<AnnouncementBar />
							<Header />
							<main className="flex-grow">{children}</main>
							<Footer />
						</div>
						<CookieBanner />
					</PWAProvider>
				</Providers>
				</ErrorBoundary>
				<Analytics />
				<SpeedInsights />
				<DebugTracker />
			</body>
		</html>
	);
}
