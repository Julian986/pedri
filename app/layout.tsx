import type { Metadata } from 'next'
import './globals.css'
import RegisterServiceWorker from './register-sw'
import { ModalProvider } from '@/contexts/ModalContext'
import BottomNavWrapper from '@/components/BottomNavWrapper'

import { Analytics } from '@vercel/analytics/react'

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
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <ModalProvider>
          <RegisterServiceWorker />
          <div className="pb-16 md:pb-0">
            {children}
          </div>
          <BottomNavWrapper />
          <Analytics />
        </ModalProvider>
      </body>
    </html>
  )
}

