import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservar',
  description: 'Solicitá tu estadía y explorá alojamientos disponibles en Pedri.',
  alternates: {
    canonical: '/reservar',
  },
  openGraph: {
    title: 'Reservar | Pedri',
    description: 'Solicitá tu estadía y explorá alojamientos disponibles en Pedri.',
    url: 'https://pedri.vercel.app/reservar',
  },
};

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
