import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservar · Pedri',
  description: 'Solicitá tu estadía en los alojamientos de Pedri',
};

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
