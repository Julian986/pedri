import type { Metadata } from 'next'
import './globals.css'
import RegisterServiceWorker from './register-sw'
import { ModalProvider } from '@/contexts/ModalContext'
import BottomNavWrapper from '@/components/BottomNavWrapper'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'Pedri',
  description: 'Software hecho a medida',
  manifest: '/manifest.json',
  themeColor: '#000000',
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

