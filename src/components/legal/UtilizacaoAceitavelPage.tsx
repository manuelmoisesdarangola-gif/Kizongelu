/**
 * @file src/components/legal/UtilizacaoAceitavelPage.tsx
 * Política de Utilização Aceitável (AUP - /utilizacao-aceitavel) — Fase 16.
 * Normas de conduta, integridade técnica e combate a fraudes em Angola.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { ShieldBan, AlertTriangle, Key, Scale, FileWarning, Terminal } from 'lucide-react';

interface UtilizacaoAceitavelPageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const UtilizacaoAceitavelPage: React.FC<UtilizacaoAceitavelPageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Objetivo e Vinculação',
      content: (
        <>
          <p>
            A presente Política de Utilização Aceitável (Acceptable Use Policy - AUP) estabelece as condições imperativas de conduta que regem o acesso aos servidores, ferramentas de orçamentação, APIs e base de dados do Kizongelu.
          </p>
          <p>
            A utilização indevida da plataforma prejudica a integridade do ecossistema da construção civil em Angola e constitui infração suscetível de responsabilidade civil e criminal.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Proibição Absoluta de Raspagem (Scraping) e Engenharia Reversa',
      content: (
        <>
          <p>É expressamente vedado a qualquer utilizador, concorrente ou entidade externa:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              Utilizar robôs, <em>crawlers</em>, <em>spiders</em> ou scripts automatizados para extrair em massa coeficientes de rendimento, traços de betão ou tabelas de preços de materiais de Luanda e demais províncias.
            </li>
            <li>
              Realizar engenharia reversa, descompilação ou tentativa de reproduzir os algoritmos determinísticos de cálculo estrutural do motor Kizongelu.
            </li>
            <li>
              Revender, sublicenciar ou fornecer acesso não autorizado a terceiros fora da organização contratante.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Integridade de Documentos e Códigos QR',
      content: (
        <>
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-950 text-xs">
            <ShieldBan className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Aviso Legal:</strong> Os orçamentos gerados pelo Kizongelu contêm um código identificador único e um código QR de verificação pública. Qualquer tentativa de adulterar valores em Kwanzas, áreas de construção ou nomes nos documentos para apresentação a terceiros constitui crime punível nos termos da legislação angolana aplicável.
            </div>
          </div>
          <p className="mt-3">
            O Kizongelu colabora ativamente com as autoridades competentes na verificação da integridade de documentos emitidos pela plataforma.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Segurança de Credenciais e Partilha de Contas',
      content: (
        <>
          <p>
            As contas individuais são intransmissíveis. Nos planos de equipa (Empresa e Empresa Plus), o número de orçamentistas ativos deve corresponder estritamente às licenças contratadas.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>É proibida a partilha pública de senhas em fóruns ou redes sociais.</li>
            <li>O utilizador deve comunicar de imediato qualquer suspeita de comprometimento da sua conta através de <code>seguranca@kizongelu.ao</code>.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Ataques Técnicos e Tentativas de Sobrecarga (DoS)',
      content: (
        <>
          <p>São estritamente proibidas quaisquer práticas destinadas a comprometer a disponibilidade dos serviços:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Ataques de negação de serviço (DoS/DDoS) contra os nós de infraestrutura.</li>
            <li>Injeção de código malicioso, scripts maliciosos ou exploração de vulnerabilidades de software.</li>
            <li>Envio massivo de pedidos concorrentes para contornar quotas de processamento.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-6',
      title: 'Sanções, Bloqueio Imediato e Denúncia Legal',
      content: (
        <>
          <p>
            O incumprimento de qualquer disposição desta Política confere à Kizongelu Tecnologia e Engenharia Lda. o direito de:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Suspender ou encerrar de imediato a conta do infrator sem direito a qualquer indemnização ou reembolso de créditos.</li>
            <li>Invalidar os códigos QR e certificados de verificação dos orçamentos gerados fraudulentamente.</li>
            <li>Acionar os meios judiciais cíveis para reparação integral de danos patrimoniais e de reputação.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Política de Utilização Aceitável"
      subtitle="Regras de proteção da integridade da plataforma, salvaguarda de orçamentos e combate a falsificações em Angola."
      version="2.0"
      lastUpdated="29 de Setembro de 2026"
      documentType="Regulamento de Utilização Aceitável (AUP)"
      canonicalUrl="https://kizongelu.ao/utilizacao-aceitavel"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};

export default UtilizacaoAceitavelPage;
