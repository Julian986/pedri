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
  // Cache busting - genera IDs únicos para cada build
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Headers personalizados
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
