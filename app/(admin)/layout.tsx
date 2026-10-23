import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administração | Kizongelu',
  description: 'Painel Administrativo do Kizongelu — Gestão de Pagamentos, Preços, Fórmulas e Auditoria.',
};

/**
 * Layout Administrativo Next.js (App Router)
 * Role-Based Access Control (RBAC): Apenas utilizadores com role "admin"
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-sans antialiased">
      {children}
    </div>
  );
}
