/**
 * @file components/emails/PaymentApprovedEmail.tsx
 * Template de Email para Aprovação de Pagamento e Desbloqueio de Obra.
 */

import React from 'react';
import { EmailLayout } from './EmailLayout';

interface PaymentApprovedEmailProps {
  nome: string;
  projectName: string;
  valor: string;
  id: string;
  data: string;
  link: string;
}

export const PaymentApprovedEmail: React.FC<PaymentApprovedEmailProps> = ({
  nome,
  projectName,
  valor,
  id,
  data,
  link,
}) => {
  return (
    <EmailLayout
      title="Pagamento Confirmado e Obra Desbloqueada 🎉"
      previewText={`O pagamento de ${valor} para a obra ${projectName} foi aprovado com sucesso.`}
    >
      <p>Olá <strong>{nome}</strong>,</p>
      <p>
        Informamos que o seu pagamento por transferência/Multicaixa Express no valor de{' '}
        <strong style={{ color: '#0F3D5C' }}>{valor}</strong> referente ao projecto{' '}
        <strong>"{projectName}"</strong> foi validado com sucesso pela nossa equipa financeira.
      </p>

      <div style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '16px',
        margin: '20px 0',
      }}>
        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>DADOS DA TRANSAÇÃO</div>
        <div style={{ fontSize: '13px', margin: '4px 0' }}><strong>ID da Operação:</strong> {id}</div>
        <div style={{ fontSize: '13px', margin: '4px 0' }}><strong>Data da Validação:</strong> {data}</div>
        <div style={{ fontSize: '13px', margin: '4px 0' }}><strong>Estado:</strong> <span style={{ color: '#10B981', fontWeight: 'bold' }}>APROVADO</span></div>
      </div>

      <p>
        O seu projecto encontra-se agora com acesso integral a todos os capítulos construtivos (Cobertura, Instalações, Acabamentos), geração de autos de medição e exportação de PDF profissional com validação QR.
      </p>

      <div style={{ textAlign: 'center', margin: '28px 0' }}>
        <a
          href={link}
          style={{
            display: 'inline-block',
            backgroundColor: '#10B981',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
          }}
        >
          Aceder ao Caderno Técnico &rarr;
        </a>
      </div>

      <p style={{ fontSize: '12px', color: '#64748B' }}>
        Caso necessite de fatura pró-forma ou assistência adicional, responda diretamente a este email ou contacte o nosso suporte via WhatsApp.
      </p>
    </EmailLayout>
  );
};
