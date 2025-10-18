import type { Metadata } from 'next'
import './globals.css'
import RegisterServiceWorker from './register-sw'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Gestión de Propiedades',
  description: 'Sistema de gestión de propiedades y reservas',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Propiedades',
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
        <RegisterServiceWorker />
        <div className="pb-16 md:pb-0">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  )
}

