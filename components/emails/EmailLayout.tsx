/**
 * @file components/emails/EmailLayout.tsx
 * Layout base padrão para todos os templates de Email da plataforma (React Email style).
 * Header institucional com logo Kizongelu e footer com requisitos legais.
 */

import React from 'react';

interface EmailLayoutProps {
  previewText?: string;
  title: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  previewText,
  title,
  children,
}) => {
  return (
    <div style={{
      backgroundColor: '#F8FAFC',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      padding: '32px 16px',
      color: '#0F172A',
    }}>
      {previewText && (
        <span style={{ display: 'none', fontSize: '1px', color: '#fff', maxHeight: '0px', opacity: 0 }}>
          {previewText}
        </span>
      )}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}>
        {/* Header */}
        <div style={{ backgroundColor: '#0F3D5C', padding: '24px 32px', color: '#ffffff' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Kizongelu
          </div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '1px', fontWeight: 'bold', marginTop: '2px' }}>
            Plataforma Oficial de Engenharia de Custos e Orçamentos de Angola
          </div>
        </div>

        {/* Título & Corpo */}
        <div style={{ padding: '32px', lineHeight: 1.6, fontSize: '14px', color: '#334155' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>
            {title}
          </h2>
          {children}
        </div>

        {/* Rodapé Padrão */}
        <div style={{
          backgroundColor: '#F1F5F9',
          borderTop: '1px solid #E2E8F0',
          padding: '20px 32px',
          fontSize: '11px',
          color: '#64748B',
          lineHeight: 1.5,
        }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#475569' }}>
            Kizongelu &bull; República de Angola
          </p>
          <p style={{ margin: 0 }}>
            Este é um email automático de serviço enviado com base nas suas preferências. Aceda ao painel de definições para personalizar os seus canais de notificação.
          </p>
        </div>
      </div>
    </div>
  );
};
