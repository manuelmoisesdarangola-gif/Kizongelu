/**
 * @file components/emails/CalculationReadyEmail.tsx
 * Template de Email para Conclusão de Cálculo Orçamental.
 */

import React from 'react';
import { EmailLayout } from './EmailLayout';

interface CalculationReadyEmailProps {
  nome: string;
  projectName: string;
  valor: string;
  link: string;
}

export const CalculationReadyEmail: React.FC<CalculationReadyEmailProps> = ({
  nome,
  projectName,
  valor,
  link,
}) => {
  return (
    <EmailLayout
      title="O seu Orçamento de Construção está Pronto 📐"
      previewText={`O cálculo do projecto ${projectName} foi concluído com sucesso.`}
    >
      <p>Olá <strong>{nome}</strong>,</p>
      <p>
        O motor de engenharia do Kizongelu concluiu o cálculo determinístico de quantidades e custos para o projecto{' '}
        <strong>"{projectName}"</strong>.
      </p>

      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '12px',
        padding: '20px',
        margin: '20px 0',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1E40AF', fontWeight: 'bold' }}>
          VALOR ESTIMADO DA OBRA
        </div>
        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F3D5C', marginTop: '4px' }}>
          {valor}
        </div>
        <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '4px' }}>
          Calibrado com os coeficientes e preços da sua província
        </div>
      </div>

      <p>
        Os 3 primeiros capítulos (Trabalhos Preparatórios, Fundações e Estrutura) já se encontram abertos para pré-visualização gratuita.
      </p>

      <div style={{ textAlign: 'center', margin: '28px 0' }}>
        <a
          href={link}
          style={{
            display: 'inline-block',
            backgroundColor: '#0F3D5C',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '14px',
          }}
        >
          Ver Pré-Visualização &rarr;
        </a>
      </div>
    </EmailLayout>
  );
};
