/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Optimizaciones para producción
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimización de fuentes
  optimizeFonts: true,
  // Compresión
  compress: true,
  // PWA y caché
  poweredByHeader: false,
}

module.exports = nextConfig
