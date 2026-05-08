import type { Metadata } from 'next'
import Script from 'next/script'
import { headers } from 'next/headers'
import './globals.css'
import RegisterServiceWorker from './register-sw'
import { ModalProvider } from '@/contexts/ModalContext'
import BottomNavWrapper from '@/components/BottomNavWrapper'
import ViewportKeyboard from '@/components/ViewportKeyboard'
import SideNavWrapper from '@/components/SideNavWrapper'

import { Analytics } from '@vercel/analytics/react'
import { GA_MEASUREMENT_ID } from '@/lib/gtag'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { getRequestHostname, isPublicBookingHostname } from '@/lib/public-booking-host'

export const metadata: Metadata = {
  title: 'Pedri',
  description: 'Software hecho a medida',
  metadataBase: new URL('https://pedri.vercel.app'),
  manifest: '/manifest.json',
  themeColor: '#000000',
  openGraph: {
    title: 'Pedri',
    description: 'Software hecho a medida',
    url: 'https://pedri.vercel.app',
    siteName: 'Pedri',
    images: [
      {
        url: 'https://res.cloudinary.com/dzoupwn0e/image/upload/v1763511701/logo_4_zmpqjk.webp',
        width: 1200,
        height: 630,
        alt: 'Pedri',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pedri',
    description: 'Software hecho a medida',
    images: ['https://res.cloudinary.com/dzoupwn0e/image/upload/v1763511701/logo_4_zmpqjk.webp'],
    creator: '@pedri',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pedri',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    interactiveWidget: 'resizes-content',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const publicBooking = isPublicBookingHostname(getRequestHostname(headersList))

  const privateChrome = (
    <>
      <ViewportKeyboard />
      <RegisterServiceWorker />
      <div className="min-h-screen bg-black md:flex">
        <SideNavWrapper />
        <div
          className="flex-1 pb-16 md:pb-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--kb-inset, 0px))' }}
        >
          {children}
        </div>
      </div>
      <BottomNavWrapper />
    </>
  )

  const publicChrome = <div className="min-h-screen bg-zinc-950 antialiased">{children}</div>

  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        {/* Favicon (logo) para la pestaña del navegador */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://res.cloudinary.com/dzoupwn0e/image/upload/f_png/v1763511701/logo_4_zmpqjk.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://res.cloudinary.com/dzoupwn0e/image/upload/f_png/v1763511701/logo_4_zmpqjk.png"
        />
        <link
          rel="shortcut icon"
          href="https://res.cloudinary.com/dzoupwn0e/image/upload/f_png/v1763511701/logo_4_zmpqjk.png"
        />
      </head>
      <body>
        {/* Google Analytics (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <GoogleAnalytics />

        <ModalProvider>
          {publicBooking ? publicChrome : privateChrome}
          <Analytics />
        </ModalProvider>
      </body>
    </html>
  )
}

