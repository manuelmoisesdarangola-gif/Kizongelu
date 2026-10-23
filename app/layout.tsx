import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Kizongelu — Plataforma de Orçamentação para Angola',
  description: 'Saiba quanto precisa para construir. Orçamentos e mapas de quantidades para obras em Angola.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
